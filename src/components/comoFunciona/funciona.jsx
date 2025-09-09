import styles from "./funciona.module.css";
import Image from "next/image";

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
      "Se prescrita, sua medicação é adquirida em farmácias parceiras e entregue grátis na sua porta.",
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
        <div className={styles.cards}>
          {etapas.map((etapa, idx) => (
            <div className={styles.card} key={idx}>
              <div className={styles.cardTop}>
                <span className={styles.cardNum}>{idx + 1}</span>
                <Image
                  src={etapa.icon}
                  alt={etapa.titulo}
                  width={54}
                  height={54}
                  className={styles.cardIcon}
                />
              </div>
              <div className={styles.cardTitulo}>{etapa.titulo}</div>
              <div className={styles.cardTexto}>{etapa.texto}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
