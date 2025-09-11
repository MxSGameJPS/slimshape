"use client";

import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { FaClipboardCheck } from "react-icons/fa";

export default function PlanosAtivos() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("https://slimshapeapi.vercel.app/api/pacientes")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // Extrair array de pacientes de forma flexível
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.planos)) arr = data.planos;
        else if (Array.isArray(data.pacientes)) arr = data.pacientes;
        else if (Array.isArray(data.data)) arr = data.data;
        else if (Array.isArray(data.items)) arr = data.items;
        else arr = [];
        setPacientes(arr);
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

  const computeDaysRemaining = (createdRaw) => {
    if (!createdRaw) return null;
    const created = Date.parse(createdRaw);
    if (isNaN(created)) return null;
    const elapsedDays = Math.floor(
      (Date.now() - created) / (1000 * 60 * 60 * 24)
    );
    return 30 - elapsedDays;
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
                pacientes.map((p) => {
                  const nome =
                    p.nome ||
                    p.name ||
                    (p.paciente && (p.paciente.nome || p.paciente.name)) ||
                    "-";
                  const planoField =
                    p.plano ?? p.planos ?? p.plano_nome ?? p.planoNome ?? null;
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
                  const daysRemaining = computeDaysRemaining(createdRaw);
                  const diasText =
                    typeof daysRemaining === "number"
                      ? Math.max(0, daysRemaining) + " dias"
                      : "-";
                  const status =
                    typeof daysRemaining === "number"
                      ? daysRemaining > 0
                        ? "Ativo"
                        : "Não Ativo"
                      : "-";

                  const valorMensal = "R$ 199"; // fallback estático por enquanto

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
