import styles from "./resultados.module.css";

export default function Resultados() {
  return (
    <section className={styles.resultados} id="resultados">
      <div className={styles.titulo}>SEJA SLIMSHAPE</div>
      <h2 className={styles.tituloPrincipal}>
        Os nossos resultados falam por si só
      </h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardValor}>12%</div>
          <div className={styles.cardTitulo}>Perda de peso corporal</div>
          <div className={styles.cardTexto}>
            Os pacientes SlimShape perdem quase 12% do seu peso corporal até o
            quinto mês.<sup>1</sup>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValor}>53%</div>
          <div className={styles.cardTitulo}>Mais eficiente</div>
          <div className={styles.cardTexto}>
            Os pacientes SlimShape perdem 53% mais peso do que os pacientes que
            usam apenas medicação<sup>1</sup>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValor}>94%</div>
          <div className={styles.cardTitulo}>Melhora na saúde</div>
          <div className={styles.cardTexto}>
            94% dos nossos clientes sentiram que sua saúde geral também melhorou
            durante o tratamento.<sup>2</sup>
          </div>
        </div>
      </div>
      <div className={styles.nota}>
        <sup>1</sup>Dados de estudo realizado com 57.975 participantes em
        parceria com a Imperial College London
        <br />
        <sup>2</sup>Com base em um estudo piloto interno com 60 participantes
      </div>
    </section>
  );
}
