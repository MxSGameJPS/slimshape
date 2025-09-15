import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const urls = [
    "",
    "pre-cadastro",
    "pre-cadastro/planos",
    "pre-cadastro/checkout",
  ];

  const content = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map((u) => {
        const loc = `${base.replace(/\/$/, "")}/${u}`;
        return `
      <url>
        <loc>${loc}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
      })
      .join("")}
  </urlset>`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
