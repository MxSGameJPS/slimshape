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

// Charts start empty and will be populated from the API
const vendasData = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"],
  datasets: [
    {
      label: "Vendas",
      data: [22000, 31000, 28000, 32000, 35000, 37000, 39000, 41000],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.1)",
      tension: 0.3,
      fill: true,
      pointRadius: 4,
    },
  ],
};

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

        // prepare genero dataset - keep ordering Feminino, Masculino, Outros
        const generoLabels = ["Feminino", "Masculino"];
        const generoVals = generoLabels.map((lab) => generoCounts[lab] || 0);
        // if there are other genders, add them
        const otherGenders = Object.keys(generoCounts).filter(
          (k) => !generoLabels.includes(k)
        );
        const generoLabelsFinal = [...generoLabels, ...otherGenders];
        const generoValsFinal = [
          ...generoVals,
          ...otherGenders.map((k) => generoCounts[k] || 0),
        ];

        setGeneroData({
          labels: generoLabelsFinal,
          datasets: [
            {
              data: generoValsFinal,
              backgroundColor: generoLabelsFinal.map((lab, i) =>
                i === 0 ? "#a5b4fc" : i === 1 ? "#6ee7b7" : "#c7c7c7"
              ),
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
          <div className={styles.cardValue}>3</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Planos Ativos <FaCalendarAlt className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>3</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Receita Mensal <FaChartLine className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>R$ 996</div>
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
