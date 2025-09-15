"use client";
import styles from "./page.module.css";
import { useState } from "react";
import ModalAvaliacao from "./combinacao/modalAvaliacao";

const estados = [
  "Acre (AC)",
  "Alagoas (AL)",
  "Amapá (AP)",
  "Amazonas (AM)",
  "Bahia (BA)",
  "Ceará (CE)",
  "Distrito Federal (DF)",
  "Espírito Santo (ES)",
  "Goiás (GO)",
  "Maranhão (MA)",
  "Mato Grosso (MT)",
  "Mato Grosso do Sul (MS)",
  "Minas Gerais (MG)",
  "Pará (PA)",
  "Paraíba (PB)",
  "Paraná (PR)",
  "Pernambuco (PE)",
  "Piauí (PI)",
  "Rio de Janeiro (RJ)",
  "Rio Grande do Norte (RN)",
  "Rio Grande do Sul (RS)",
  "Rondônia (RO)",
  "Roraima (RR)",
  "Santa Catarina (SC)",
  "São Paulo (SP)",
  "Sergipe (SE)",
  "Tocantins (TO)",
];

export default function PreCadastro() {
  const [estado, setEstado] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
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

  function handleSubmit(e) {
    e.preventDefault();
    if (estado) {
      // abrir modal de cadastro iniciando no passo 1; passar o estado para formData
      setFormData((prev) => ({ ...prev, estado }));
      setModalStep(1);
      setModalOpen(true);
    }
  }

  return (
    <>
      <main className={styles.preCadastroBg}>
        <section className={styles.preCadastroForm}>
          <h1>Onde você mora?</h1>
          <p>
            Nossos planos são 100% online, mas precisamos saber onde você mora
            para enviar os tratamentos.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <select
              className={styles.select}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Escolha uma opção</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            <button type="submit" className={styles.button} disabled={!estado}>
              Continuar
            </button>
          </form>
        </section>
      </main>
      <ModalAvaliacao
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        step={modalStep}
        setStep={setModalStep}
      />
    </>
  );
}
