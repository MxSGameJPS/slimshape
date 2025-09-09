import Hero from "../components/hero/hero";
import BarraMovimento from "../components/barraMovimento/barra";

import Solucao from "../components/solucao/solucao";

import Resultados from "../components/resultados/resultados";

import FAQ from "../components/faq/faq";

import Depoimento from "../components/depoimento/depoimento";

import ComoFunciona from "../components/comoFunciona/funciona";
import CTA from "../components/cta/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <BarraMovimento />
      <Solucao />
      <Resultados />
      <FAQ />
      <Depoimento />
      <ComoFunciona />
      <BarraMovimento />
      <CTA />
    </>
  );
}
