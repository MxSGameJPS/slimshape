"use client";
import React from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";

const MOCK_PLANOS = [
  {
    id: "semaglutida-1",
    nome: "Semaglutida 0.25mg - Programa SlimShape",
    ativos: ["Semaglutida"],
    descricao:
      "Programa com semaglutida + acompanhamento médico e nutricional por 12 semanas.",
    precoMensal: "R$ 1.265,50",
    destaque: true,
  },
  {
    id: "tirzepatida-1",
    nome: "Tirzepatida 2.5mg - Programa Avançado",
    ativos: ["Tirzepatida"],
    descricao:
      "Programa com tirzepatida, acompanhamento interdisciplinar e suporte via WhatsApp.",
    precoMensal: "R$ 1.590,00",
    destaque: false,
  },
  {
    id: "combo-1",
    nome: "Combinado: Semaglutida + Naltrexona",
    ativos: ["Semaglutida", "Naltrexona"],
    descricao:
      "Opção combinada para perfis selecionados. Consulta médica necessária para indicar combinação.",
    precoMensal: "R$ 1.099,00",
    destaque: false,
  },
];

export default function PlanosPage() {
  const search = useSearchParams();
  const pacienteId = search?.get?.("pacienteId");
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Planos SlimShape Digital</h1>
        <p className={styles.subtitle}>
          Escolha o plano ideal para seu tratamento. Depois da avaliação médica
          indicaremos o melhor caminho.
        </p>
      </header>

      <section className={styles.grid}>
        {MOCK_PLANOS.map((plano) => (
          <article key={plano.id} className={styles.card}>
            {plano.destaque && <div className={styles.badge}>Mais pedido</div>}
            <h2 className={styles.cardTitle}>{plano.nome}</h2>
            <div className={styles.ativos}>
              {plano.ativos.map((a) => (
                <span key={a} className={styles.ativoBadge}>
                  {a}
                </span>
              ))}
            </div>
            <p className={styles.descricao}>{plano.descricao}</p>
            <div className={styles.priceRow}>
              <div className={styles.price}>{plano.precoMensal}</div>
              <button
                className={styles.btnPrimary}
                onClick={async () => {
                  // tenta chamar a API mock que cria pagamento e retorna checkoutUrl
                  try {
                    const res = await fetch("/api/asaas/create_payment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ planId: plano.id, pacienteId }),
                    });
                    const js = await res.json();
                    if (js && js.checkoutUrl) {
                      window.location.href = js.checkoutUrl;
                      return;
                    }
                  } catch (err) {
                    // fallback: abrir a página de checkout interna com query params
                    const params = new URLSearchParams();
                    params.set("planId", plano.id);
                    if (pacienteId) params.set("pacienteId", pacienteId);
                    window.location.href = `/pre-cadastro/checkout?${params.toString()}`;
                  }
                }}
              >
                Começar meu plano
              </button>
            </div>
            <details className={styles.faq}>
              <summary className={styles.faqSummary}>
                Dúvidas frequentes
              </summary>
              <div className={styles.faqItem}>
                <p>
                  A medicação é prescrita somente após avaliação médica. O tempo
                  de tratamento varia conforme a resposta clínica.
                </p>
              </div>
            </details>
          </article>
        ))}
      </section>

      <section className={styles.infoBox}>
        <h3>Por que escolher SlimShape Digital?</h3>
        <ul>
          <li className={styles.infoItem}>
            Avaliação por endocrinologista especialista
          </li>
          <li className={styles.infoItem}>
            Prescrição 100% online quando indicada
          </li>
          <li className={styles.infoItem}>
            Acompanhamento via WhatsApp com equipe multidisciplinar
          </li>
          <li className={styles.infoItem}>
            Entrega de medicação em domicílio quando aplicável
          </li>
        </ul>
      </section>
    </main>
  );
}
