import styles from "./footer.module.css";
import Image from "next/image";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerCol}>
          <div className={styles.footerLogo}>
            <Image
              src="/logo/logo.png"
              alt="SlimShape"
              width={68}
              height={68}
            />
            <span
              style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff" }}
            >
              SlimShape Digital
            </span>
          </div>
          <div>
            Sua plataforma completa de saúde digital, com acompanhamento médico
            online.
          </div>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Serviços</div>
          <ul className={styles.footerList}>
            <li>
              <a href="#faq">Consultas Online</a>
            </li>
            <li>
              <a href="#faq">Acompanhamento com Especialistas</a>
            </li>
            <li>
              <a href="#faq">Prescrição de Medicamentos</a>
            </li>
            <li>
              <a href="#faq">Suporte Especializado</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Empresa</div>
          <ul className={styles.footerList}>
            <li>
              <a href="#faq">Sobre Nós</a>
            </li>
            <li>
              <a href="#faq">Nossa Equipe</a>
            </li>
            <li>
              <a href="#faq">Política de Privacidade</a>
            </li>
            <li>
              <a href="#faq">Termos de Uso</a>
            </li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerTitle}>Contato</div>
          <div className={styles.footerContact}>
            <span>
              <FaPhoneAlt /> (41) 98848-9981
            </span>
            <span>
              <FaEnvelope /> slimshapedigital@gmail.com
            </span>
            <span>
              <FaMapMarkerAlt /> Curitiba, PR
            </span>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        © 2025 SlimShape. Todos os direitos reservados. Desenvolvido em
        conformidade com ANVISA, CFM e LGPD.
      </div>
    </footer>
  );
}
