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
      // map option value to plano id (or null)
      let planoId = null;
      try {
        if (val === "medicacao-time") {
          // Plano Total
          const p = planos.find((x) => /total/i.test(x.nome));
          planoId = p ? p.id : null;
        } else if (val === "medicacao") {
          // Plano Básico
          const p = planos.find((x) => /b[aá]sico/i.test(x.nome));
          planoId = p ? p.id : null;
        } else {
          planoId = null;
        }
      } catch (err) {
        planoId = null;
      }
      setFormData((prev) => ({ ...prev, plano: planoId }));
      setModalStep(1); // sempre começa do início
      setModalOpen(true);
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
