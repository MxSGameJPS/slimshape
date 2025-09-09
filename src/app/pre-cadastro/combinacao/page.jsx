"use client";
import styles from "./page.module.css";
import { FaInfoCircle } from "react-icons/fa";
import { useState } from "react";
import ModalAvaliacao from "./modalAvaliacao";

const opcoes = [
  {
    value: "medicacao-time",
    title: "Medicação + Time de especialistas",
    desc: "Avaliação do endocrinologista. Medicamentos na sua porta*. Suporte clínico via WhatsApp. Acompanhamento nutricional.",
  },
  {
    value: "medicacao",
    title: "Somente medicação",
    desc: "Avaliação do endocrinologista. Medicamentos na sua porta*.",
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

  function handleChange(e) {
    setOpcaoSelecionada(e.target.value);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
  }

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
      <ModalAvaliacao open={modalOpen} onClose={handleCloseModal} />
    </>
  );
}
