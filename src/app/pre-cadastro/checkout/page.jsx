import React from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  // Server component: render client-side CheckoutClient inside a Suspense boundary
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <CheckoutClient />
    </React.Suspense>
  );
}
