"use client";
import styles from "./dashboard.module.css";
import { useState } from "react";
import {
  FaUser,
  FaSyringe,
  FaCalendarAlt,
  FaChartLine,
  FaFolderOpen,
  FaVial,
  FaClipboardCheck,
  FaChartPie,
} from "react-icons/fa";

import DashboardHome from "./views/DashboardHome";
import Pacientes from "./views/Pacientes";
import Injetaveis from "./views/Injetaveis";
import PlanosAtivos from "./views/PlanosAtivos";
import Analises from "./views/Analises";
import Indicacoes from "./views/Indicacoes";

const MENU = [
  { label: "Visão Geral", icon: <FaChartPie />, comp: <DashboardHome /> },
  { label: "Indicações", icon: <FaUser />, comp: <Indicacoes /> },
  { label: "Pacientes", icon: <FaUser />, comp: <Pacientes /> },
  { label: "Tratamentos", icon: <FaVial />, comp: <Injetaveis /> },
  {
    label: "Planos Ativos",
    icon: <FaClipboardCheck />,
    comp: <PlanosAtivos />,
  },
  { label: "Análises", icon: <FaChartLine />, comp: <Analises /> },
];

export default function Dashboard() {
  const [selected, setSelected] = useState(0);
  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Slim Shape Digital</div>
        <div className={styles.sidebarDesc}>Dashboard Administrativo</div>
        <nav className={styles.menu}>
          {MENU.map((item, i) => (
            <a
              key={item.label}
              className={
                styles.menuItem + (selected === i ? " " + styles.active : "")
              }
              onClick={() => setSelected(i)}
            >
              {item.icon} {item.label}
            </a>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>© 2024 Slim Shape Digital</div>
      </aside>
      {/* Main Content */}
      <main className={styles.mainContent}>{MENU[selected].comp}</main>
    </div>
  );
}
