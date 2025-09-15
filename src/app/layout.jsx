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
  title: "SlimShape Digital - Emagrecimento Saudável e Acompanhamento Profissional",
  description: "Emagrecimento saudável e acompanhamento profissional 100% online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
