"use client";
import styles from "./page.module.css";
import { FaInfoCircle } from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
import ModalAvaliacao from "./modalAvaliacao";

const opcoes = [
  {
    value: "medicacao-time",
    title: "Medicação + Time de especialistas",
    desc: "Avaliação Médica. Medicamentos na sua porta*. Suporte clínico via WhatsApp. Acompanhamento nutricional.",
  },
  {
    value: "medicacao",
    title: "Somente medicação",
    desc: "Avaliação Médica. Medicamentos na sua porta*.",
  },
  {
    value: "nao-sei",
    title: "Não sei",
    desc: "",
  },
];

export default function Combinacao() {
  const [modalOpen, setModalOpen] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState("");
  // Estado centralizado do formulário
  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    genero: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    historico_medico_pessoal: [],
    historico_medico_pessoal_outros: "",
    historico_medico_familiar: [],
    historico_medico_familiar_outros: "",
    medicamentos: "",
    suplementos: "",
    alergias: "",
    fuma: "",
    alcool: "",
    motivo_consulta: "",
    descricao_sintomas: "",
    tempo_sintomas: "",
    peso_atual: "",
    altura: "",
    historico_peso: "",
    habitos_alimentares: "",
    atividade_fisica: "",
    frequencia_atividade: "",
    exames_recentes: "",
    diagnosticos_anteriores: "",
  });
  // Estado do step do modal também no pai para garantir estabilidade
  const [modalStep, setModalStep] = useState(1);
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    // restaurar opcao selecionada do localStorage
    try {
      const saved = localStorage.getItem("opcaoSelecionada");
      if (saved) setOpcaoSelecionada(saved);
    } catch (e) {}

    let mounted = true;
    async function loadPlanos() {
      try {
        const res = await fetch("https://slimshapeapi.vercel.app/api/planos");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && Array.isArray(json)) setPlanos(json);
      } catch (err) {
        console.warn("failed to load planos", err);
      }
    }
    loadPlanos();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setOpcaoSelecionada(val);
      try {
        localStorage.setItem("opcaoSelecionada", val);
      } catch (e) {}
      // não mapeia plano ainda; o modal será aberto somente após escolher o estado
      setModalStep(1); // prepara o step inicial caso o modal abra em seguida
    },
    [planos, setFormData]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <main className={styles.preCadastroBg}>
        <section className={styles.preCadastroForm}>
          <h1>Com qual combinação você mais se identifica?</h1>
          <p>Todas as opções têm o mesmo valor.</p>
          <form className={styles.radioForm}>
            {opcoes.map((opcao) => (
              <label key={opcao.value} className={styles.radioBox}>
                <input
                  type="radio"
                  name="combinacao"
                  value={opcao.value}
                  checked={opcaoSelecionada === opcao.value}
                  onChange={handleChange}
                />
                <div>
                  <span className={styles.radioTitle}>{opcao.title}</span>
                  {opcao.desc && (
                    <span className={styles.radioDesc}>{opcao.desc}</span>
                  )}
                </div>
              </label>
            ))}
            <div className={styles.estadoRow}>
              <label className={styles.estadoLabel}>Estado onde mora</label>
              <select
                value={formData.estado || ""}
                onChange={(e) => {
                  const estado = e.target.value;
                  setFormData((prev) => ({ ...prev, estado }));
                }}
              >
                <option value="">Selecione um estado</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className={
                  formData.estado
                    ? styles.continuarBtn
                    : styles.continuarBtnDisabled
                }
                onClick={() => {
                  if (formData.estado) {
                    setModalStep(1);
                    setModalOpen(true);
                  }
                }}
              >
                Continuar
              </button>
            </div>
          </form>
          <div className={styles.infoBox}>
            <FaInfoCircle className={styles.infoIcon} />
            <span>*Somente sob prescrição médica.</span>
          </div>
        </section>
      </main>
      <ModalAvaliacao
        open={modalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        step={modalStep}
        setStep={setModalStep}
      />
    </>
  );
}
