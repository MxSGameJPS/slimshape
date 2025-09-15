"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import styles from "./modal.module.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeartbeat,
  FaUser,
} from "react-icons/fa";

// Top-level stable components to avoid remounts when declared inside the
// ModalAvaliacao function.
function ModalHeader({ step, stepIcons, stepTitles, onClose }) {
  return (
    <div className={styles.modalHeader}>
      <div className={styles.modalTitle}>
        {stepIcons[step - 1]} {stepTitles[step - 1]}
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

function ModalProgress({ step, progressPercents }) {
  return (
    <div className={styles.modalProgress}>
      <span className={styles.modalProgressText}>Etapa {step} de 6</span>
      <div className={styles.modalProgressBarWrap}>
        <div className={styles.modalProgressBarBg}>
          <div
            className={styles.modalProgressBarFg}
            style={{ width: `${progressPercents[step - 1]}%` }}
          ></div>
        </div>
      </div>
      <span className={styles.modalProgressPercent}>
        {step === 6 ? "100% concluído" : `${progressPercents[step - 1]}%`}
      </span>
    </div>
  );
}

function ModalDivider() {
  return <div className={styles.modalDivider}></div>;
}

function ModalCard({ children }) {
  return <div className={styles.modalCard}>{children}</div>;
}

function ModalFooter({
  onPrev,
  onNext,
  isLast,
  isFirst,
  nextLabel,
  prevLabel,
  disabled,
}) {
  return (
    <div className={styles.modalFooter}>
      <button
        type="button"
        className={styles.btnSec}
        onClick={onPrev}
        disabled={isFirst}
      >
        <FaChevronLeft /> {prevLabel || "Anterior"}
      </button>
      <button
        type="submit"
        className={isLast ? styles.btnFinal : styles.btnPri}
        disabled={disabled}
      >
        {isLast ? (
          <>
            Enviar Avaliação{" "}
            <span style={{ fontSize: 20, marginLeft: 8 }}>✔️</span>
          </>
        ) : (
          <>
            Próximo <FaChevronRight />
          </>
        )}
      </button>
    </div>
  );
}

// Controlled input with local state to avoid DOM replacement and caret loss
const InputControlled = React.memo(
  React.forwardRef(function InputControlled(
    { name, value, setFormData, placeholder, required, type = "text", ...rest },
    ref
  ) {
    const [local, setLocal] = React.useState(value ?? "");
    React.useEffect(() => {
      setLocal(value ?? "");
    }, [value]);
    return (
      <input
        {...rest}
        ref={ref}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        value={local}
        onChange={(e) => {
          const v = e.target.value;
          setLocal(v);
          // sync up to parent state
          setFormData((prev) => ({
            ...prev,
            [name]: v !== undefined && v !== null ? String(v) : "",
          }));
        }}
      />
    );
  })
);

function ModalAvaliacao({
  open,
  onClose,
  formData,
  setFormData,
  step,
  setStep,
}) {
  // Estados para arquivos locais
  const [examesFiles, setExamesFiles] = useState([]);
  const [diagFiles, setDiagFiles] = useState([]);
  // Estados para URLs dos arquivos no Cloudinary
  const [examesUrls, setExamesUrls] = useState([]);
  const [diagUrls, setDiagUrls] = useState([]);
  const examesInputRef = useRef(null);
  const diagInputRef = useRef(null);
  const renderCountRef = useRef(0);
  const modalContentRef = useRef(null);
  const nomeInputRef = useRef(null);
  const dataNascInputRef = useRef(null);
  const prevNomeNodeRef = useRef(null);
  const prevDataNascNodeRef = useRef(null);
  // estados para upload/progresso
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    console.log("ModalAvaliacao mounted");
    return () => console.log("ModalAvaliacao unmounted");
  }, []);

  // increment render counter on every render
  renderCountRef.current += 1;
  // small log to see renders; will show in browser console
  console.log(
    "ModalAvaliacao render #",
    renderCountRef.current,
    "open=",
    open,
    "step=",
    step
  );

  // Helper: comprime imagens para reduzir upload (usa canvas)
  async function compressImageFile(file, maxWidth = 1600, quality = 0.82) {
    try {
      if (!file.type.startsWith("image/")) return file;
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(1, maxWidth / bitmap.width);
      const width = Math.round(bitmap.width * ratio);
      const height = Math.round(bitmap.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, width, height);
      // prefer jpeg for compression if original is png and not transparent
      const mime = file.type === "image/png" ? "image/jpeg" : file.type;
      const blob = await new Promise((res) =>
        canvas.toBlob(res, mime, quality)
      );
      if (!blob) return file;
      // manter nome e tipo coerente
      return new File([blob], file.name.replace(/\.png$/i, ".jpg"), {
        type: blob.type,
      });
    } catch (err) {
      console.warn("compressImageFile failed, using original", err);
      return file;
    }
  }

  // Helper: upload único com progresso usando XMLHttpRequest
  function uploadSingleWithProgress(file, onProgress) {
    return new Promise(async (resolve, reject) => {
      const start = Date.now();
      const keyLog = `${file.name}-${file.size}-${file.lastModified}`;
      console.log("uploadSingleWithProgress start", keyLog);
      try {
        const resourceType =
          file.type && file.type.startsWith("image/") ? "image" : "raw";
        // Only compress very large images to avoid delaying typical uploads
        // (set high threshold so 2MB files are NOT compressed)
        const shouldCompress =
          resourceType === "image" && file.size > 5_000_000; // 5MB
        const fileToSend = shouldCompress
          ? await compressImageFile(file)
          : file;

        if (shouldCompress)
          console.log(
            "compressed",
            keyLog,
            "origSize",
            file.size,
            "newType",
            fileToSend.type,
            "newSize",
            fileToSend.size
          );

        const fd = new FormData();
        fd.append("file", fileToSend);
        fd.append("upload_preset", "slimshape_unsigned");
        fd.append("resource_type", resourceType);

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          "https://api.cloudinary.com/v1_1/slimshape/auto/upload"
        );
        xhr.upload.onprogress = (e) => {
          try {
            // log raw progress for diagnostics (loaded/total may be undefined)
            console.log(
              "upload progress",
              keyLog,
              "loaded",
              e.loaded,
              "total",
              e.total
            );
            if (e.lengthComputable && typeof onProgress === "function") {
              const pct = Math.round((e.loaded / e.total) * 100);
              onProgress(pct);
            }
          } catch (err) {
            console.warn("progress handler error", err);
          }
        };
        // set a reasonable timeout (120s) to avoid hanging uploads
        xhr.timeout = 120000;
        xhr.ontimeout = () => {
          console.log("upload timeout", keyLog);
          reject(new Error("upload timeout"));
        };
        xhr.onload = () => {
          const took = Date.now() - start;
          console.log(
            "uploadSingleWithProgress done",
            keyLog,
            "status",
            xhr.status,
            "took_ms",
            took
          );
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ url: data.secure_url, data });
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`upload failed status ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          console.log("uploadSingleWithProgress network error", keyLog);
          reject(new Error("network error"));
        };
        xhr.send(fd);
      } catch (err) {
        console.log("uploadSingleWithProgress exception", keyLog, err);
        reject(err);
      }
    });
  }

  // Função para upload de múltiplos arquivos para Cloudinary (paralelo com progresso)
  async function uploadFilesToCloudinary(files, setUrls) {
    setIsUploading(true);
    setUploadProgress((p) => ({ ...p }));
    const urls = [];
    // concurrency limit
    const CONCURRENCY = 3;
    const queue = files.slice();
    const running = [];

    function next() {
      if (queue.length === 0) return Promise.resolve();
      const file = queue.shift();
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      const p = uploadSingleWithProgress(file, (pct) => {
        setUploadProgress((prev) => ({ ...prev, [key]: pct }));
      })
        .then((res) => ({ key, url: res.url }))
        .catch((err) => {
          console.error("uploadSingleWithProgress error", file.name, err);
          setUploadProgress((prev) => ({ ...prev, [key]: -1 }));
          return { key, url: null };
        })
        .finally(() => {
          // remove from running
          const idx = running.indexOf(p);
          if (idx >= 0) running.splice(idx, 1);
        });

      running.push(p);
      let r = Promise.resolve();
      if (running.length >= CONCURRENCY) {
        // wait for any to finish
        r = Promise.race(running);
      }
      return r
        .then(() => p)
        .then((res) => {
          if (res && res.url) urls.push(res.url);
          return next();
        });
    }

    try {
      // start initial workers
      const starters = [];
      for (let i = 0; i < CONCURRENCY && i < files.length; i++)
        starters.push(next());
      await Promise.all(starters);
      setUrls(urls);
    } finally {
      setIsUploading(false);
    }
  }

  function handleNext(e) {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, 6));
  }
  function handlePrev(e) {
    e.preventDefault();
    setStep((s) => Math.max(s - 1, 1));
  }

  // Handlers para inputs controlados
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      console.log(
        "handleInputChange ->",
        name,
        "=",
        type === "checkbox" ? checked : value
      );
      if (type === "checkbox" && e.target.dataset.group) {
        // Checkbox de grupo (array)
        const group = e.target.dataset.group;
        setFormData((prev) => {
          const arr = Array.isArray(prev[group]) ? prev[group] : [];
          if (checked) {
            return { ...prev, [group]: [...arr, value] };
          } else {
            return { ...prev, [group]: arr.filter((v) => v !== value) };
          }
        });
      } else if (type === "checkbox") {
        setFormData((prev) => ({ ...prev, [name]: !!checked }));
      } else {
        // Sempre string para inputs normais
        setFormData((prev) => ({
          ...prev,
          [name]: value !== undefined && value !== null ? String(value) : "",
        }));
      }
    },
    [setFormData]
  );
  function handleExamesClick() {
    if (examesInputRef.current) examesInputRef.current.click();
  }
  function handleDiagClick() {
    if (diagInputRef.current) diagInputRef.current.click();
  }
  function handleExamesChange(e) {
    const files = Array.from(e.target.files);
    setExamesFiles(files);
    if (files.length > 0) uploadFilesToCloudinary(files, setExamesUrls);
  }
  function handleDiagChange(e) {
    const files = Array.from(e.target.files);
    setDiagFiles(files);
    if (files.length > 0) uploadFilesToCloudinary(files, setDiagUrls);
  }

  // Log de foco genérico para diagnóstico
  useEffect(() => {
    const el = modalContentRef.current;
    if (!el) return;
    function onFocusIn(e) {
      const name = e.target && e.target.name ? e.target.name : e.target.tagName;
      console.log("focusin ->", name, "render#", renderCountRef.current);
    }
    function onFocusOut(e) {
      const name = e.target && e.target.name ? e.target.name : e.target.tagName;
      console.log("focusout ->", name, "render#", renderCountRef.current);
    }
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Debug: check if the actual DOM node for key inputs changes between renders
  useEffect(() => {
    try {
      const active = document && document.activeElement;
      const activeName =
        active && active.name ? active.name : active && active.tagName;
      console.log(
        "activeElement ->",
        activeName,
        "render#",
        renderCountRef.current
      );

      if (
        prevNomeNodeRef.current &&
        prevNomeNodeRef.current !== nomeInputRef.current
      ) {
        console.log("nome input NODE CHANGED", {
          prev: prevNomeNodeRef.current,
          now: nomeInputRef.current,
          render: renderCountRef.current,
        });
      }
      if (
        prevDataNascNodeRef.current &&
        prevDataNascNodeRef.current !== dataNascInputRef.current
      ) {
        console.log("data_nascimento input NODE CHANGED", {
          prev: prevDataNascNodeRef.current,
          now: dataNascInputRef.current,
          render: renderCountRef.current,
        });
      }

      prevNomeNodeRef.current = nomeInputRef.current;
      prevDataNascNodeRef.current = dataNascInputRef.current;
    } catch (err) {
      console.log("debug effect error", err);
    }
  });

  // Funções auxiliares para título, progresso e divisores
  const stepTitles = useMemo(
    () => [
      "Dados Pessoais",
      "Histórico de Saúde",
      "Queixa Principal",
      "Avaliação do Paciente",
      "Avaliação do Paciente",
      "Avaliação do Paciente",
    ],
    []
  );
  const stepIcons = useMemo(
    () => [
      <FaUser key="user" />, // 1
      <FaHeartbeat key="heart" />, // 2
      <span key="q" style={{ fontSize: "1.2em", marginRight: 6 }}>
        📝
      </span>, // 3
      <span key="nutri" role="img" aria-label="nutri">
        ⚖️
      </span>, // 4
      <span key="diag" role="img" aria-label="diagnóstico">
        🩺
      </span>, // 5
      <span key="termos" role="img" aria-label="termos">
        📝
      </span>, // 6
    ],
    []
  );
  const stepSubtitles = useMemo(
    () => [
      "Preencha seus dados para começarmos sua avaliação",
      "Informações sobre seu histórico médico e familiar",
      "Conte-nos sobre o que te trouxe aqui hoje",
      "Informações sobre seu peso, alimentação e atividade física",
      "Informações sobre exames recentes e diagnósticos anteriores",
      "Leia e aceite os termos para finalizar sua avaliação",
    ],
    []
  );
  const progressPercents = useMemo(() => [17, 33, 50, 67, 83, 100], []);

  // Converte datas em formatos comuns BR para ISO (YYYY-MM-DD)
  // Aceita: "09041988", "09/04/1988", "09-04-1988", ou já em ISO retorna como está.
  function formatDateBRtoISO(dataBR) {
    if (!dataBR) return "";
    const s = String(dataBR).trim();
    // se já parece ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // sem separadores: DDMMYYYY
    if (/^\d{8}$/.test(s)) {
      return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
    }
    // com separadores / ou -: DD/MM/YYYY ou DD-MM-YYYY
    const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}`;
    }
    // fallback: tenta criar Date e formatar
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    }
    // se nada der certo, retorna string original para que backend valide
    return s;
  }

  // ...existing code...

  // Renderização principal
  return (
    <div
      className={styles.modalOverlay}
      style={{ display: open ? "flex" : "none" }}
    >
      <div className={styles.modalContent} ref={modalContentRef}>
        <ModalHeader
          step={step}
          stepIcons={stepIcons}
          stepTitles={stepTitles}
          onClose={onClose}
        />
        <ModalProgress step={step} progressPercents={progressPercents} />
        <ModalDivider />
        <div className={styles.modalBody}>
          <ModalCard>
            {/* ... todo o conteúdo dos steps permanece igual ... */}
            {step === 1 && (
              <form
                className={styles.form}
                onSubmit={handleNext}
                autoComplete="off"
              >
                <div className={styles.cardDesc}>{stepSubtitles[0]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Nome Completo *</label>
                    <InputControlled
                      ref={nomeInputRef}
                      name="nome"
                      placeholder="Seu nome completo"
                      required
                      value={formData.nome}
                      setFormData={setFormData}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Data de Nascimento *</label>
                    <InputControlled
                      ref={dataNascInputRef}
                      name="data_nascimento"
                      placeholder="dd/mm/aaaa"
                      required
                      value={formData.data_nascimento}
                      setFormData={setFormData}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Gênero *</label>
                    <select
                      name="genero"
                      required
                      value={formData.genero}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione seu gênero</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className={styles.col}>
                    <label>CPF *</label>
                    <input
                      type="text"
                      name="cpf"
                      placeholder="000.000.000-00"
                      required
                      value={formData.cpf}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Telefone *</label>
                    <input
                      type="text"
                      name="telefone"
                      placeholder="(11) 99999-9999"
                      required
                      value={formData.telefone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>E-mail *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Endereço Completo *</label>
                    <InputControlled
                      name="endereco"
                      placeholder="Rua, número, complemento"
                      required
                      value={formData.endereco}
                      setFormData={setFormData}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Cidade *</label>
                    <input
                      type="text"
                      name="cidade"
                      placeholder="Sua cidade"
                      required
                      value={formData.cidade}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.colSmall}>
                    <label>Estado *</label>
                    <input
                      type="text"
                      name="estado"
                      placeholder="UF"
                      required
                      value={formData.estado}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.colSmall}>
                    <label>CEP *</label>
                    <input
                      type="text"
                      name="cep"
                      placeholder="00000-000"
                      required
                      value={formData.cep}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={true}
                  isLast={false}
                />
              </form>
            )}
            {step === 2 && (
              <form
                className={styles.form}
                onSubmit={handleNext}
                autoComplete="off"
              >
                <div className={styles.cardDesc}>{stepSubtitles[1]}</div>
                {/* Histórico Médico Pessoal */}
                <div className={styles.row} style={{ flexWrap: "wrap" }}>
                  <div className={styles.col}>
                    <label>
                      <b>Histórico Médico Pessoal</b>
                    </label>
                    <div>
                      <input
                        type="checkbox"
                        name="diabetes"
                        data-group="historico_medico_pessoal"
                        value="Diabetes"
                        checked={formData.historico_medico_pessoal.includes(
                          "Diabetes"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Diabetes
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="colesterol_alto"
                        data-group="historico_medico_pessoal"
                        value="Colesterol alto"
                        checked={formData.historico_medico_pessoal.includes(
                          "Colesterol alto"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Colesterol alto
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="avc"
                        data-group="historico_medico_pessoal"
                        value="AVC / Derrame"
                        checked={formData.historico_medico_pessoal.includes(
                          "AVC / Derrame"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      AVC / Derrame
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="obesidade"
                        data-group="historico_medico_pessoal"
                        value="Obesidade"
                        checked={formData.historico_medico_pessoal.includes(
                          "Obesidade"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Obesidade
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="cancer"
                        data-group="historico_medico_pessoal"
                        value="Câncer (especificar)"
                        checked={formData.historico_medico_pessoal.includes(
                          "Câncer (especificar)"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Câncer (especificar)
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="alergias_graves"
                        data-group="historico_medico_pessoal"
                        value="Alergias graves (especificar)"
                        checked={formData.historico_medico_pessoal.includes(
                          "Alergias graves (especificar)"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Alergias graves (especificar)
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>&nbsp;</label>
                    <div>
                      <input
                        type="checkbox"
                        name="hipertensao"
                        data-group="historico_medico_pessoal"
                        value="Hipertensão arterial"
                        checked={formData.historico_medico_pessoal.includes(
                          "Hipertensão arterial"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Hipertensão arterial
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="doenca_cardiaca"
                        data-group="historico_medico_pessoal"
                        value="Doença cardíaca"
                        checked={formData.historico_medico_pessoal.includes(
                          "Doença cardíaca"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Doença cardíaca
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="asma"
                        data-group="historico_medico_pessoal"
                        value="Asma"
                        checked={formData.historico_medico_pessoal.includes(
                          "Asma"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Asma
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="hipotireoidismo"
                        data-group="historico_medico_pessoal"
                        value="Hipotireoidismo / Hipertireoidismo"
                        checked={formData.historico_medico_pessoal.includes(
                          "Hipotireoidismo / Hipertireoidismo"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Hipotireoidismo / Hipertireoidismo
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="depressao"
                        data-group="historico_medico_pessoal"
                        value="Depressão / Ansiedade"
                        checked={formData.historico_medico_pessoal.includes(
                          "Depressão / Ansiedade"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Depressão / Ansiedade
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    name="historico_medico_pessoal_outros"
                    placeholder="Outras condições não listadas acima..."
                    rows={2}
                    value={formData.historico_medico_pessoal_outros}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                {/* Histórico Médico Familiar */}
                <div className={styles.row} style={{ flexWrap: "wrap" }}>
                  <div className={styles.col}>
                    <label>
                      <b>Histórico Médico Familiar</b>
                    </label>
                    <div>
                      <input
                        type="checkbox"
                        name="diabetes_fam"
                        data-group="historico_medico_familiar"
                        value="Diabetes"
                        checked={formData.historico_medico_familiar.includes(
                          "Diabetes"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Diabetes
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="colesterol_alto_fam"
                        data-group="historico_medico_familiar"
                        value="Colesterol alto"
                        checked={formData.historico_medico_familiar.includes(
                          "Colesterol alto"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Colesterol alto
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="avc_fam"
                        data-group="historico_medico_familiar"
                        value="AVC / Derrame"
                        checked={formData.historico_medico_familiar.includes(
                          "AVC / Derrame"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      AVC / Derrame
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="cancer_fam"
                        data-group="historico_medico_familiar"
                        value="Câncer (especificar)"
                        checked={formData.historico_medico_familiar.includes(
                          "Câncer (especificar)"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Câncer (especificar)
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>&nbsp;</label>
                    <div>
                      <input
                        type="checkbox"
                        name="hipertensao_fam"
                        data-group="historico_medico_familiar"
                        value="Hipertensão arterial"
                        checked={formData.historico_medico_familiar.includes(
                          "Hipertensão arterial"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Hipertensão arterial
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="doenca_cardiaca_fam"
                        data-group="historico_medico_familiar"
                        value="Doença cardíaca"
                        checked={formData.historico_medico_familiar.includes(
                          "Doença cardíaca"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Doença cardíaca
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="obesidade_fam"
                        data-group="historico_medico_familiar"
                        value="Obesidade"
                        checked={formData.historico_medico_familiar.includes(
                          "Obesidade"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Obesidade
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="morte_subita_fam"
                        data-group="historico_medico_familiar"
                        value="Morte súbita antes dos 50 anos"
                        checked={formData.historico_medico_familiar.includes(
                          "Morte súbita antes dos 50 anos"
                        )}
                        onChange={handleInputChange}
                      />{" "}
                      Morte súbita antes dos 50 anos
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    name="historico_medico_familiar_outros"
                    placeholder="Outras condições familiares não listadas acima..."
                    rows={2}
                    value={formData.historico_medico_familiar_outros}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                {/* Medicamentos, Suplementos, Alergias */}
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    name="medicamentos"
                    placeholder="Liste os medicamentos que você usa atualmente (nome, dosagem, frequência)"
                    rows={2}
                    value={formData.medicamentos}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    name="suplementos"
                    placeholder="Suplementos, vitaminas ou produtos naturais que você usa"
                    rows={2}
                    value={formData.suplementos}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    name="alergias"
                    placeholder="Alergias medicamentosas, alimentares ou outras"
                    rows={2}
                    value={formData.alergias}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                {/* Fuma/Álcool */}
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Você fuma?</label>
                    <div>
                      <input
                        type="radio"
                        name="fuma"
                        value="Não"
                        checked={formData.fuma === "Não"}
                        onChange={handleInputChange}
                      />{" "}
                      Não
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="fuma"
                        value="Sim"
                        checked={formData.fuma === "Sim"}
                        onChange={handleInputChange}
                      />{" "}
                      Sim
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="fuma"
                        value="Parei de fumar"
                        checked={formData.fuma === "Parei de fumar"}
                        onChange={handleInputChange}
                      />{" "}
                      Parei de fumar
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>Você bebe álcool?</label>
                    <div>
                      <input
                        type="radio"
                        name="alcool"
                        value="Não"
                        checked={formData.alcool === "Não"}
                        onChange={handleInputChange}
                      />{" "}
                      Não
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="alcool"
                        value="Socialmente"
                        checked={formData.alcool === "Socialmente"}
                        onChange={handleInputChange}
                      />{" "}
                      Socialmente
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="alcool"
                        value="Regularmente"
                        checked={formData.alcool === "Regularmente"}
                        onChange={handleInputChange}
                      />{" "}
                      Regularmente
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                  disabled={isUploading}
                />
              </form>
            )}
            {step === 3 && (
              <form
                className={styles.form}
                onSubmit={handleNext}
                autoComplete="off"
              >
                <div className={styles.cardDesc}>{stepSubtitles[2]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Motivo da Consulta *</label>
                    <textarea
                      required
                      name="motivo_consulta"
                      placeholder="Qual o principal motivo que te trouxe aqui? (ex: emagrecimento, controle de diabetes, etc.)"
                      rows={2}
                      value={formData.motivo_consulta}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Descrição dos Sintomas</label>
                    <textarea
                      name="descricao_sintomas"
                      placeholder="Descreva os sintomas que você está sentindo, quando começaram, intensidade, etc."
                      rows={2}
                      value={formData.descricao_sintomas}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Há quanto tempo você tem esses sintomas?</label>
                    <select
                      name="tempo_sintomas"
                      value={formData.tempo_sintomas}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o período</option>
                      <option value="dias">Dias</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                      <option value="anos">Anos</option>
                      <option value="nao-sinto">Não sinto sintomas</option>
                    </select>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                  disabled={isUploading}
                />
              </form>
            )}
            {step === 4 && (
              <form
                className={styles.form}
                onSubmit={handleNext}
                autoComplete="off"
              >
                <div className={styles.cardDesc}>{stepSubtitles[3]}</div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Peso Atual (kg) *</label>
                    <input
                      type="number"
                      name="peso_atual"
                      placeholder="Ex: 70"
                      required
                      value={formData.peso_atual || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Altura (cm) *</label>
                    <input
                      type="number"
                      name="altura"
                      placeholder="Ex: 170"
                      required
                      value={formData.altura || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Histórico de Peso</label>
                    <textarea
                      name="historico_peso"
                      placeholder="Conte sobre variações de peso, tentativas anteriores de emagrecimento/ganho de peso"
                      rows={2}
                      value={formData.historico_peso}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Hábitos Alimentares</label>
                    <textarea
                      name="habitos_alimentares"
                      placeholder="Descreva sua rotina alimentar: quantas refeições por dia, tipos de alimentos, horários, restrições"
                      rows={2}
                      value={formData.habitos_alimentares}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Atividade Física</label>
                    <textarea
                      name="atividade_fisica"
                      placeholder="Que tipo de atividade física você pratica? Descreva intensidade e duração"
                      rows={2}
                      value={formData.atividade_fisica}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Frequência de Atividade Física</label>
                    <div className={styles.radioColWrap}>
                      <label>
                        <input
                          type="radio"
                          name="frequencia_atividade"
                          value="sedentario"
                          checked={
                            formData.frequencia_atividade === "sedentario"
                          }
                          onChange={handleInputChange}
                        />
                        Sedentário (não pratico)
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="frequencia_atividade"
                          value="leve"
                          checked={formData.frequencia_atividade === "leve"}
                          onChange={handleInputChange}
                        />
                        Leve (1-2x por semana)
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="frequencia_atividade"
                          value="moderado"
                          checked={formData.frequencia_atividade === "moderado"}
                          onChange={handleInputChange}
                        />
                        Moderado (3-4x por semana)
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="frequencia_atividade"
                          value="intenso"
                          checked={formData.frequencia_atividade === "intenso"}
                          onChange={handleInputChange}
                        />
                        Intenso (5+ vezes por semana)
                      </label>
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 5 && (
              <form
                className={styles.form}
                onSubmit={handleNext}
                autoComplete="off"
              >
                <div className={styles.cardDesc}>{stepSubtitles[4]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Exames Recentes</label>
                    <textarea
                      name="exames_recentes"
                      placeholder="Descreva resultados de exames recentes (sangue, imagem, etc.)"
                      rows={2}
                      value={formData.exames_recentes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Anexar Arquivos de Exames</label>
                    <div
                      className={styles.uploadBox}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={handleExamesClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleExamesClick();
                      }}
                    >
                      <div className={styles.uploadIcon}>⤴️</div>
                      <div className={styles.uploadTitle}>
                        Clique para enviar <span>ou arraste arquivos</span>
                      </div>
                      <div className={styles.uploadDesc}>
                        PNG, JPG, PDF (MAX. 10MB cada)
                      </div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        ref={examesInputRef}
                        style={{ display: "none" }}
                        onChange={handleExamesChange}
                      />
                      {examesFiles.length > 0 && (
                        <ul
                          style={{ marginTop: 10, fontSize: 13, color: "#222" }}
                        >
                          {examesFiles.map((file, idx) => {
                            const key = `${file.name}-${file.size}-${file.lastModified}`;
                            const pct = uploadProgress[key];
                            return (
                              <li key={idx}>
                                {file.name}{" "}
                                {pct >= 0 && pct !== undefined
                                  ? `- ${pct}%`
                                  : pct === -1
                                  ? "- erro"
                                  : ""}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Diagnósticos Anteriores</label>
                    <textarea
                      name="diagnosticos_anteriores"
                      placeholder="Liste diagnósticos médicos que você já recebeu"
                      rows={2}
                      value={formData.diagnosticos_anteriores}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Anexar Arquivos de Diagnósticos</label>
                    <div
                      className={styles.uploadBox}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={handleDiagClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleDiagClick();
                      }}
                    >
                      <div className={styles.uploadIcon}>⤴️</div>
                      <div className={styles.uploadTitle}>
                        Clique para enviar <span>ou arraste arquivos</span>
                      </div>
                      <div className={styles.uploadDesc}>
                        PNG, JPG, PDF (MAX. 10MB cada)
                      </div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        ref={diagInputRef}
                        style={{ display: "none" }}
                        onChange={handleDiagChange}
                      />
                      {diagFiles.length > 0 && (
                        <ul
                          style={{ marginTop: 10, fontSize: 13, color: "#222" }}
                        >
                          {diagFiles.map((file, idx) => {
                            const key = `${file.name}-${file.size}-${file.lastModified}`;
                            const pct = uploadProgress[key];
                            return (
                              <li key={idx}>
                                {file.name}{" "}
                                {pct >= 0 && pct !== undefined
                                  ? `- ${pct}%`
                                  : pct === -1
                                  ? "- erro"
                                  : ""}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 6 && (
              <form
                className={styles.form}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    examesFiles.length > 0 &&
                    examesUrls.length !== examesFiles.length
                  ) {
                    alert(
                      "Aguarde o upload dos arquivos de exames antes de enviar."
                    );
                    return;
                  }
                  if (
                    diagFiles.length > 0 &&
                    diagUrls.length !== diagFiles.length
                  ) {
                    alert(
                      "Aguarde o upload dos arquivos de diagnósticos antes de enviar."
                    );
                    return;
                  }
                  // Montar payload final com todos os dados
                  const normalizedDataNascimento = formatDateBRtoISO(
                    formData.data_nascimento
                  );
                  const payload = {
                    ...formData,
                    data_nascimento: normalizedDataNascimento || null,
                    peso_atual: Number(formData.peso_atual),
                    altura: Number(formData.altura),
                    exames_arquivos: examesUrls,
                    diagnosticos_arquivos: diagUrls,
                    consentimento_telemedicina:
                      e.target.consentimentoTelemedicina.checked,
                    consentimento_lgpd: e.target.consentimentoLGPD.checked,
                    termos_uso: e.target.termosUso.checked,
                  };
                  try {
                    const response = await fetch(
                      "https://slimshapeapi.vercel.app/api/pacientes",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      }
                    );
                    let data = null;
                    try {
                      data = await response.json();
                    } catch (err) {
                      // body might be empty or invalid JSON
                      data = null;
                    }
                    // Consider HTTP success (2xx) as primary success signal.
                    if (response.ok || (data && data.success)) {
                      alert("Dados salvos, parabéns!");
                      try {
                        // redireciona para a página de planos para que o usuário escolha
                        // se a API retornou um id de paciente, anexa como query param
                        const pid =
                          data && (data.id || data._id || data.pacienteId);
                        const url = pid
                          ? `/pre-cadastro/planos?pacienteId=${encodeURIComponent(
                              pid
                            )}`
                          : "/pre-cadastro/planos";
                        window.location.href = url;
                        return;
                      } catch (err) {
                        if (onClose) onClose();
                        return;
                      }
                    } else {
                      // Prefer server-provided message, fallback to generic
                      const serverMsg = data && data.error ? data.error : null;
                      alert(
                        serverMsg ||
                          `Erro ao salvar a avaliação. (status ${response.status})`
                      );
                    }
                  } catch (err) {
                    alert("Erro de conexão com o servidor.");
                  }
                }}
              >
                <div className={styles.cardDesc}>{stepSubtitles[5]}</div>
                <div className={styles.termosCard}>
                  <label className={styles.termoLabel}>
                    <input
                      type="checkbox"
                      required
                      name="consentimentoTelemedicina"
                    />
                    <div>
                      Consentimento para Telemedicina *<br />
                      <span>
                        Concordo em receber atendimento médico através de
                        telemedicina e entendo suas limitações, incluindo a
                        impossibilidade de exame físico durante a consulta
                        online. Reconheço que, se necessário, poderei ser
                        orientado a buscar atendimento presencial.
                      </span>
                    </div>
                  </label>
                  <label className={styles.termoLabel}>
                    <input type="checkbox" required name="consentimentoLGPD" />
                    <div>
                      Consentimento para Tratamento de Dados (LGPD) *<br />
                      <span>
                        Autorizo a coleta, armazenamento e uso dos meus dados
                        pessoais e sensíveis de saúde para fins de prestação de
                        serviços médicos, conforme a Lei Geral de Proteção de
                        Dados (LGPD). Entendo que posso revogar este
                        consentimento a qualquer momento.
                      </span>
                    </div>
                  </label>
                  <label className={styles.termoLabel}>
                    <input type="checkbox" required name="termosUso" />
                    <div>
                      Termos de Uso da Plataforma *<br />
                      <span>
                        Li e aceito os termos de uso da plataforma Slim Shape
                        Digital, incluindo as responsabilidades e limitações do
                        serviço de saúde digital oferecido.
                      </span>
                    </div>
                  </label>
                </div>
                <div className={styles.nextStepsCard}>
                  <div className={styles.nextStepsTitle}>
                    <span>✔️</span> Próximos Passos
                  </div>
                  <ul className={styles.nextStepsList}>
                    <li>
                      Sua avaliação será analisada por um médico especialista
                    </li>
                    <li>Você receberá um contato em até 24 horas</li>
                    <li>Se necessário, será agendada uma teleconsulta</li>
                    <li>
                      Prescrições (se indicadas) serão enviadas com assinatura
                      digital
                    </li>
                  </ul>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={null}
                  isFirst={false}
                  isLast={true}
                  submitLabel="Enviar Avaliação"
                />
              </form>
            )}
          </ModalCard>
        </div>
        <ModalDivider />
      </div>
    </div>
  );
}

export default ModalAvaliacao;
