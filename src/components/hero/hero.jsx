import styles from "./hero.module.css";
import Image from "next/image";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Emagreça com saúde e acompanhamento profissional
        </h1>
        <p className={styles.subtitle}>
          Transforme seu corpo e sua vida com o método SlimShape. Resultados
          reais, acompanhamento de especialistas e plano personalizado para
          você.
        </p>
        <a href="#cta" className={styles.cta}>
          Quero começar agora
        </a>
      </div>
      <div className={styles.collage}>
        <div className={styles.collageLeft}>
          <Image
            src="/Hero/Gemini_Generated_Image_efh9ueefh9ueefh9.png"
            alt="Paciente SlimShape"
            width={420}
            height={800}
            className={styles.collageImg}
            priority
          />
        </div>
        <div className={styles.collageRight}>
          <Image
            src="/Hero/Gemini_Generated_Image_i9qvssi9qvssi9qv.png"
            alt="Produto SlimShape"
            width={380}
            height={380}
            className={styles.collageImg}
          />
          <Image
            src="/Hero/Gemini_Generated_Image_rzuvudrzuvudrzuv.png"
            alt="Kit SlimShape"
            width={380}
            height={380}
            className={styles.collageImg}
          />
        </div>
      </div>
    </section>
  );
}
