import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url missing" }, { status: 400 });
    }

    // Proteção básica: apenas permitir domínio do Cloudinary
    const allowedHosts = ["res.cloudinary.com"];
    let parsed;
    try {
      parsed = new URL(url);
    } catch (err) {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }
    if (!allowedHosts.includes(parsed.hostname)) {
      return NextResponse.json(
        { error: "domain not allowed" },
        { status: 400 }
      );
    }

    // Server-side fetch (evita problemas de CORS no cliente)
    const res = await fetch(url);
    const status = res.status;
    const headers = new Headers();
    // copiar apenas headers seguros para repassar
    const safe = [
      "content-type",
      "content-disposition",
      "cache-control",
      "content-length",
    ];
    res.headers.forEach((v, k) => {
      if (safe.includes(k.toLowerCase())) headers.set(k, v);
    });

    if (!res.ok) {
      // repassar erro simples
      const text = await res.text().catch(() => "");
      return new Response(text, { status, headers });
    }

    const buffer = await res.arrayBuffer();
    return new Response(buffer, { status: 200, headers });
  } catch (err) {
    console.error("cloudinary-proxy error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
