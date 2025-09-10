import styles from "../dashboard.module.css";
import { FaUser, FaSyringe, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Dados dos gráficos conforme imagens
const estadosData = {
  labels: ["SP", "RJ", "MG", "RS", "PR", "BA"],
  datasets: [
    {
      label: "Pacientes",
      data: [45, 30, 28, 20, 16, 15],
      backgroundColor: "#a5b4fc",
      borderRadius: 6,
    },
  ],
};
const generoData = {
  labels: ["Feminino", "Masculino"],
  datasets: [
    {
      data: [98, 62],
      backgroundColor: ["#a5b4fc", "#6ee7b7"],
      borderWidth: 0,
    },
  ],
};
const idadeData = {
  labels: ["18-25", "26-35", "36-45", "46-55", "56+"],
  datasets: [
    {
      label: "Pacientes",
      data: [18, 55, 48, 32, 7],
      backgroundColor: "#6ee7b7",
      borderRadius: 6,
    },
  ],
};
const vendasData = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"],
  datasets: [
    {
      label: "Vendas",
      data: [22000, 31000, 28000, 32000, 35000, 37000, 39000, 41000],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.1)",
      tension: 0.3,
      fill: true,
      pointRadius: 4,
    },
  ],
};

export default function Analises() {
  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaChartLine /> Análises
      </h2>
      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Total de Pacientes <FaUser className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>6</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Injeções Ativas <FaSyringe className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>3</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Planos Ativos <FaCalendarAlt className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>3</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Receita Mensal <FaChartLine className={styles.cardIcon} />
          </div>
          <div className={styles.cardValue}>R$ 996</div>
        </div>
      </div>
      <div className={styles.analisesGrid}>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Pacientes por Estado</div>
          <div className={styles.analiseChart}>
            <Bar
              data={estadosData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Distribuição por Gênero</div>
          <div className={styles.analiseChart}>
            <Pie
              data={generoData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#6366f1", font: { size: 14 } },
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Distribuição por Idade</div>
          <div className={styles.analiseChart}>
            <Bar
              data={idadeData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
        <div className={styles.analiseBox}>
          <div className={styles.analiseTitle}>Evolução de Vendas</div>
          <div className={styles.analiseChart}>
            <Line
              data={vendasData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: "#e5e7eb" }, beginAtZero: true },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
        </div>
      </div>
    </>
  );
}
