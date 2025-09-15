"use client";
import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { FaUser, FaSyringe, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// vendasData será calculado a partir dos pacientes ativos e preços dos planos
function lastNMonthsLabels(n = 8) {
  const res = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    res.push(d.toLocaleString("pt-BR", { month: "short" }));
  }
  return res;
}

// estado para vendas (evolução mensal) será criado dentro do componente

export default function Analises() {
  const [estadosData, setEstadosData] = useState({
    labels: [],
    datasets: [
      {
        label: "Pacientes",
        data: [],
        backgroundColor: "#a5b4fc",
        borderRadius: 6,
      },
    ],
  });
  const [generoData, setGeneroData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  });
  const [idadeData, setIdadeData] = useState({
    labels: [],
    datasets: [
      {
        label: "Pacientes",
        data: [],
        backgroundColor: "#6ee7b7",
        borderRadius: 6,
      },
    ],
  });
  const [totalPacientes, setTotalPacientes] = useState(null);
  const [planosAtivosCount, setPlanosAtivosCount] = useState(null);
  const [receitaMensal, setReceitaMensal] = useState(null);
  const [vendasData, setVendasData] = useState({
    labels: lastNMonthsLabels(8),
    datasets: [
      {
        label: "Vendas",
        data: new Array(8).fill(0),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(
          "https://slimshapeapi.vercel.app/api/pacientes"
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(
            `fetch /api/pacientes failed status=${res.status} body=${txt}`
          );
        }
        const json = await res.json();
        console.log("Analises: /api/pacientes raw response:", json);

        // Helper: find first array inside object/tree
        function findFirstArray(obj) {
          if (!obj) return null;
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== "object") return null;
          for (const k of Object.keys(obj)) {
            try {
              const v = obj[k];
              if (Array.isArray(v)) return v;
              if (typeof v === "object") {
                const sub = findFirstArray(v);
                if (sub) return sub;
              }
            } catch (err) {
              // ignore
            }
          }
          return null;
        }

        const arr = Array.isArray(json)
          ? json
          : json.data || json.pacientes || findFirstArray(json) || [];

        // continue even if arr is empty so UI can show counts = 0
        console.log(
          "Analises: parsed pacientes array length=",
          (arr && arr.length) || 0
        );
        setLoadError(null);
        setLoading(false);

        // set total (allow zero)
        setTotalPacientes(arr.length || 0);

        // agora calcular planos ativos e receita mensal
        try {
          // buscar planos para mapping de preços
          const planosResp = await fetch(
            "https://slimshapeapi.vercel.app/api/planos"
          );
          const planosJson = planosResp.ok ? await planosResp.json() : null;
          let planosArr = [];
          if (Array.isArray(planosJson)) planosArr = planosJson;
          else if (Array.isArray(planosJson?.planos))
            planosArr = planosJson.planos;
          else if (Array.isArray(planosJson?.data)) planosArr = planosJson.data;

          const planoPriceMap = new Map();
          planosArr.forEach((pl) => {
            const pid = pl.id ?? pl._id ?? null;
            let preco = null;
            if (Array.isArray(pl.precos) && pl.precos.length > 0)
              preco = pl.precos[0].preco ?? pl.precos[0].valor ?? null;
            else preco = pl.preco ?? null;
            if (pid) planoPriceMap.set(String(pid), Number(preco ?? 0));
          });

          // checar status para cada paciente
          const checks = await Promise.all(
            (arr || []).map(async (p) => {
              try {
                const pid = p.id ?? p._id ?? null;
                if (!pid) return null;
                const r = await fetch(
                  `https://slimshapeapi.vercel.app/api/pagamento-status?pacienteId=${encodeURIComponent(
                    pid
                  )}`
                );
                if (!r.ok) return null;
                const js = await r.json();
                if (!js || !js.status) return null;
                const s = String(js.status).toLowerCase();
                if (s === "ativo" || s === "active") return p;
                return null;
              } catch (e) {
                return null;
              }
            })
          );

          const activePacientes = checks.filter(Boolean);
          setPlanosAtivosCount(activePacientes.length);

          let revenue = 0;
          activePacientes.forEach((p) => {
            let planoId = null;
            try {
              if (p.plano) {
                if (typeof p.plano === "string") planoId = p.plano;
                else if (typeof p.plano === "object")
                  planoId = p.plano.id ?? p.plano._id ?? null;
              }
            } catch (e) {
              planoId = null;
            }
            const preco = planoPriceMap.get(String(planoId)) ?? 0;
            revenue += Number(preco);
          });
          setReceitaMensal(revenue);

          // construir série de receita mensal para os últimos 8 meses
          try {
            const labels = lastNMonthsLabels(8);
            const now = new Date();
            const monthBuckets = new Array(8).fill(0);

            activePacientes.forEach((p) => {
              // pegar data de criação do paciente
              const createdRaw =
                p.criado_em ??
                p.criadoEm ??
                p.created_at ??
                p.createdAt ??
                p.created ??
                null;
              let createdDate = null;
              if (createdRaw) {
                const tmp = new Date(createdRaw);
                if (!isNaN(tmp)) createdDate = tmp;
              }
              // determinar bucket (mes/ano) se data válida
              if (createdDate) {
                for (let i = 0; i < 8; i++) {
                  const d = new Date(
                    now.getFullYear(),
                    now.getMonth() - (7 - i),
                    1
                  );
                  // se createdDate está no mesmo mês/ano de d
                  if (
                    createdDate.getFullYear() === d.getFullYear() &&
                    createdDate.getMonth() === d.getMonth()
                  ) {
                    let planoId = null;
                    try {
                      if (p.plano) {
                        if (typeof p.plano === "string") planoId = p.plano;
                        else if (typeof p.plano === "object")
                          planoId = p.plano.id ?? p.plano._id ?? null;
                      }
                    } catch (e) {
                      planoId = null;
                    }
                    const preco = planoPriceMap.get(String(planoId)) ?? 0;
                    monthBuckets[i] += Number(preco);
                    break;
                  }
                }
              }
            });

            setVendasData({
              labels,
              datasets: [
                {
                  label: "Vendas",
                  data: monthBuckets,
                  borderColor: "#6366f1",
                  backgroundColor: "rgba(99,102,241,0.1)",
                  tension: 0.3,
                  fill: true,
                  pointRadius: 4,
                },
              ],
            });
          } catch (e) {
            console.warn("Analises: erro ao construir series de vendas", e);
          }
        } catch (err) {
          console.warn("Analises: erro ao calcular planos ativos/receita", err);
        }

        // genero counts
        const generoCounts = {};
        // estado counts
        const estadoCounts = {};
        // idade buckets
        const ageBuckets = {
          "18-25": 0,
          "26-35": 0,
          "36-45": 0,
          "46-55": 0,
          "56+": 0,
        };

        const now = new Date();
        function parseBirthToAge(birth) {
          if (!birth) return null;
          // try to parse ISO first
          let d = null;
          // handle dd/mm/yyyy or dd-mm-yyyy
          const parts = String(birth)
            .trim()
            .split(/[\/\-\.]/);
          if (parts.length === 3) {
            // if first part length === 4, assume yyyy-mm-dd
            if (parts[0].length === 4) {
              d = new Date(parts[0], Number(parts[1]) - 1, parts[2]);
            } else {
              // dd/mm/yyyy
              d = new Date(
                Number(parts[2]),
                Number(parts[1]) - 1,
                Number(parts[0])
              );
            }
          } else {
            const tmp = new Date(birth);
            if (!isNaN(tmp)) d = tmp;
          }
          if (!d || isNaN(d)) return null;
          let age = now.getFullYear() - d.getFullYear();
          const m = now.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
          return age;
        }

        for (const p of arr) {
          const g = (p.genero || "").toString();
          if (g) generoCounts[g] = (generoCounts[g] || 0) + 1;
          const est = (p.estado || "").toString();
          if (est) estadoCounts[est] = (estadoCounts[est] || 0) + 1;
          const age = parseBirthToAge(p.data_nascimento);
          if (age !== null && !isNaN(age)) {
            if (age >= 18 && age <= 25) ageBuckets["18-25"]++;
            else if (age >= 26 && age <= 35) ageBuckets["26-35"]++;
            else if (age >= 36 && age <= 45) ageBuckets["36-45"]++;
            else if (age >= 46 && age <= 55) ageBuckets["46-55"]++;
            else if (age >= 56) ageBuckets["56+"]++;
          }
        }

        if (!mounted) return;

        // prepare genero dataset - normalize labels to avoid duplicates
        function normalizeGeneroLabel(raw) {
          if (!raw) return "Outros";
          const s = String(raw).trim().toLowerCase();
          if (s === "f" || s === "feminino" || s === "feminina")
            return "Feminino";
          if (s === "m" || s === "masculino" || s === "masculino")
            return "Masculino";
          // map common lowercase variants
          if (s === "masculino" || s === "masc") return "Masculino";
          if (s === "feminino" || s === "fem") return "Feminino";
          // title-case any other value
          return s.charAt(0).toUpperCase() + s.slice(1);
        }

        const generoNormCounts = {};
        for (const k of Object.keys(generoCounts)) {
          const norm = normalizeGeneroLabel(k);
          generoNormCounts[norm] =
            (generoNormCounts[norm] || 0) + generoCounts[k];
        }

        // preferred order Feminino, Masculino, then others
        const preferred = ["Feminino", "Masculino"];
        const others = Object.keys(generoNormCounts).filter(
          (k) => !preferred.includes(k)
        );
        const generoLabelsFinal = [
          ...preferred.filter((p) => generoNormCounts[p]),
          ...others,
        ];
        const generoValsFinal = generoLabelsFinal.map(
          (lab) => generoNormCounts[lab] || 0
        );

        // palette: distinct pastel colors, expand if needed
        const palette = [
          "#a5b4fc",
          "#6ee7b7",
          "#f59e0b",
          "#f973a6",
          "#60a5fa",
          "#9ca3af",
        ];
        const background = generoLabelsFinal.map(
          (_, i) => palette[i % palette.length]
        );

        setGeneroData({
          labels: generoLabelsFinal,
          datasets: [
            {
              data: generoValsFinal,
              backgroundColor: background,
              borderWidth: 0,
            },
          ],
        });

        // prepare estados dataset, sort by known states then by name
        const estadosLabels =
          Object.keys(estadoCounts).length > 0 ? Object.keys(estadoCounts) : [];
        const estadosVals = estadosLabels.map((s) => estadoCounts[s] || 0);
        setEstadosData({
          labels: estadosLabels,
          datasets: [
            {
              label: "Pacientes",
              data: estadosVals,
              backgroundColor: "#a5b4fc",
              borderRadius: 6,
            },
          ],
        });

        // idade
        setIdadeData({
          labels: Object.keys(ageBuckets),
          datasets: [
            {
              label: "Pacientes",
              data: Object.values(ageBuckets),
              backgroundColor: "#6ee7b7",
              borderRadius: 6,
            },
          ],
        });
      } catch (err) {
        console.warn("Analises: failed to load pacientes", err);
        setLoadError(err && err.message ? String(err.message) : String(err));
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaChartLine /> Análises
      </h2>
      {loading && (
        <div style={{ padding: 12, color: "#444" }}>
          Carregando dados de pacientes...
        </div>
      )}
      {loadError && (
        <div style={{ padding: 12, color: "#b91c1c" }}>
          Erro ao carregar dados: {loadError}
        </div>
      )}
      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Total de Pacientes <FaUser className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{totalPacientes ?? 6}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Injeções Ativas <FaSyringe className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{planosAtivosCount ?? "..."}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Planos Ativos <FaCalendarAlt className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>{planosAtivosCount ?? "..."}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Receita Mensal <FaChartLine className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>
            {receitaMensal == null
              ? "..."
              : `R$ ${receitaMensal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`}
          </div>
        </div>
      </div>
      <div className={styles.analisesGrid}>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Pacientes por Estado</div>
          <div className={styles.analiseChart}>
            <Bar
              data={estadosData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Distribuição por Gênero</div>
          <div className={styles.analiseChart}>
            <Pie
              data={generoData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#6366f1", font: { size: 14 } },
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Distribuição por Idade</div>
          <div className={styles.analiseChart}>
            <Bar
              data={idadeData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Evolução de Vendas</div>
          <div className={styles.analiseChart}>
            <Line
              data={vendasData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
      </div>
    </>
  );
}
