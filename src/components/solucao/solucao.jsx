import styles from "./solucao.module.css";
import Image from "next/image";

export default function Solucao() {
  return (
    <section className={styles.solucao} id="solucao">
      <div className={styles.titulo}>PLANO SLIMSHAPE PARA EMAGRECER</div>
      <h2 className={styles.tituloPrincipal}>
        Uma solução completa e segura para emagrecer
      </h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <Image
            src="/solucao/Gemini_Generated_Image_9w8vml9w8vml9w8v.png"
            alt="Equipe SlimShape"
            width={340}
            height={240}
            className={styles.cardImg}
          />
          <div className={styles.cardTitulo}>
            Médicos + Especialistas
          </div>
          <div className={styles.cardTexto}>
            A maioria só entrega a medicação. A SlimShape tem tudo para você
            emagrecer e manter resultados: medicação prescrita por médico (se
            indicado) e acompanhamento de especialistas.
          </div>
        </div>
        <div className={styles.card}>
          <Image
            src="/solucao/Gemini_Generated_Image_i9qvssi9qvssi9qv.png"
            alt="Kit SlimShape"
            width={340}
            height={240}
            className={styles.cardImg}
          />
          <div className={styles.cardTitulo}>
            Tratamento com entrega gratuita
          </div>
          <div className={styles.cardTexto}>
            Se você precisar de medicação, cuidamos de tudo: compra em farmácias
            parceiras, retenção da receita e entrega na sua casa. Sem visitas ao
            consultório, sem idas à farmácia, sem complicação com receitas.
          </div>
        </div>
        <div className={styles.card}>
          <Image
            src="/solucao/Gemini_Generated_Image_rzuvudrzuvudrzuv.png"
            alt="Balança e alimentação SlimShape"
            width={340}
            height={240}
            className={styles.cardImg}
          />
          <div className={styles.cardTitulo}>Adequado às normas da ANVISA</div>
          <div className={styles.cardTexto}>
            As prescrições médicas vão direto para as farmácias parceiras, que
            cuidam da retenção da receita e do envio – conforme a legislação. A
            SlimShape gerencia tudo para você focar no que importa: o seu
            cuidado.
          </div>
        </div>
      </div>
    </section>
  );
}
