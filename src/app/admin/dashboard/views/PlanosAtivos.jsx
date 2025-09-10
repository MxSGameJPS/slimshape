import styles from "../dashboard.module.css";
import { FaClipboardCheck } from "react-icons/fa";

export default function PlanosAtivos() {
  return (
    <>
      <h2 className={styles.pageTitle}>
        <FaClipboardCheck /> Planos Ativos
      </h2>
      <div className={styles.tableBox}>
        <div className={styles.tableTitle}>
          <FaClipboardCheck /> Planos Ativos
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Plano</th>
              <th>Progresso</th>
              <th>Dias Restantes</th>
              <th>Valor Mensal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Maria Silva</td>
              <td>Premium</td>
              <td>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: "75%" }}
                  ></div>
                </div>
                75%
              </td>
              <td>0 dias</td>
              <td>R$ 299</td>
              <td>
                <span className={styles.statusAtivo}>Ativo</span>
              </td>
            </tr>
            <tr>
              <td>João Santos</td>
              <td>Basic</td>
              <td>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: "45%" }}
                  ></div>
                </div>
                45%
              </td>
              <td>0 dias</td>
              <td>R$ 199</td>
              <td>
                <span className={styles.statusAtivo}>Ativo</span>
              </td>
            </tr>
            <tr>
              <td>Pedro Oliveira</td>
              <td>Premium</td>
              <td>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: "25%" }}
                  ></div>
                </div>
                25%
              </td>
              <td>0 dias</td>
              <td>R$ 299</td>
              <td>
                <span className={styles.statusAtivo}>Ativo</span>
              </td>
            </tr>
            <tr>
              <td>Carla Ferreira</td>
              <td>Basic</td>
              <td>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: "60%" }}
                  ></div>
                </div>
                60%
              </td>
              <td>0 dias</td>
              <td>R$ 199</td>
              <td>
                <span className={styles.statusPendente}>Pausado</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
