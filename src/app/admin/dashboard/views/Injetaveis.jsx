import styles from "../dashboard.module.css";
import { FaSyringe } from "react-icons/fa";

export default function Injetaveis() {
  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaSyringe /> Injeções
      </h2>
      <div className={styles.tableBox}>
        <div className={styles.tableTitle}>
          <FaSyringe /> Vendas de Injeções de Emagrecimento
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Quantidade</th>
              <th>Frequência</th>
              <th>Data da Compra</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Maria Silva</td>
              <td>4x</td>
              <td>Semanal</td>
              <td>29/02/2024</td>
              <td>R$ 1.200</td>
              <td>
                <span className={styles.statusConcluido}>Concluído</span>
              </td>
            </tr>
            <tr>
              <td>João Santos</td>
              <td>2x</td>
              <td>Quinzenal</td>
              <td>09/03/2024</td>
              <td>R$ 600</td>
              <td>
                <span className={styles.statusPendente}>Pendente</span>
              </td>
            </tr>
            <tr>
              <td>Ana Costa</td>
              <td>6x</td>
              <td>Semanal</td>
              <td>27/02/2024</td>
              <td>R$ 1.800</td>
              <td>
                <span className={styles.statusConcluido}>Concluído</span>
              </td>
            </tr>
            <tr>
              <td>Pedro Oliveira</td>
              <td>3x</td>
              <td>Semanal</td>
              <td>14/03/2024</td>
              <td>R$ 900</td>
              <td>
                <span className={styles.statusConcluido}>Concluído</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
