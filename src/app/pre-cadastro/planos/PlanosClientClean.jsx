"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";

export default function PlanosClientClean() {
  const search = useSearchParams();
  const pacienteId = search?.get?.("pacienteId");

  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activePlano, setActivePlano] = useState(null);
  const [paymentType, setPaymentType] = useState("BOLETO");
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://slimshapeapi.vercel.app/api/planos", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setPlanos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Planos SlimShape Digital</h1>
        </div>
        <div style={{ padding: 20 }}>Carregando planos...</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Planos SlimShape Digital</h1>
        </div>
        <div style={{ padding: 20, color: "red" }}>
          Erro ao carregar planos: {error}
        </div>
      </div>
    );

  // Mostrar todos os planos recebidos da API
  const principais = planos;

  function findPreco(plano, dias) {
    if (!plano || !Array.isArray(plano.precos)) return null;
    const byDias = plano.precos.find((x) => {
      const d = String(x.duracao || "").replace(/\D+/g, "");
      return d === String(dias);
    });
    if (byDias) return byDias.preco;
    const contains = plano.precos.find((x) =>
      String(x.duracao || "").includes(String(dias))
    );
    if (contains) return contains.preco;
    return plano.precos[0]?.preco ?? null;
  }

  function daysToMonthsLabel(days) {
    if (Number(days) === 30) return "1 mês";
    if (Number(days) === 90) return "3 meses";
    if (Number(days) === 180) return "6 meses";
    return `${days} dias`;
  }

  function openPicker(plano) {
    setActivePlano(plano);
    setShowModal(true);
  }

  function parsePriceToNumber(raw) {
    if (raw == null) return null;
    if (typeof raw === "number") return raw;
    // Remove currency symbols and spaces, handle Brazilian format like "R$ 1.234,56"
    let s = String(raw).trim();
    s = s.replace(/R?\$|\s/g, "");
    // If contains comma and dot, assume dot is thousand sep and comma decimal
    if (s.indexOf(".") > -1 && s.indexOf(",") > -1) {
      s = s.replace(/\./g, "").replace(/,/, ".");
    } else if (s.indexOf(",") > -1 && s.indexOf(".") === -1) {
      // only comma -> decimal
      s = s.replace(/,/, ".");
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  }

  function addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 3));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Valida CPF (11 dígitos) e CNPJ (14 dígitos) — implementa algoritmo básico
  function isValidCPF(cpf) {
    if (!cpf) return false;
    const s = String(cpf).replace(/\D+/g, "");
    if (s.length !== 11) return false;
    // inválidos conhecidos
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
      for (let i = 0; i < weights.length; i++) sum += Number(s[i]) * weights[i];
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const d1 = calc(12);
    const d2 = calc(13);
    return d1 === Number(s[12]) && d2 === Number(s[13]);
  }

  async function confirmSelection(dias, opts = {}) {
    try {
      setShowModal(false);

      const rawPrice = findPreco(activePlano, dias);
      const value = parsePriceToNumber(rawPrice);

      const paymentTypeLocal = opts.paymentTypeOverride || paymentType;
      const installmentsLocal = opts.installmentsOverride || installments;

      const base = {
        billingType:
          paymentTypeLocal === "BOLETO" ||
          paymentTypeLocal === "PIX" ||
          paymentTypeLocal === "BOLETO_PIX"
            ? "BOLETO"
            : "CREDIT_CARD",
        chargeTypes:
          paymentTypeLocal === "PIX"
            ? ["PIX"]
            : paymentTypeLocal === "BOLETO"
            ? ["BOLETO"]
            : paymentTypeLocal === "BOLETO_PIX"
            ? ["BOLETO", "PIX"]
            : ["CREDIT_CARD"],
        installment:
          paymentTypeLocal === "CREDIT_CARD_SINGLE"
            ? { maxInstallmentCount: 1 }
            : paymentTypeLocal === "CREDIT_CARD_INSTALLMENTS" &&
              installmentsLocal > 1
            ? { maxInstallmentCount: Number(installmentsLocal) }
            : undefined,
        value: value,
        dueDate: addDaysISO(3),
        description: `Compra do plano ${
          activePlano?.nome
        } - ${daysToMonthsLabel(dias)}`,
        externalReference: `plano_${activePlano?.id}_duracao_${dias}`,
      };

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

      const asaasPayload = pacienteData
        ? {
            nome: pacienteData.nome || pacienteData.name,
            email: pacienteData.email,
            cpfCnpj:
              pacienteData.cpfCnpj || pacienteData.cpf || pacienteData.cpf_cnpj,
            telefone: pacienteData.telefone || pacienteData.phone,
            ...base,
          }
        : { pacienteId: pacienteId || null, ...base };

      // Remove keys com valor null para no enviar campos vazios
      Object.keys(asaasPayload).forEach((k) => {
        if (asaasPayload[k] == null) delete asaasPayload[k];
      });

      // Sanitiza campos comuns que costumam provocar 400 na API
      if (asaasPayload.cpfCnpj) {
        try {
          asaasPayload.cpfCnpj = String(asaasPayload.cpfCnpj).replace(
            /\D+/g,
            ""
          );
          const s = asaasPayload.cpfCnpj;
          const ok =
            (s.length === 11 && isValidCPF(s)) ||
            (s.length === 14 && isValidCNPJ(s));
          if (!ok) {
            console.warn(
              "CPF/CNPJ inválido detectado, removendo do payload:",
              s
            );
            delete asaasPayload.cpfCnpj;
            try {
              alert(
                "CPF/CNPJ do paciente parece inválido e foi removido para permitir a criação da cobrança. Atualize o cadastro do paciente."
              );
            } catch (e) {}
          }
        } catch (e) {}
      }
      if (asaasPayload.telefone) {
        try {
          asaasPayload.telefone = String(asaasPayload.telefone).replace(
            /\D+/g,
            ""
          );
        } catch (e) {}
      }
      if (asaasPayload.value != null) {
        const n = Number(asaasPayload.value);
        if (Number.isFinite(n)) asaasPayload.value = Number(n.toFixed(2));
      }
      if (asaasPayload.dueDate) {
        const d = String(asaasPayload.dueDate);
        if (d.indexOf("/") > -1) {
          const parts = d.split("/").map((s) => s.padStart(2, "0"));
          if (parts.length === 3)
            asaasPayload.dueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else if (d.indexOf("-") > -1 && d.length >= 10) {
          asaasPayload.dueDate = d.slice(0, 10);
        }
      }

      try {
        console.log("Payload cobranca (frontend):", asaasPayload);
      } catch (e) {}

      if (pacienteId) {
        (async () => {
          try {
            const upd = { plano: activePlano?.id || activePlano?.nome || null };
            await fetch(
              `https://slimshapeapi.vercel.app/api/pacientes/${encodeURIComponent(
                pacienteId
              )}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(upd),
              }
            );
            console.log("Paciente atualizado com plano", upd);
          } catch (err) {
            console.warn("Falha ao atualizar paciente com plano:", err);
          }
        })();
      }

      const res = await fetch(
        "https://slimshapeapi.vercel.app/api/asaas/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(asaasPayload),
        }
      );

      const respText = await res.text();
      let data = null;
      try {
        data = respText ? JSON.parse(respText) : null;
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        console.error(
          "Erro do backend ao criar checkout (status",
          res.status,
          ") - parsed:",
          data,
          "raw:",
          respText
        );
        try {
          const mensagem =
            data?.error || data || respText || `status ${res.status}`;
          alert(
            "Erro ao criar cobrança (detalhe):\n" + JSON.stringify(mensagem)
          );
        } catch (e) {}
        throw new Error(data?.error || respText || `status ${res.status}`);
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.link || data?.paymentLink || data?.checkoutUrl) {
        const link = data.link || data.paymentLink || data.checkoutUrl;
        window.location.href = link;
        return;
      }
      if (data?.id) {
        const check = await fetch(
          `https://slimshapeapi.vercel.app/api/asaas/cobranca/${data.id}`
        );
        if (check.ok) {
          const c = await check.json();
          if (c.link || c.paymentLink || c.checkoutUrl) {
            window.location.href = c.link || c.paymentLink || c.checkoutUrl;
            return;
          }
        }
        const params = new URLSearchParams();
        params.set("cobrancaId", String(data.id));
        if (pacienteId) params.set("pacienteId", pacienteId);
        window.location.href = `/pre-cadastro/checkout?${params.toString()}`;
        return;
      }

      alert(
        "Cobrana criada. Verifique seu e-mail ou painel para concluir o pagamento."
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao criar cobrana: " + String(err));
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Planos SlimShape Digital</h1>
      </header>

      <section className={styles.grid}>
        {principais.map((plano) => {
          // preço principal: preferir primeiro item em plano.precos ou fallback via findPreco
          const primaryPreco =
            plano?.precos?.[0]?.preco ?? findPreco(plano, 30) ?? "--";
          return (
            <article key={plano.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{plano.nome}</h2>
              {plano.descricao && (
                <p className={styles.descricao}>{plano.descricao}</p>
              )}

              <div className={styles.priceRow}>
                <div className={styles.price}>{primaryPreco}</div>
                <button
                  className={styles.btnPrimary}
                  onClick={() => openPicker(plano)}
                >
                  Começar meu plano
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {showModal && activePlano && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>{activePlano.nome}</h3>
            <p className={styles.modalDescription}>{activePlano.descricao}</p>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>
                  Escolha como quer efetuar o pagamento do seu plano.
                </strong>
              </div>

              {/* Radios removed: we now present three payment rows below (Boleto/Pix / Cartão à vista / Cartão parcelado) */}

              {(() => {
                const first = activePlano?.precos?.[0] || null;
                const rawDur = first
                  ? first.duracao ?? first.duration ?? first.dias ?? ""
                  : "30";
                const durNum = String(rawDur).replace(/\D+/g, "");
                const defaultDur = durNum ? Number(durNum) : 30;
                return (
                  <div className={styles.paymentOptionsContainer}>
                    <div className={styles.paymentRow}>
                      <div className={styles.paymentLabel}>Boleto/Pix</div>
                      <div>
                        <button
                          className={`${styles.btnPrimary} ${styles.paymentBtn}`}
                          onClick={() =>
                            confirmSelection(defaultDur, {
                              paymentTypeOverride: "BOLETO_PIX",
                              installmentsOverride: 1,
                            })
                          }
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>

                    <div className={styles.paymentRow}>
                      <div className={styles.paymentLabel}>
                        Cartão de Crédito (à vista)
                      </div>
                      <div>
                        <button
                          className={`${styles.btnPrimary} ${styles.paymentBtn}`}
                          onClick={() =>
                            confirmSelection(defaultDur, {
                              paymentTypeOverride: "CREDIT_CARD_SINGLE",
                              installmentsOverride: 1,
                            })
                          }
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>

                    <div className={styles.paymentRow}>
                      <div className={styles.paymentLabel}>
                        <div>Cartão de Crédito (parcelado)</div>
                        <select
                          className={styles.paymentSelect}
                          value={installments}
                          onChange={(e) =>
                            setInstallments(Number(e.target.value))
                          }
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (n) => (
                              <option key={n} value={n}>
                                {n}x
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <button
                          className={`${styles.btnPrimary} ${styles.paymentBtn}`}
                          onClick={() =>
                            confirmSelection(defaultDur, {
                              paymentTypeOverride: "CREDIT_CARD_INSTALLMENTS",
                              installmentsOverride: installments,
                            })
                          }
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.btnSecondary}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
