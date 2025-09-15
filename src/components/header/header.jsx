"use client";
import styles from "./header.module.css";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

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
          <a href="#depoimentos">Depoimentos</a>
          <a href="#resultados">Resultados</a>
          <a href="#faq">Perguntas Frequentes</a>
        </nav>

        {/* mobile hamburger */}
        <button
          className={styles.hamburger}
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.hamburgerBox}>
            <span className={styles.hamburgerInner} />
          </span>
        </button>

        <a href="/pre-cadastro" className={styles.cta}>
          Quero uma Avaliação
        </a>

        {/* mobile nav overlay */}
        <div
          className={
            open ? `${styles.mobileNav} ${styles.open}` : styles.mobileNav
          }
          role="dialog"
          aria-hidden={!open}
        >
          <nav>
            <a href="#solucao" onClick={() => setOpen(false)}>
              Solução
            </a>
            <a href="#depoimentos" onClick={() => setOpen(false)}>
              Depoimentos
            </a>
            <a href="#resultados" onClick={() => setOpen(false)}>
              Resultados
            </a>
            <a href="#faq" onClick={() => setOpen(false)}>
              Perguntas Frequentes
            </a>
            <a
              href="/pre-cadastro"
              className={styles.cta}
              onClick={() => setOpen(false)}
            >
              Quero uma Avaliação
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
