"use client";
import styles from "./faq.module.css";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Link from "next/link";

const faqs = [
  {
    title: "Avaliação médica online",
    content:
      "Consulta com médicos especialistas para entender seu perfil e indicar o melhor tratamento para emagrecimento, sem sair de casa.",
  },
  {
    title: "Medicamentos prescritos",
    content:
      "Se necessário, você recebe a prescrição de medicamentos aprovados e seguros, com acompanhamento profissional.",
  },
  {
    title: "Entrega garantida",
    content:
      "Receba os medicamentos diretamente em sua casa, com toda a praticidade e segurança.",
  },
  {
    title: "Renovação online de prescrições",
    content:
      "Renove suas receitas de forma simples e rápida, sem precisar sair de casa.",
  },

  {
    title: "Especialistas pelo WhatsApp",
    content:
      "Tire dúvidas e receba orientações diretamente pelo WhatsApp, com suporte humanizado.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const toggle = (idx) => setOpen(open === idx ? null : idx);

  return (
    <section className={styles.faqSection} id="faq">
      <div className={styles.faqBg}>
        <div className={styles.faqIntro}>
          <h2 className={styles.faqTitulo}>
            Um plano completo,
            <br />
            com tudo incluso
          </h2>
          <div className={styles.faqTexto}>
            Seja qual for o seu momento de vida – conte com especialistas em saúde para encontrar sua receita
            certa para emagrecer.
          </div>
          <Link href="/pre-cadastro" className={styles.faqBtn}>
            Quero uma avaliação
          </Link>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq, idx) => (
            <div
              className={
                open === idx
                  ? `${styles.faqItem} ${styles.open}`
                  : styles.faqItem
              }
              key={idx}
              onClick={() => toggle(idx)}
            >
              <div className={styles.faqItemTitle}>
                <span>
                  {idx + 1} {faq.title}
                </span>
                <FaChevronDown className={styles.faqIcon} />
              </div>
              {open === idx && (
                <div className={styles.faqItemContent}>{faq.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
