import styles from "../dashboard.module.css";
import { FaFolderOpen } from "react-icons/fa";

const pacientes = [
  {
    nome: "Maria Silva",
    idade: 35,
    sexo: "Feminino",
    cidade: "São Paulo, SP",
    data: "14/01/2024",
    plano: "Premium",
    sigla: "MS",
  },
  {
    nome: "João Santos",
    idade: 28,
    sexo: "Masculino",
    cidade: "Rio de Janeiro, RJ",
    data: "09/02/2024",
    plano: "Basic",
    sigla: "JS",
  },
  {
    nome: "Ana Costa",
    idade: 35,
    sexo: "Feminino",
    cidade: "Belo Horizonte, MG",
    data: "27/01/2024",
    plano: "Premium",
    sigla: "AC",
  },
  {
    nome: "Pedro Oliveira",
    idade: 41,
    sexo: "Masculino",
    cidade: "Porto Alegre, RS",
    data: "04/03/2024",
    plano: "Premium",
    sigla: "PO",
  },
  {
    nome: "Carla Ferreira",
    idade: 29,
    sexo: "Feminino",
    cidade: "Curitiba, PR",
    data: "19/02/2024",
    plano: "Basic",
    sigla: "CF",
  },
  {
    nome: "Lucas Rodrigues",
    idade: 26,
    sexo: "Masculino",
    cidade: "Salvador, BA",
    data: "11/03/2024",
    plano: "Basic",
    sigla: "LR",
  },
];

export default function Pacientes() {
  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaFolderOpen /> Pacientes
      </h2>
      <div style={{ color: "#8d99ae", marginBottom: 16 }}>
        Total de 6 pacientes cadastrados
      </div>
      <div className={styles.pacientesGrid}>
        {pacientes.map((p) => (
          <div
            className={styles.pacienteCard}
            key={p.nome}
            role="button"
            tabIndex={0}
            onClick={() => alert(`Abrir detalhes de ${p.nome}`)}
            onKeyPress={(e) => {
              if (e.key === "Enter") alert(`Abrir detalhes de ${p.nome}`);
            }}
          >
            <div className={styles.pacienteCardHeader}>
              <FaFolderOpen className={styles.pacienteIcon} />
              <span className={styles.pacienteNome}>{p.nome}</span>
            </div>
            <div className={styles.pacienteCardBody}>
              <div className={styles.pacienteSigla}>{p.sigla}</div>
              <div className={styles.pacienteInfo}>
                {p.idade} anos • {p.sexo}
              </div>
              <div className={styles.pacienteInfo}>📍 {p.cidade}</div>
              <div className={styles.pacienteInfo}>📅 {p.data}</div>
            </div>
            <div
              className={
                styles.pacientePlano +
                " " +
                (p.plano === "Premium" ? styles.premium : styles.basic)
              }
            >
              {p.plano}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
