"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../dashboard.module.css";
import { FaArrowLeft } from "react-icons/fa";

export default function PacienteDetalhe() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planoNome, setPlanoNome] = useState(null);
  // não exibimos JSON bruto: a visualização será sempre formatada

  // propriedades extras a exibir na seção "Informações adicionais"
  const adicionaisKeys = [
    "consentimento_telemedicina",
    "consentimento_lgpd",
    "historico_medico_pessoal",
    "historico_medico_familiar",
    "medicamentos",
    "suplementos",
    "motivo_consulta",
    "descricao_sintomas",
    "tempo_sintomas",
    "historico_peso",
    "habitos_alimentares",
    "atividade_fisica",
    "frequencia_atividade",
    "diagnosticos_anteriores",
    "historico_medico_pessoal_outros",
    "historico_medico_familiar_outros",
  ];

  function renderObject(obj) {
    if (obj === null || obj === undefined) return "-";
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "-";
      return (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {obj.map((it, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {typeof it === "object" ? renderObject(it) : String(it)}
            </li>
          ))}
        </ul>
      );
    }
    const entries = Object.entries(obj);
    if (entries.length === 0) return "-";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map(([k, v]) => (
          <div key={k}>
            <strong style={{ textTransform: "capitalize" }}>
              {k.replace(/_/g, " ")}:
            </strong>{" "}
            {typeof v === "object" ? renderObject(v) : String(v)}
          </div>
        ))}
      </div>
    );
  }

  function renderPretty(value) {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
    if (typeof value === "object") return renderObject(value);
    // tentar detectar JSON string e renderizar de forma amigável
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          return renderObject(parsed);
        } catch (e) {
          // não é JSON válido, cair para exibir a string
        }
      }
      return <div style={{ whiteSpace: "pre-wrap" }}>{value}</div>;
    }
    return String(value);
  }

  useEffect(() => {
    if (!id) return;
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

        const url = `/api/pacientes/${encodeURIComponent(id)}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Erro ${res.status}: ${txt}`);
        }
        const json = await res.json();
        if (mounted) setPaciente(json);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || "Erro ao carregar paciente");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id]);

  // derive plano name when paciente loads
  useEffect(() => {
    let mounted = true;
    async function resolvePlano() {
      if (!paciente) return;
      try {
        const p = paciente.plano;
        if (!p) {
          if (mounted) setPlanoNome(null);
          return;
        }
        // if already an object with nome
        if (typeof p === "object" && p !== null) {
          if (p.nome) {
            if (mounted) setPlanoNome(p.nome);
            return;
          }
          if (p.id) {
            // fallthrough to fetch planos by id
            // continue
          } else {
            if (mounted) setPlanoNome(null);
            return;
          }
        }

        // if p is a string that is not numeric, treat as name
        if (typeof p === "string" && !/^\d+$/.test(p)) {
          if (mounted) setPlanoNome(p);
          return;
        }

        const planoId = Number(p);
        if (Number.isNaN(planoId)) {
          if (mounted) setPlanoNome(null);
          return;
        }

        // fetch planos list and find by id
        const res = await fetch("https://slimshapeapi.vercel.app/api/planos");
        if (!res.ok) {
          if (mounted) setPlanoNome(null);
          return;
        }
        const planos = await res.json();
        const found = Array.isArray(planos)
          ? planos.find((x) => Number(x.id) === planoId)
          : null;
        if (mounted) setPlanoNome(found ? found.nome : null);
      } catch (err) {
        console.warn("resolvePlano error", err);
        if (mounted) setPlanoNome(null);
      }
    }
    resolvePlano();
    return () => (mounted = false);
  }, [paciente]);

  // tenta abrir arquivo externo: para PDFs fazemos fetch->blob para evitar problemas
  // com headers de Content-Disposition que forcem download; se fetch falhar, caímos
  // para window.open(url)
  async function openFile(e, url) {
    try {
      // permitir comportamento normal quando Ctrl/Cmd+click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      // tentativa rápida de fetch
      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("openFile: fetch não OK", {
          url,
          status: res.status,
          statusText: res.statusText,
          body: txt,
          wwwAuth: res.headers.get("www-authenticate"),
        });
        if (res.status === 401) {
          setError(
            "Erro 401 ao abrir o arquivo. A URL pode ser uma rota privada que exige autenticação. Verifique se está usando o secure_url público do Cloudinary ou gere um URL assinado pelo servidor."
          );
        }
        throw new Error("Fetch não OK");
      }
      const contentType = res.headers.get("content-type") || "";
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      // abrir em nova aba — comportamento antigo
      window.open(blobUrl, "_blank", "noopener");
      // revogar o blobURL depois de um tempo
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      // fallback simples
      try {
        console.warn("openFile: fallback para window.open", { url, err });
        window.open(url, "_blank", "noopener");
      } catch (e) {
        console.error("Não foi possível abrir o arquivo", e);
      }
    }
  }

  // função para forçar download do arquivo: fetch -> blob -> <a download>
  async function downloadFile(e, url) {
    try {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      // se for Cloudinary, usar o proxy local para evitar 401/CORS
      let fetchUrl = url;
      try {
        const parsed = new URL(url);
        if (parsed.hostname === "res.cloudinary.com") {
          fetchUrl = `/api/cloudinary-proxy?url=${encodeURIComponent(url)}`;
        }
      } catch (err) {
        /* ignore invalid url */
      }
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("downloadFile: fetch não OK", {
          url,
          status: res.status,
          body: txt,
        });
        if (res.status === 401) {
          setError(
            "Erro 401 ao baixar o arquivo. A URL pode ser privada ou bloqueada."
          );
        }
        throw new Error("Fetch não OK");
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = (url.split("/").pop() || "download").split("?")[0];
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      // necessário para Firefox
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.warn("downloadFile: fallback para abrir url", { url, err });
      try {
        // fallback: abrir a URL diretamente (servidor pode forçar download)
        window.open(url, "_blank", "noopener");
      } catch (e) {
        console.error("Não foi possível baixar/abrir o arquivo", e);
      }
    }
  }

  if (!id) return <div>Id do paciente não informado</div>;

  return (
    <div>
      <button className={styles.backButton} onClick={() => router.back()}>
        <FaArrowLeft /> Voltar
      </button>

      {loading && <div>Carregando...</div>}

      {error && <div style={{ color: "#c92a2a" }}>{error}</div>}

      {paciente && (
        <div className={styles.pacienteDetail}>
          <h2 className={styles.detailTitle}>
            {paciente.nome || paciente.nomePaciente || paciente.usuario}
          </h2>
          {planoNome ? (
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#eef2ff",
                  color: "#4f46e5",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Plano: {planoNome}
              </span>
            </div>
          ) : (
            <div style={{ marginTop: 8, color: "#6b7280" }}>
              Plano: não informado
            </div>
          )}

          <div className={styles.detailGrid}>
            <div className={styles.detailCol}>
              <div className={styles.detailRow}>
                <label>CPF / ID</label>
                <div>{paciente.cpf || paciente.id || "-"}</div>
              </div>
              <div className={styles.detailRow}>
                <label>Data de nascimento</label>
                <div>
                  {paciente.data_nascimento ||
                    paciente.dataNascimento ||
                    paciente.data ||
                    "-"}
                </div>
              </div>
              <div className={styles.detailRow}>
                <label>Gênero</label>
                <div>{paciente.genero || paciente.sexo || "-"}</div>
              </div>
            </div>

            <div className={styles.detailCol}>
              <div className={styles.detailRow}>
                <label>Telefone</label>
                <div>
                  {paciente.telefone ||
                    paciente.celular ||
                    paciente.phone ||
                    "-"}
                </div>
              </div>
              <div className={styles.detailRow}>
                <label>Email</label>
                <div>{paciente.email || "-"}</div>
              </div>
              <div className={styles.detailRow}>
                <label>Endereço</label>
                <div>
                  {paciente.endereco
                    ? `${paciente.endereco.logradouro || ""} ${
                        paciente.endereco.numero || ""
                      } ${paciente.endereco.bairro || ""} ${
                        paciente.endereco.cidade || ""
                      } ${paciente.endereco.estado || ""}`
                    : paciente.cidade || "-"}
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: 18 }}>Informações médicas</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailCol}>
              <div className={styles.detailRow}>
                <label>Peso atual</label>
                <div>{paciente.peso_atual || paciente.peso || "-"}</div>
              </div>
              <div className={styles.detailRow}>
                <label>Altura</label>
                <div>{paciente.altura || "-"}</div>
              </div>
            </div>
            <div className={styles.detailCol}>
              <div className={styles.detailRow}>
                <label>Medicamentos</label>
                <div>{paciente.medicamentos || paciente.medicacao || "-"}</div>
              </div>
              <div className={styles.detailRow}>
                <label>Alergias</label>
                <div>{paciente.alergias || "-"}</div>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: 18 }}>Arquivos</h3>
          <div className={styles.fileList}>
            {Array.isArray(paciente.exames_arquivos) &&
              paciente.exames_arquivos.length > 0 && (
                <div>
                  <strong>Exames:</strong>
                  <ul>
                    {paciente.exames_arquivos.map((u, i) => (
                      <li key={`ex-${i}`} className={styles.fileItem}>
                        {/\.(png|jpe?g|gif|webp)$/i.test(u) ? (
                          <a href={u} target="_blank" rel="noopener noreferrer">
                            <img
                              src={u}
                              alt="anexo"
                              style={{
                                width: 72,
                                height: 72,
                                objectFit: "cover",
                                marginRight: 8,
                                borderRadius: 6,
                              }}
                            />
                          </a>
                        ) : null}
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => downloadFile(e, u)}
                        >
                          {u.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {Array.isArray(paciente.diagnosticos_arquivos) &&
              paciente.diagnosticos_arquivos.length > 0 && (
                <div>
                  <strong>Diagnósticos:</strong>
                  <ul>
                    {paciente.diagnosticos_arquivos.map((u, i) => (
                      <li key={`dg-${i}`} className={styles.fileItem}>
                        {/\.(png|jpe?g|gif|webp)$/i.test(u) ? (
                          <a href={u} target="_blank" rel="noopener noreferrer">
                            <img
                              src={u}
                              alt="anexo"
                              style={{
                                width: 72,
                                height: 72,
                                objectFit: "cover",
                                marginRight: 8,
                                borderRadius: 6,
                              }}
                            />
                          </a>
                        ) : null}
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => downloadFile(e, u)}
                        >
                          {u.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Informações adicionais</h3>
          </div>
          {/* seção organizada com as propriedades solicitadas pelo usuário */}
          <div style={{ marginTop: 12 }}>
            <div className={styles.detailGrid}>
              {/* dividir em duas colunas */}
              <div className={styles.detailCol}>
                {adicionaisKeys
                  .filter((_, i) => i % 2 === 0)
                  .map((key) => (
                    <div className={styles.detailRow} key={key}>
                      <label style={{ textTransform: "capitalize" }}>
                        {key.replace(/_/g, " ")}
                      </label>
                      <div>{renderPretty(paciente[key])}</div>
                    </div>
                  ))}
              </div>
              <div className={styles.detailCol}>
                {adicionaisKeys
                  .filter((_, i) => i % 2 === 1)
                  .map((key) => (
                    <div className={styles.detailRow} key={key}>
                      <label style={{ textTransform: "capitalize" }}>
                        {key.replace(/_/g, " ")}
                      </label>
                      <div>{renderPretty(paciente[key])}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* JSON bruto removido por solicitação do usuário */}
        </div>
      )}
    </div>
  );
}
