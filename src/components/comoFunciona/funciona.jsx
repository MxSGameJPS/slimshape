import styles from "./funciona.module.css";

const etapas = [
  {
    icon: "/file.svg",
    titulo: "Questionário de saúde",
    texto:
      "Você responde perguntas sobre sua saúde, histórico médico, além de expectativas e objetivos",
  },
  {
    icon: "/globe.svg",
    titulo: "Avaliação médica",
    texto:
      "Com base nas suas respostas o endócrino indica seu tratamento, e nós enviamos seu diagnóstico.",
  },
  {
    icon: "/window.svg",
    titulo: "Entrega do tratamento",
    texto:
      "Se prescrita, Seu Protocolo será entregue na porta da sua casa com Frete Grátis",
  },
  {
    icon: "/vercel.svg",
    titulo: "Suporte contínuo",
    texto:
      "Faça uma consulta com nutri e tenha suporte de saúde diário de especialistas pelo WhatsApp.",
  },
];

export default function ComoFunciona() {
  return (
    <section className={styles.funcionaSection} id="como-funciona">
      <div className={styles.funcionaBg}>
        <div className={styles.titulo}>COMO FUNCIONA</div>
        <h2 className={styles.tituloPrincipal}>
          Sua jornada completa 100% online
        </h2>
        <p className={styles.subTitulo}>
          Como funciona o processo do início ao fim
        </p>

        <div className={styles.cardsSimple}>
          {etapas.map((etapa, idx) => (
            <div className={styles.cardSimple} key={idx}>
              <div className={styles.circleNumber}>{idx + 1}</div>
              <div className={styles.cardTitulo}>{etapa.titulo}</div>
              <div className={styles.cardTexto}>{etapa.texto}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
