import styles from "./cta.module.css";

export default function CTA() {
  return (
    <section className={styles.ctaSection} id="cta">
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>A sua receita para perder peso</h2>
        <div className={styles.ctaText}>
          Alcance seu peso ideal com planos seguros, 100% online, e com
          acompanhamento profissional em todas as etapas.
        </div>
        <a href="#faq" className={styles.ctaBtn}>
          Funciona pra mim?
        </a>
      </div>
    </section>
  );
}
