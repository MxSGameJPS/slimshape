"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { FaUserFriends } from "react-icons/fa";

function extractIndicou(p) {
  // tenta vários caminhos possíveis onde a propriedade pode existir
  if (!p) return "";
  if (typeof p.indicou === "string") return p.indicou;
  if (p.indicou && typeof p.indicou === "object") return JSON.stringify(p.indicou);
  if (p.raw && p.raw.indicou) return p.raw.indicou;
  // fallback: procurar por chaves parecidas
  if (p.indicacao) return p.indicacao;
  if (p.referido_por) return p.referido_por;
  return "";
}

export default function Indicacoes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://slimshapeapi.vercel.app/api/pacientes", { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Erro ao buscar pacientes: ${res.status} ${txt}`);
        }
        const json = await res.json();
        let arr = [];
        if (Array.isArray(json)) arr = json;
        else if (Array.isArray(json.data)) arr = json.data;
        else if (Array.isArray(json.pacientes)) arr = json.pacientes;
        else {
          // tenta achar primeiro array no corpo
          for (const k of Object.keys(json || {})) {
            if (Array.isArray(json[k])) {
              arr = json[k];
              break;
            }
          }
        }

        if (!mounted) return;
        setItems(arr.map((p) => ({ raw: p, indicou: extractIndicou(p) })));
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaUserFriends /> Indicações
      </h2>

      {loading && <div style={{ color: "#666" }}>Carregando indicações...</div>}
      {error && <div style={{ color: "#b91c1c" }}>Erro: {error}</div>}

      {!loading && !error && (
        <div>
          {items.length === 0 && (
            <div style={{ color: "#888" }}>Nenhuma indicação encontrada.</div>
          )}

          <div className={styles.pacientesGrid}>
            {items.map((it, idx) => (
              <div key={idx} className={styles.pacienteCard}>
                <div className={styles.pacienteCardHeader}>
                  <div className={styles.pacienteNome} style={{ fontWeight: 600 }}>
                    {it.raw.nome || it.raw.nomePaciente || it.raw.nome_completo || it.raw.usuario || "Paciente"}
                  </div>
                </div>
                <div className={styles.pacienteCardBody}>
                  <div style={{ marginBottom: 8, color: "#444" }}>
                    Indicou: <strong>{it.indicou || "-"}</strong>
                  </div>
                  <div style={{ color: "#666", fontSize: 12 }}>
                    ID: {it.raw.id ?? it.raw._id ?? "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
