import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { planId, pacienteId } = body || {};

    // Simula criação de pagamento: em produção, aqui chamaremos a API Asaas
    const checkoutUrl = `/pre-cadastro/checkout?planId=${encodeURIComponent(
      planId || ""
    )}&pacienteId=${encodeURIComponent(pacienteId || "")}`;

    return NextResponse.json({ success: true, checkoutUrl }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
