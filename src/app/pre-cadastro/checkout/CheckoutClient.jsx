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
      // Montar payload no formato Asaas
      let value = null;
      if (planId) {
        try {
          const p = await fetch(
            `https://slimshapeapi.vercel.app/api/planos/${planId}`,
            { cache: "no-store" }
          );
          if (p.ok) {
            const plano = await p.json();
            // tenta pegar preco default (30 dias) ou primeiro preco
            const precoRaw =
              plano?.precos?.find((x) => String(x.duracao).includes("30"))
                ?.preco || plano?.precos?.[0]?.preco;
            if (precoRaw != null) {
              // normaliza para number
              const s = String(precoRaw)
                .replace(/R?\$|\s/g, "")
                .replace(/\./g, "")
                .replace(/,/, ".");
              const n = parseFloat(s);
              if (Number.isFinite(n)) value = n;
            }
          }
        } catch (err) {
          console.warn("Não foi possível obter preço do plano:", err);
        }
      }

      // tentar obter dados do paciente para enviar ao backend
      let pacienteData = null;
      if (pacienteId) {
        try {
          const pr = await fetch(
            `https://slimshapeapi.vercel.app/api/pacientes/${pacienteId}`,
            { cache: "no-store" }
          );
          if (pr.ok) pacienteData = await pr.json();
        } catch (err) {
          console.warn("Não foi possível buscar dados do paciente:", err);
        }
      }

      const base = {
        billingType: "BOLETO",
        value: value,
        dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000)
          .toISOString()
          .slice(0, 10),
        externalReference: planId ? `plano_${planId}` : undefined,
      };

      const payload = pacienteData
        ? {
            nome: pacienteData.nome || pacienteData.name,
            email: pacienteData.email,
            cpfCnpj:
              pacienteData.cpfCnpj || pacienteData.cpf || pacienteData.cpf_cnpj,
            telefone: pacienteData.telefone || pacienteData.phone,
            ...base,
          }
        : { pacienteId: pacienteId || null, ...base };

      // Remove undefined
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      console.log("Payload cobranca (frontend):", payload);

      const res = await fetch(
        "https://slimshapeapi.vercel.app/api/asaas/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let js = null;
      try {
        js = await res.json();
      } catch (e) {
        // resposta não é JSON
        const text = await res.text();
        console.error(
          "Resposta não-JSON do backend (status",
          res.status,
          "):",
          text
        );
      }

      if (!res.ok) {
        console.error(
          "Erro do backend ao criar checkout (status",
          res.status,
          "):",
          js
        );
      }

      // O backend pode retornar { url } (exemplo do time) ou { link }/etc.
      if (js?.url) {
        window.location.href = js.url;
        return;
      }

      const redirectUrl = js?.link || js?.paymentLink || js?.checkoutUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      // Fallback: backend retornou apenas um id da cobranca -> buscar detalhe
      if (js?.id) {
        try {
          const r2 = await fetch(
            `https://slimshapeapi.vercel.app/api/asaas/cobranca/${js.id}`
          );
          const detail = await r2.json();
          const url2 =
            detail?.link || detail?.paymentLink || detail?.checkoutUrl;
          if (url2) {
            window.location.href = url2;
            return;
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes da cobranca:", err);
        }
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
