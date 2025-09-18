import React, { useState } from "react";
import styles from "./PlanosClientClean.module.css";

// Nova lógica: escolha explícita da forma de pagamento
export default function PlanosClientClean(props) {
  const [paymentType, setPaymentType] = useState("BOLETO");
  const [maxInstallments, setMaxInstallments] = useState(6);

  function confirmSelection(dias) {
    setShowModal(false);

    (async () => {
      try {
        const rawPrice = findPreco(activePlano, dias);
        const value = parsePriceToNumber(rawPrice);

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

        let billingTypes = [];
        let chargeTypes = [];
        let installment = undefined;
        if (paymentType === "PIX") {
          billingTypes = ["PIX"];
          chargeTypes = ["DETACHED"];
        } else if (paymentType === "BOLETO") {
          billingTypes = ["BOLETO"];
          chargeTypes = ["DETACHED"];
        } else if (paymentType === "CREDIT_CARD") {
          billingTypes = ["CREDIT_CARD"];
          chargeTypes = ["DETACHED"];
        } else if (paymentType === "CREDIT_CARD_INSTALLMENT") {
          billingTypes = ["CREDIT_CARD"];
          chargeTypes = ["INSTALLMENT"];
          installment = { maxInstallmentCount: Number(maxInstallments) };
        }

        const base = {
          billingTypes,
          chargeTypes,
          ...(installment ? { installment } : {}),
          value: value,
          minutesToExpire: 60,
          description: `Compra do plano ${
            activePlano?.nome
          } - ${daysToMonthsLabel(dias)}`,
          externalReference: `plano_${activePlano?.id}_duracao_${dias}`,
          callback: {
            cancelUrl: window.location.origin + "/pre-cadastro/planos?cancel=1",
            expiredUrl:
              window.location.origin + "/pre-cadastro/planos?expired=1",
            successUrl:
              window.location.origin + "/pre-cadastro/planos?success=1",
          },
          items: [
            {
              name: activePlano?.nome,
              description: activePlano?.descricao,
              quantity: 1,
              value: value,
            },
          ],
        };

        const asaasPayload = pacienteData
          ? {
              customerData: {
                name: pacienteData.nome || pacienteData.name,
                email: pacienteData.email,
                cpfCnpj:
                  pacienteData.cpfCnpj ||
                  pacienteData.cpf ||
                  pacienteData.cpf_cnpj,
                phone: pacienteData.telefone || pacienteData.phone,
              },
              ...base,
            }
          : { pacienteId: pacienteId || null, ...base };

        function deepClean(obj) {
          Object.keys(obj).forEach((k) => {
            if (obj[k] && typeof obj[k] === "object") deepClean(obj[k]);
            if (obj[k] == null) delete obj[k];
          });
        }
        deepClean(asaasPayload);

        if (asaasPayload.customerData) {
          if (asaasPayload.customerData.cpfCnpj)
            asaasPayload.customerData.cpfCnpj = String(
              asaasPayload.customerData.cpfCnpj
            ).replace(/\D+/g, "");
          if (asaasPayload.customerData.phone)
            asaasPayload.customerData.phone = String(
              asaasPayload.customerData.phone
            ).replace(/\D+/g, "");
        }

        try {
          console.log("Payload cobranca (frontend):", asaasPayload);
        } catch (e) {}

        if (pacienteId) {
          try {
            const upd = {
              plano: activePlano?.id || activePlano?.nome || null,
            };
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

        if (data.url) {
          window.location.href = data.url;
          return;
        }

        if (data.link || data.paymentLink || data.checkoutUrl) {
          const link = data.link || data.paymentLink || data.checkoutUrl;
          window.location.href = link;
          return;
        }

        if (data.id) {
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
          "Cobrança criada. Verifique seu e-mail ou painel para concluir o pagamento."
        );
      } catch (err) {
        console.error(err);
        alert("Erro ao criar cobrança: " + String(err));
      }
    })();
  }

  return (
    <>
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

            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <label
                style={{ fontWeight: 600, display: "block", marginBottom: 6 }}
              >
                Escolha a forma de pagamento:
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="BOLETO"
                    checked={paymentType === "BOLETO"}
                    onChange={() => setPaymentType("BOLETO")}
                  />
                  Boleto
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="PIX"
                    checked={paymentType === "PIX"}
                    onChange={() => setPaymentType("PIX")}
                  />
                  Pix
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="CREDIT_CARD"
                    checked={paymentType === "CREDIT_CARD"}
                    onChange={() => setPaymentType("CREDIT_CARD")}
                  />
                  Cartão de Crédito (à vista)
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="CREDIT_CARD_INSTALLMENT"
                    checked={paymentType === "CREDIT_CARD_INSTALLMENT"}
                    onChange={() => setPaymentType("CREDIT_CARD_INSTALLMENT")}
                  />
                  Cartão de Crédito (parcelado)
                </label>
                {paymentType === "CREDIT_CARD_INSTALLMENT" && (
                  <span style={{ marginLeft: 8 }}>
                    Máx. parcelas:
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={maxInstallments}
                      onChange={(e) => setMaxInstallments(e.target.value)}
                      style={{ width: 48, marginLeft: 4 }}
                    />
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {(Array.isArray(activePlano.precos)
                ? activePlano.precos
                : []
              ).map((opt, idx) => {
                // tentar extrair duracao numerica
                const rawDur = opt.duracao ?? opt.duration ?? opt.dias ?? "";
                const durNum = String(rawDur).replace(/\D+/g, "");
                const dur = durNum ? Number(durNum) : null;
                const preco = opt.preco ?? opt.price ?? opt.valor ?? "--";
                return (
                  <div key={idx} className={styles.modalRow}>
                    <div>{dur ? daysToMonthsLabel(dur) : String(rawDur)}</div>
                    <div>{preco}</div>
                    <div>
                      <button
                        className={styles.btnPrimary}
                        onClick={() => confirmSelection(dur || rawDur)}
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                );
              })}
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
    </>
  );
}
