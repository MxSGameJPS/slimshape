"use client";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (estado) {
      router.push("/pre-cadastro/combinacao");
    }
  }

  return (
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
  );
}
