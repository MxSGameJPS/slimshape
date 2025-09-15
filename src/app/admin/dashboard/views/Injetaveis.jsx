import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { FaSyringe } from "react-icons/fa";

export default function Injetaveis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ativos, setAtivos] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // buscar planos e pacientes em paralelo
        const [planosRes, pacRes] = await Promise.all([
          fetch("https://slimshapeapi.vercel.app/api/planos", {
            cache: "no-store",
          }),
          fetch("https://slimshapeapi.vercel.app/api/pacientes", {
            cache: "no-store",
          }),
        ]);

        const planosJson = planosRes.ok ? await planosRes.json() : null;
        const pacJson = pacRes.ok ? await pacRes.json() : null;

        // construir mapa de planos: id -> { duracao, preco }
        let planosArr = [];
        if (Array.isArray(planosJson)) planosArr = planosJson;
        else if (Array.isArray(planosJson?.planos))
          planosArr = planosJson.planos;
        else if (Array.isArray(planosJson?.data)) planosArr = planosJson.data;

        const planoMap = new Map();
        planosArr.forEach((pl) => {
          const pid = pl.id ?? pl._id ?? pl._key ?? null;
          // pl.precos pode ser array ou objeto
          let duracao = pl.duracao ?? null;
          let preco = null;
          if (Array.isArray(pl.precos) && pl.precos.length > 0) {
            // pegar o primeiro preco como referência
            preco = pl.precos[0].preco ?? pl.precos[0].valor ?? null;
            duracao = duracao ?? pl.precos[0].duracao ?? null;
          } else if (pl.preco) {
            preco = pl.preco;
          }
          if (pid) planoMap.set(String(pid), { duracao, preco });
        });

        // extrair array de pacientes de forma flexível
        let arr = [];
        if (Array.isArray(pacJson)) arr = pacJson;
        else if (Array.isArray(pacJson?.pacientes)) arr = pacJson.pacientes;
        else if (Array.isArray(pacJson?.data)) arr = pacJson.data;
        else if (Array.isArray(pacJson?.items)) arr = pacJson.items;

        // buscar status para cada paciente em paralelo
        const checks = await Promise.all(
          arr.map(async (p) => {
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
              if (s === "ativo" || s === "active")
                return { paciente: p, status: js.status };
              return null;
            } catch (e) {
              return null;
            }
          })
        );

        if (!mounted) return;
        const activeOnly = checks.filter(Boolean).map((x) => x.paciente);

        // enriquecer pacientes com info do plano encontrada em planoMap
        const enriched = activeOnly.map((p) => {
          // extrair plano id do paciente (p.plano pode ser objeto ou string)
          let planoId = null;
          try {
            if (p.plano) {
              if (typeof p.plano === "string") planoId = p.plano;
              else if (typeof p.plano === "object")
                planoId = p.plano.id ?? p.plano._id ?? p.plano.planoId ?? null;
            }
          } catch (e) {
            planoId = null;
          }
          const planoInfo = planoMap.get(String(planoId)) ?? null;
          return { ...p, planoInfo };
        });

        setAtivos(enriched);
      } catch (err) {
        if (!mounted) return;
        setError(String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaSyringe /> Injeções
      </h2>
      <div className={styles.tableBox}>
        <div className={styles.tableTitle}>
          <FaSyringe /> Vendas de Injeções de Emagrecimento
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
                <th>Quantidade</th>
                <th>Frequência</th>
                <th>Data da Compra</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ativos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                    Nenhum paciente com plano ativo encontrado
                  </td>
                </tr>
              ) : (
                ativos.map((p) => {
                  const nome = p.nome || p.name || "-";
                  const created =
                    p.criado_em ??
                    p.criadoEm ??
                    p.created_at ??
                    p.createdAt ??
                    p.created ??
                    null;
                  const dateText = created
                    ? new Date(created).toLocaleDateString("pt-BR")
                    : "-";

                  // quantidade a partir de planoInfo.duracao: 30 -> 1x, 90 -> 3x, 180 -> 6x
                  const duracao = p.planoInfo?.duracao ?? null;
                  let quantidadeText = "-";
                  if (duracao) {
                    const d = Number(duracao);
                    if (d === 30) quantidadeText = "1x";
                    else if (d === 90) quantidadeText = "3x";
                    else if (d === 180) quantidadeText = "6x";
                    else {
                      // tentar mapear proporcionalmente (30 dias = 1x)
                      const factor = Math.round(d / 30);
                      quantidadeText = `${factor}x`;
                    }
                  }

                  const frequenciaText = "Mensal";

                  const preco = p.planoInfo?.preco ?? p.preco ?? null;
                  const precoText = preco
                    ? `R$ ${Number(preco).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    : "-";

                  return (
                    <tr key={p.id || p._id || nome}>
                      <td>{nome}</td>
                      <td>{quantidadeText}</td>
                      <td>{frequenciaText}</td>
                      <td>{dateText}</td>
                      <td>{precoText}</td>
                      <td>
                        <span className={styles.statusPendente}>
                          Em andamento
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
