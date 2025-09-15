import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "SlimShape Digital - Emagrecimento Saudável e Acompanhamento Profissional",
  description:
    "Emagrecimento saudável e acompanhamento profissional 100% online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content="#0b6b5b" />

        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo/logo.png" />
        <meta property="og:site_name" content="SlimShape Digital" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="/logo/logo.png" />

        {/* JSON-LD basic Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SlimShape Digital",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
              logo: `${
                process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
              }/logo/logo.png`,
              sameAs: [
                "https://www.facebook.com/",
                "https://www.instagram.com/",
                "https://twitter.com/",
              ],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
