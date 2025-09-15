import React from "react";
import PlanosClient from "./PlanosClient";

export default function PlanosPage() {
  return (
    <React.Suspense fallback={<div>Carregando planos...</div>}>
      <PlanosClient />
    </React.Suspense>
  );
}
