"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { FaClipboardCheck } from "react-icons/fa";

export default function PlanosAtivos() {
  const [pacientes, setPacientes] = useState([]);
  const [planoMap, setPlanoMap] = useState({});
  const [priceMap, setPriceMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Buscar pacientes e planos em paralelo para calcular dias restantes
    Promise.all([
      fetch("https://slimshapeapi.vercel.app/api/pacientes"),
      fetch("https://slimshapeapi.vercel.app/api/planos"),
    ])
      .then(async ([rPac, rPlanos]) => {
        if (!mounted) return;
        const pacData = rPac.ok ? await rPac.json() : null;
        const planosData = rPlanos.ok ? await rPlanos.json() : null;

        // Extrair array de pacientes de forma flexível
        let arr = [];
        if (Array.isArray(pacData)) arr = pacData;
        else if (Array.isArray(pacData?.planos)) arr = pacData.planos;
        else if (Array.isArray(pacData?.pacientes)) arr = pacData.pacientes;
        else if (Array.isArray(pacData?.data)) arr = pacData.data;
        else if (Array.isArray(pacData?.items)) arr = pacData.items;
        else arr = [];

        // Montar mapa planoId -> duracao (em dias) e mapa de preco (preco default)
        const map = {};
        const pmap = {};
        if (Array.isArray(planosData)) {
          planosData.forEach((pl) => {
            const id =
              pl.id ??
              pl._id ??
              pl.planoId ??
              pl.id_plano ??
              pl.codigo ??
              pl.codigo_plano;
            const dur = pl.duracao ?? pl.duracaoDias ?? pl.duration ?? null;
            if (id != null && dur != null) map[String(id)] = Number(dur);

            // tentar extrair preco: se houver array pl.precos, pegar o que tiver duracao 30 ou o primeiro
            let preco = null;
            if (Array.isArray(pl.precos) && pl.precos.length > 0) {
              const p30 = pl.precos.find((x) =>
                String(x.duracao).includes("30")
              );
              preco = p30 ? p30.preco : pl.precos[0].preco;
            } else if (pl.preco != null) {
              preco = pl.preco;
            } else if (pl.price != null) {
              preco = pl.price;
            }
            if (id != null && preco != null) pmap[String(id)] = preco;
          });
        }

        setPacientes(arr);
        setPlanoMap(map);
        setPriceMap(pmap);
        // limpar statusMap quando recarregamos pacientes
        setStatusMap({});
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  // Quando pacientes mudam, buscar status de pagamento para cada paciente
  useEffect(() => {
    let mounted = true;
    if (!Array.isArray(pacientes) || pacientes.length === 0) return;

    pacientes.forEach((p) => {
      const pid = p.id ?? p._id ?? null;
      if (!pid) return;
      // já buscado?
      if (statusMap[pid]) return;
      (async () => {
        try {
          const res = await fetch(
            `https://slimshapeapi.vercel.app/api/pagamento-status?pacienteId=${encodeURIComponent(
              pid
            )}`,
            { cache: "no-store" }
          );
          if (!mounted) return;
          if (!res.ok) return;
          const js = await res.json();
          if (!mounted) return;
          if (js && js.status) {
            setStatusMap((s) => ({ ...s, [pid]: js.status }));
          }
        } catch (err) {
          // não bloquear UI em caso de erro
          console.warn("Falha ao obter status de pagamento para", pid, err);
        }
      })();
    });

    return () => (mounted = false);
  }, [pacientes]);

  const computeDaysRemaining = (createdRaw, planoId) => {
    if (!createdRaw) return null;
    const created = Date.parse(createdRaw);
    if (isNaN(created)) return null;
    const elapsedDays = Math.floor(
      (Date.now() - created) / (1000 * 60 * 60 * 24)
    );
    const dur = planoId ? planoMap[String(planoId)] : null;
    const duration = Number.isFinite(dur) ? dur : 30; // fallback 30 dias
    return Math.max(0, duration - elapsedDays);
  };

  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaClipboardCheck /> Planos Ativos
      </h2>
      <div className={styles.tableBox}>
        <div className={styles.tableTitle}>
          <FaClipboardCheck /> Planos Ativos
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>Carregando...</div>
        ) : error ? (
          <div style={{ padding: 20, color: "red" }}>Erro: {error}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Plano</th>
                <th>Dias Restantes</th>
                <th>Valor Mensal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                // Ordenar pacientes por dias restantes (decrescente)
                [...pacientes]
                  .map((p) => {
                    let maybeId = null;
                    try {
                      if (p && typeof p.plano === "object" && p.plano != null) {
                        maybeId = p.plano.id ?? p.plano._id ?? null;
                      }
                      if (!maybeId) {
                        if (p && typeof p.plano === "string") maybeId = p.plano;
                        else if (p && typeof p.plano === "number")
                          maybeId = String(p.plano);
                        else if (p && p.planoId) maybeId = p.planoId;
                        else if (p && p.plano_nome) maybeId = p.plano_nome;
                        else if (Array.isArray(p.plano) && p.plano[0])
                          maybeId = p.plano[0].id ?? p.plano[0]._id ?? null;
                      }
                    } catch (e) {
                      maybeId = null;
                    }
                    return { p, _planoId: maybeId };
                  })
                  .sort((a, b) => {
                    const da = computeDaysRemaining(
                      a.p.criado_em ??
                        a.p.criadoEm ??
                        a.p.created_at ??
                        a.p.createdAt ??
                        a.p.created ??
                        null,
                      a._planoId
                    );
                    const db = computeDaysRemaining(
                      b.p.criado_em ??
                        b.p.criadoEm ??
                        b.p.created_at ??
                        b.p.createdAt ??
                        b.p.created ??
                        null,
                      b._planoId
                    );
                    // nulls to the end
                    if (da == null && db == null) return 0;
                    if (da == null) return 1;
                    if (db == null) return -1;
                    return db - da; // decrescente
                  })
                  .map(({ p }) => {
                    const nome =
                      p.nome ||
                      p.name ||
                      (p.paciente && (p.paciente.nome || p.paciente.name)) ||
                      "-";
                    const planoField =
                      p.plano ??
                      p.planos ??
                      p.plano_nome ??
                      p.planoNome ??
                      null;
                    let plano = "-";
                    if (typeof planoField === "string") plano = planoField;
                    else if (typeof planoField === "number")
                      plano = String(planoField);
                    else if (Array.isArray(planoField))
                      plano = planoField
                        .map((x) => x.nome || x.name || x)
                        .join(", ");
                    else if (planoField && typeof planoField === "object")
                      plano = planoField.nome || planoField.name || "-";

                    const createdRaw =
                      p.criado_em ??
                      p.criadoEm ??
                      p.created_at ??
                      p.createdAt ??
                      p.created ??
                      null;
                    // extrair id do plano para buscar duracao
                    const planoId =
                      (p.plano != null &&
                        typeof p.plano === "object" &&
                        (p.plano.id || p.plano._id)) ||
                      p.plano ||
                      p.planoId ||
                      p.plano_nome ||
                      p.planoNome ||
                      null;
                    const daysRemaining = computeDaysRemaining(
                      createdRaw,
                      planoId
                    );
                    const diasText =
                      typeof daysRemaining === "number"
                        ? Math.max(0, daysRemaining) + " dias"
                        : "-";
                    // Priorizar status vindo do backend (statusMap) quando disponível
                    const pidForStatus = p.id ?? p._id ?? null;
                    const backendStatus = pidForStatus
                      ? statusMap[pidForStatus]
                      : null;
                    let status = "-";
                    if (backendStatus) {
                      // normalizar alguns valores comuns
                      const s = String(backendStatus).toLowerCase();
                      if (s === "ativo" || s === "active") status = "Ativo";
                      else if (s === "pendente" || s === "pending")
                        status = "Pendente";
                      else status = s.charAt(0).toUpperCase() + s.slice(1);
                    } else {
                      status =
                        typeof daysRemaining === "number"
                          ? daysRemaining > 0
                            ? "Ativo"
                            : "Não Ativo"
                          : "-";
                    }

                    // calcular valor do plano a partir do mapa de preços
                    let valorMensal = "";
                    try {
                      const pid =
                        (typeof p.plano === "object" &&
                          (p.plano.id || p.plano._id)) ||
                        p.plano ||
                        p.planoId ||
                        p.plano_nome ||
                        p.planoNome ||
                        null;
                      const raw = pid ? priceMap[String(pid)] : null;
                      if (raw != null) {
                        // normaliza string/number para formato BR
                        let n = Number(raw);
                        if (!Number.isFinite(n)) {
                          const s = String(raw)
                            .replace(/R?\$|\s|\./g, "")
                            .replace(/,/, ".");
                          n = Number(s);
                        }
                        if (Number.isFinite(n)) {
                          valorMensal = n.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 2,
                          });
                        }
                      }
                    } catch (e) {
                      valorMensal = "";
                    }

                    return (
                      <tr key={p.id || p._id || nome + String(Math.random())}>
                        <td>{nome}</td>
                        <td>{plano}</td>
                        <td>{diasText}</td>
                        <td>{valorMensal}</td>
                        <td>
                          <span
                            className={
                              status === "Ativo"
                                ? styles.statusAtivo
                                : styles.statusPendente
                            }
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
