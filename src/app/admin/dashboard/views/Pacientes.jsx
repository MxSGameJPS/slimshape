"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import { FaFolderOpen } from "react-icons/fa";

function initialsFromName(name) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("pt-BR");
  } catch (e) {
    return dateStr;
  }
}

function mapPaciente(p) {
  // tenta mapear os campos mais prováveis do backend para o formato do card
  const nome = p.nome || p.nomePaciente || p.nome_completo || p.usuario || "--";
  const idade =
    p.idade ||
    p.age ||
    (p.dataNascimento
      ? (() => {
          try {
            const y = new Date(p.dataNascimento).getFullYear();
            return new Date().getFullYear() - y;
          } catch {
            return undefined;
          }
        })()
      : undefined);
  const sexo = p.sexo || p.genero || p.gender || "";
  const cidade =
    p.cidade ||
    (p.endereco
      ? `${p.endereco.cidade || ""}, ${p.endereco.estado || ""}`
      : p.cidade_estado) ||
    "";
  const data =
    p.dataCadastro || p.data || p.dataNascimento || p.createdAt || "";
  const plano = p.plano || p.plano_nome || p.plan || "--";
  const sigla = initialsFromName(nome);

  return {
    nome,
    idade,
    sexo,
    cidade,
    data: formatDate(data),
    plano,
    sigla,
    raw: p,
  };
}

import { useRouter } from "next/navigation";

export default function Pacientes() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("adminToken")
            : null;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Chama o backend remoto diretamente. Podemos trocar por um proxy interno
        // se você preferir evitar CORS/ambiguidade de ambiente.
        const url = "https://slimshapeapi.vercel.app/api/pacientes";
        const res = await fetch(url, { headers });
        const contentType = res.headers.get("content-type") || "";

        // Se o servidor respondeu com HTML (página de erro), lê como texto e lança erro legível
        if (contentType.includes("text/html")) {
          const txt = await res.text();
          throw new Error(
            `Resposta HTML (status ${res.status}). Possível rota incorreta ou erro no servidor.`
          );
        }

        if (!res.ok) {
          // tenta parsear JSON de erro para mensagem
          let body = "";
          try {
            const j = await res.json();
            body = j.message || j.error || JSON.stringify(j);
          } catch (e) {
            body = await res.text();
          }
          throw new Error(`Erro ${res.status}: ${body}`);
        }

        const json = await res.json();
        let arr = [];
        if (Array.isArray(json)) arr = json;
        else if (Array.isArray(json.data)) arr = json.data;
        else if (Array.isArray(json.pacientes)) arr = json.pacientes;
        else arr = [];

        const mapped = arr.map(mapPaciente);
        if (mounted) {
          setPacientes(mapped);
          setTotal(json.total || mapped.length);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || "Erro ao carregar pacientes");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaFolderOpen /> Pacientes
      </h2>
      <div style={{ color: "#8d99ae", marginBottom: 16 }}>
        {loading
          ? "Carregando pacientes..."
          : `Total de ${total} pacientes cadastrados`}
      </div>

      {error && (
        <div style={{ color: "#c92a2a", marginBottom: 12 }}>{error}</div>
      )}

      <div className={styles.pacientesGrid}>
        {pacientes.map((p) => {
          const id = p.raw?.id || p.raw?.cpf || encodeURIComponent(p.nome);
          return (
            <div
              className={styles.pacienteCard}
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/admin/dashboard/pacientes/${id}`)}
              onKeyPress={(e) => {
                if (e.key === "Enter")
                  router.push(`/admin/dashboard/pacientes/${id}`);
              }}
            >
              <div className={styles.pacienteCardHeader}>
                <FaFolderOpen className={styles.pacienteIcon} />
                <span className={styles.pacienteNome}>{p.nome}</span>
              </div>
              <div className={styles.pacienteCardBody}>
                <div className={styles.pacienteSigla}>{p.sigla}</div>
                <div className={styles.pacienteInfo}>
                  {p.idade} anos • {p.sexo}
                </div>
                <div className={styles.pacienteInfo}>📍 {p.cidade}</div>
                <div className={styles.pacienteInfo}>📅 {p.data}</div>
              </div>
              <div
                className={
                  styles.pacientePlano +
                  " " +
                  (p.plano === "Premium" ? styles.premium : styles.basic)
                }
              >
                {p.plano}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
