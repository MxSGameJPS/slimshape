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
  const [paymentMethod, setPaymentMethod] = useState("BOLETO");

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

      // map frontend selection to Asaas billingType values
      const billingType =
        paymentMethod === "PIX"
          ? "PIX"
          : paymentMethod === "CREDIT_CARD"
          ? "CREDIT_CARD"
          : "BOLETO";

      const base = {
        billingType,
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

      // valida CPF/CNPJ: se inválido, removemos para evitar 400 da API
      function isValidCPF(cpf) {
        if (!cpf) return false;
        const s = String(cpf).replace(/\D+/g, "");
        if (s.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(s)) return false;
        const calc = (t) => {
          let sum = 0;
          for (let i = 0; i < t; i++) sum += Number(s[i]) * (t + 1 - i);
          const r = sum % 11;
          return r < 2 ? 0 : 11 - r;
        };
        const d1 = calc(9);
        const d2 = calc(10);
        return d1 === Number(s[9]) && d2 === Number(s[10]);
      }

      function isValidCNPJ(cnpj) {
        if (!cnpj) return false;
        const s = String(cnpj).replace(/\D+/g, "");
        if (s.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(s)) return false;
        const calc = (t) => {
          const weights =
            t === 12
              ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
              : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
          let sum = 0;
          for (let i = 0; i < weights.length; i++)
            sum += Number(s[i]) * weights[i];
          const r = sum % 11;
          return r < 2 ? 0 : 11 - r;
        };
        const d1 = calc(12);
        const d2 = calc(13);
        return d1 === Number(s[12]) && d2 === Number(s[13]);
      }

      if (payload.cpfCnpj) {
        payload.cpfCnpj = String(payload.cpfCnpj).replace(/\D+/g, "");
        const s = payload.cpfCnpj;
        const ok =
          (s.length === 11 && isValidCPF(s)) ||
          (s.length === 14 && isValidCNPJ(s));
        if (!ok) {
          console.warn("CPF/CNPJ inválido detectado, removendo do payload:", s);
          delete payload.cpfCnpj;
          try {
            alert(
              "CPF/CNPJ do paciente parece inválido e foi removido para permitir a criação da cobrança. Atualize o cadastro do paciente."
            );
          } catch (e) {}
        }
      }

      // sanitize fields that often cause 400s
      if (payload.cpfCnpj)
        payload.cpfCnpj = String(payload.cpfCnpj).replace(/\D+/g, "");
      if (payload.telefone)
        payload.telefone = String(payload.telefone).replace(/\D+/g, "");
      if (payload.value != null) {
        const n = Number(payload.value);
        if (Number.isFinite(n)) payload.value = Number(n.toFixed(2));
      }
      if (payload.dueDate)
        payload.dueDate = String(payload.dueDate).slice(0, 10);

      console.log("Payload cobranca (frontend):", payload);

      const res = await fetch(
        "https://slimshapeapi.vercel.app/api/asaas/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.text();
      let js = null;
      try {
        js = raw ? JSON.parse(raw) : null;
      } catch (e) {
        js = null;
        console.error(
          "Resposta não-JSON do backend (status",
          res.status,
          "):",
          raw
        );
      }

      if (!res.ok) {
        console.error(
          "Erro do backend ao criar checkout (status",
          res.status,
          ") - parsed:",
          js,
          "raw:",
          raw
        );
        try {
          const mensagem = js?.error || js || raw || `status ${res.status}`;
          alert(
            "Erro ao criar cobrança (detalhe):\n" + JSON.stringify(mensagem)
          );
        } catch (e) {}
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
        <label style={{ marginRight: 8 }}>Forma de pagamento:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ marginRight: 12 }}
        >
          <option value="BOLETO">Boleto</option>
          <option value="PIX">Pix</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
        </select>

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
