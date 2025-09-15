import styles from "../dashboard.module.css";
import {
  FaUser,
  FaSyringe,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardCheck,
} from "react-icons/fa";
import Injetaveis from "./Injetaveis";
import PlanosAtivos from "./PlanosAtivos";
import React, { useEffect, useState } from "react";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [planosAtivosCount, setPlanosAtivosCount] = useState(0);
  const [receitaMensal, setReceitaMensal] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [pacRes, planosRes] = await Promise.all([
          fetch("https://slimshapeapi.vercel.app/api/pacientes", {
            cache: "no-store",
          }),
          fetch("https://slimshapeapi.vercel.app/api/planos", {
            cache: "no-store",
          }),
        ]);

        const pacJson = pacRes.ok ? await pacRes.json() : null;
        const planosJson = planosRes.ok ? await planosRes.json() : null;

        // extrair arrays
        let pacientesArr = [];
        if (Array.isArray(pacJson)) pacientesArr = pacJson;
        else if (Array.isArray(pacJson?.pacientes))
          pacientesArr = pacJson.pacientes;
        else if (Array.isArray(pacJson?.data)) pacientesArr = pacJson.data;

        let planosArr = [];
        if (Array.isArray(planosJson)) planosArr = planosJson;
        else if (Array.isArray(planosJson?.planos))
          planosArr = planosJson.planos;
        else if (Array.isArray(planosJson?.data)) planosArr = planosJson.data;

        if (!mounted) return;

        setTotalPacientes(pacientesArr.length);

        // montar mapa de preco por planoId
        const planoPriceMap = new Map();
        planosArr.forEach((pl) => {
          const pid = pl.id ?? pl._id ?? null;
          let preco = null;
          if (Array.isArray(pl.precos) && pl.precos.length > 0)
            preco = pl.precos[0].preco ?? pl.precos[0].valor ?? null;
          else preco = pl.preco ?? null;
          if (pid) planoPriceMap.set(String(pid), Number(preco ?? 0));
        });

        // Para cada paciente, checar pagamento-status e somar receita se ativo
        const checks = await Promise.all(
          pacientesArr.map(async (p) => {
            try {
              const pid = p.id ?? p._id ?? null;
              if (!pid) return null;
              const r = await fetch(
                `https://slimshapeapi.vercel.app/api/pagamento-status?pacienteId=${encodeURIComponent(
                  pid
                )}`,
                { cache: "no-store" }
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
        const count = activePacientes.length;
        let revenue = 0;
        activePacientes.forEach((p) => {
          // extrair plano id
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

        setPlanosAtivosCount(count);
        setReceitaMensal(revenue);
      } catch (err) {
        console.error("Erro ao carregar métricas do dashboard:", err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <h2 className={styles.pageTitle}>Visão Geral</h2>
      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Total de Pacientes <FaUser className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>
            {loading ? "..." : totalPacientes}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Injeções Ativas <FaSyringe className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>
            {loading ? "..." : planosAtivosCount}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Planos Ativos <FaCalendarAlt className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>
            {loading ? "..." : planosAtivosCount}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Receita Mensal <FaChartLine className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>
            {loading
              ? "..."
              : `R$ ${receitaMensal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`}
          </div>
        </div>
      </div>

      <div className={styles.tablesRow}>
        <div className={styles.tableBox}>
          <Injetaveis />
        </div>
        <div className={styles.tableBox}>
          <PlanosAtivos />
        </div>
      </div>
    </>
  );
}
