import styles from "../dashboard.module.css";
import {
  FaUser,
  FaSyringe,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardCheck,
} from "react-icons/fa";

export default function DashboardHome() {
  return (
    <>
      <h2 className={styles.pageTitle}>Visão Geral</h2>
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

      <div className={styles.tablesRow}>
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
            </tbody>
          </table>
        </div>
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
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
