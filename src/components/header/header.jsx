import styles from "./header.module.css";
import Image from "next/image";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logo}>
          <Image
            src="/logo/logo.png"
            alt="SlimShape"
            width={50}
            height={50}
            priority
          />
          <span className={styles.logoText}>Slim Shape Digital</span>
        </a>
        <nav className={styles.nav}>
          <a href="#solucao">Solução</a>
          <a href="#especialistas">Especialistas</a>
          <a href="#resultados">Resultados</a>
          <a href="#faq">Perguntas Frequentes</a>
        </nav>
        <a href="#cta" className={styles.cta}>
          Quero uma Avaliação
        </a>
      </div>
    </header>
  );
}
