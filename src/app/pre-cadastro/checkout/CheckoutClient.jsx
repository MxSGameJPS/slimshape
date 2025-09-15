"use client";
import React, { useState } from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";

export default function CheckoutClient() {
  const search = useSearchParams();
  const planId = search?.get?.("planId");
  const pacienteId = search?.get?.("pacienteId");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function criarPagamento() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/asaas/create_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, pacienteId }),
      });
      const js = await res.json();
      if (js && js.checkoutUrl) {
        window.location.href = js.checkoutUrl;
        return;
      }
      setMessage(
        "Não foi possível obter o link de pagamento. Tente novamente."
      );
    } catch (err) {
      setMessage(
        "Erro ao criar pagamento. Verifique a conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.checkoutPage}>
      <h1>Finalizar contratação do plano</h1>
      <p>
        Plano selecionado: <strong>{planId || "(não especificado)"}</strong>
      </p>
      <p>
        Paciente: <strong>{pacienteId || "(não informado)"}</strong>
      </p>
      <div className={styles.actions}>
        <button
          className={styles.btnPrimary}
          onClick={criarPagamento}
          disabled={loading}
        >
          {loading ? "Gerando checkout..." : "Ir para pagamento"}
        </button>
      </div>
      {message && <div className={styles.message}>{message}</div>}
    </main>
  );
}
