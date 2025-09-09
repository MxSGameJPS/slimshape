import styles from "./barra.module.css";
import { FaUserMd, FaStar, FaPills, FaTruck } from "react-icons/fa";

const items = [
  { icon: <FaUserMd />, text: "Avaliação médica" },
  { icon: <FaStar />, text: "Nutrição e novos hábitos" },
  { icon: <FaPills />, text: "Medicamentos prescritos" },
  { icon: <FaTruck />, text: "Entregas em todo Brasil" },
];

export default function BarraMovimento() {
  // Repete os itens para efeito infinito
  const marqueeItems = [...items, ...items, ...items];
  return (
    <div className={styles.barra}>
      <div className={styles.marquee}>
        {marqueeItems.map((item, idx) => (
          <span className={styles.item} key={idx}>
            <span className={styles.icon}>{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
