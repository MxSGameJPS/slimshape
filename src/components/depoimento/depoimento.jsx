"use client";
import styles from "./depoimento.module.css";
import Image from "next/image";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const depoimentos = [
  {
    nome: "Camila",
    resultado: "- 6,5kg em 1 mês",
    texto:
      "Sempre quis ter hábitos saudáveis, mas com duas filhas era difícil encontrar uma dieta que encaixasse na rotina e que funcionasse também para elas, sem ser super restritiva. A nutricionista montou um cardápio super bacana e ilustrativo que facilitou muito! Hoje, lido melhor com a compulsão e me sinto disposta para me exercitar. Isso melhorou meu tempo em família, e minhas filhas estão felizes com as mudanças!",
    fotos: [
      {
        src: "/depoimento/Gemini_Generated_Image_rg623drg623drg62.png",
        label: "Dia 1",
      },
      {
        src: "/depoimento/Gemini_Generated_Image_efh9ueefh9ueefh9.png",
        label: "Mês 1",
      },
    ],
  },
  {
    nome: "Carlos",
    resultado: "- 8kg em 2 meses",
    texto:
      "Achei que seria impossível emagrecer sem passar fome. O acompanhamento foi fundamental para eu entender o que comer e como manter o foco. Hoje tenho mais disposição e autoestima!",
    fotos: [
      {
        src: "/depoimento/Gemini_Generated_Image_2k38h42k38h42k38.png",
        label: "Dia 1",
      },
      {
        src: "/depoimento/Gemini_Generated_Image_m03u3cm03u3cm03u.png",
        label: "Mês 2",
      },
    ],
  },
  // Adicione mais depoimentos se desejar
];

export default function Depoimento() {
  const [idx, setIdx] = useState(0);
  const dep = depoimentos[idx];

  const prev = () => setIdx(idx === 0 ? depoimentos.length - 1 : idx - 1);
  const next = () => setIdx(idx === depoimentos.length - 1 ? 0 : idx + 1);

  return (
    <section className={styles.depoimentoSection} id="depoimentos">
      <div className={styles.titulo}>DEPOIMENTOS</div>
      <h2 className={styles.tituloPrincipal}>
        A gente não vê a hora do seu antes e depois
      </h2>
      <div className={styles.carousel}>
        <div className={styles.textoBox}>
          <strong>
            {dep.nome}, {dep.resultado}
          </strong>
          <span>“{dep.texto}”</span>
        </div>
        <div className={styles.fotos}>
          {dep.fotos.map((foto, i) => (
            <div className={styles.foto} key={i}>
              <Image
                src={foto.src}
                alt={dep.nome + " resultado"}
                width={380}
                height={450}
                className={styles.fotoImg}
                quality={100}
                priority={i === 0}
              />
              <span className={styles.fotoLabel}>{foto.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.carouselArrows}>
          <button
            className={styles.arrowBtn}
            onClick={prev}
            aria-label="Anterior"
          >
            <FaChevronLeft />
          </button>
          <button
            className={styles.arrowBtn}
            onClick={next}
            aria-label="Próximo"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div className={styles.carouselNav}>
        {depoimentos.map((_, i) => (
          <button
            key={i}
            className={
              i === idx
                ? `${styles.carouselDot} ${styles.active}`
                : styles.carouselDot
            }
            onClick={() => setIdx(i)}
            aria-label={`Selecionar depoimento ${i + 1}`}
          />
        ))}
      </div>
      <div className={styles.nota}>
        Os resultados são individuais e cada organismo responde de uma maneira.
      </div>
    </section>
  );
}
