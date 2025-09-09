"use client";
import React, { useState, useRef } from "react";
import styles from "./modal.module.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeartbeat,
  FaUser,
} from "react-icons/fa";

function ModalAvaliacao({ open, onClose }) {
  const [step, setStep] = useState(1);
  // Estados para arquivos
  const [examesFiles, setExamesFiles] = useState([]);
  const [diagFiles, setDiagFiles] = useState([]);
  const examesInputRef = useRef(null);
  const diagInputRef = useRef(null);

  if (!open) return null;

  function handleNext(e) {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, 6));
  }
  function handlePrev(e) {
    e.preventDefault();
    setStep((s) => Math.max(s - 1, 1));
  }
  function handleExamesClick() {
    if (examesInputRef.current) examesInputRef.current.click();
  }
  function handleDiagClick() {
    if (diagInputRef.current) diagInputRef.current.click();
  }
  function handleExamesChange(e) {
    setExamesFiles(Array.from(e.target.files));
  }
  function handleDiagChange(e) {
    setDiagFiles(Array.from(e.target.files));
  }

  // Funções auxiliares para título, progresso e divisores
  const stepTitles = [
    "Dados Pessoais",
    "Histórico de Saúde",
    "Queixa Principal",
    "Avaliação do Paciente",
    "Avaliação do Paciente",
    "Avaliação do Paciente",
  ];
  const stepIcons = [
    <FaUser key="user" />, // 1
    <FaHeartbeat key="heart" />, // 2
    <span key="q" style={{ fontSize: "1.2em", marginRight: 6 }}>
      📝
    </span>, // 3
    <span key="nutri" role="img" aria-label="nutri">
      ⚖️
    </span>, // 4
    <span key="diag" role="img" aria-label="diagnóstico">
      🩺
    </span>, // 5
    <span key="termos" role="img" aria-label="termos">
      📝
    </span>, // 6
  ];
  const stepSubtitles = [
    "Preencha seus dados para começarmos sua avaliação",
    "Informações sobre seu histórico médico e familiar",
    "Conte-nos sobre o que te trouxe aqui hoje",
    "Informações sobre seu peso, alimentação e atividade física",
    "Informações sobre exames recentes e diagnósticos anteriores",
    "Leia e aceite os termos para finalizar sua avaliação",
  ];
  const progressPercents = [17, 33, 50, 67, 83, 100];

  // Header, progress, divider, card, footer
  function ModalHeader() {
    return (
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>
          {stepIcons[step - 1]} {stepTitles[step - 1]}
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>
    );
  }
  function ModalProgress() {
    return (
      <div className={styles.modalProgress}>
        <span className={styles.modalProgressText}>Etapa {step} de 6</span>
        <div className={styles.modalProgressBarWrap}>
          <div className={styles.modalProgressBarBg}>
            <div
              className={styles.modalProgressBarFg}
              style={{ width: `${progressPercents[step - 1]}%` }}
            ></div>
          </div>
        </div>
        <span className={styles.modalProgressPercent}>
          {step === 6 ? "100% concluído" : `${progressPercents[step - 1]}%`}
        </span>
      </div>
    );
  }
  function ModalDivider() {
    return <div className={styles.modalDivider}></div>;
  }
  function ModalCard({ children }) {
    return <div className={styles.modalCard}>{children}</div>;
  }
  function ModalFooter({
    onPrev,
    onNext,
    isLast,
    isFirst,
    nextLabel,
    prevLabel,
    submitLabel,
  }) {
    return (
      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.btnSec}
          onClick={onPrev}
          disabled={isFirst}
        >
          <FaChevronLeft /> {prevLabel || "Anterior"}
        </button>
        <button
          type="submit"
          className={isLast ? styles.btnFinal : styles.btnPri}
        >
          {isLast ? (
            <>
              Enviar Avaliação{" "}
              <span style={{ fontSize: 20, marginLeft: 8 }}>✔️</span>
            </>
          ) : (
            <>
              Próximo <FaChevronRight />
            </>
          )}
        </button>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ModalHeader />
        <ModalProgress />
        <ModalDivider />
        <div className={styles.modalBody}>
          <ModalCard>
            {/* ... todo o conteúdo dos steps permanece igual ... */}
            {step === 1 && (
              <form className={styles.form} onSubmit={handleNext}>
                <div className={styles.cardDesc}>{stepSubtitles[0]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Data de Nascimento *</label>
                    <input type="text" placeholder="dd/mm/aaaa" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Gênero *</label>
                    <select required>
                      <option value="">Selecione seu gênero</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className={styles.col}>
                    <label>CPF *</label>
                    <input type="text" placeholder="000.000.000-00" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Telefone *</label>
                    <input type="text" placeholder="(11) 99999-9999" required />
                  </div>
                  <div className={styles.col}>
                    <label>E-mail *</label>
                    <input type="email" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Endereço Completo *</label>
                    <input
                      type="text"
                      placeholder="Rua, número, complemento"
                      required
                    />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Cidade *</label>
                    <input type="text" placeholder="Sua cidade" required />
                  </div>
                  <div className={styles.colSmall}>
                    <label>Estado *</label>
                    <input type="text" placeholder="UF" required />
                  </div>
                  <div className={styles.colSmall}>
                    <label>CEP *</label>
                    <input type="text" placeholder="00000-000" required />
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={true}
                  isLast={false}
                />
              </form>
            )}
            {step === 2 && (
              <form className={styles.form} onSubmit={handleNext}>
                <div className={styles.cardDesc}>{stepSubtitles[1]}</div>
                {/* Histórico Médico Pessoal */}
                <div className={styles.row} style={{ flexWrap: "wrap" }}>
                  <div className={styles.col}>
                    <label>
                      <b>Histórico Médico Pessoal</b>
                    </label>
                    <div>
                      <input type="checkbox" /> Diabetes
                    </div>
                    <div>
                      <input type="checkbox" /> Colesterol alto
                    </div>
                    <div>
                      <input type="checkbox" /> AVC / Derrame
                    </div>
                    <div>
                      <input type="checkbox" /> Obesidade
                    </div>
                    <div>
                      <input type="checkbox" /> Câncer (especificar)
                    </div>
                    <div>
                      <input type="checkbox" /> Alergias graves (especificar)
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>&nbsp;</label>
                    <div>
                      <input type="checkbox" /> Hipertensão arterial
                    </div>
                    <div>
                      <input type="checkbox" /> Doença cardíaca
                    </div>
                    <div>
                      <input type="checkbox" /> Asma
                    </div>
                    <div>
                      <input type="checkbox" /> Hipotireoidismo /
                      Hipertireoidismo
                    </div>
                    <div>
                      <input type="checkbox" /> Depressão / Ansiedade
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    placeholder="Outras condições não listadas acima..."
                    rows={2}
                  ></textarea>
                </div>
                {/* Histórico Médico Familiar */}
                <div className={styles.row} style={{ flexWrap: "wrap" }}>
                  <div className={styles.col}>
                    <label>
                      <b>Histórico Médico Familiar</b>
                    </label>
                    <div>
                      <input type="checkbox" /> Diabetes
                    </div>
                    <div>
                      <input type="checkbox" /> Colesterol alto
                    </div>
                    <div>
                      <input type="checkbox" /> AVC / Derrame
                    </div>
                    <div>
                      <input type="checkbox" /> Câncer (especificar)
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>&nbsp;</label>
                    <div>
                      <input type="checkbox" /> Hipertensão arterial
                    </div>
                    <div>
                      <input type="checkbox" /> Doença cardíaca
                    </div>
                    <div>
                      <input type="checkbox" /> Obesidade
                    </div>
                    <div>
                      <input type="checkbox" /> Morte súbita antes dos 50 anos
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    placeholder="Outras condições familiares não listadas acima..."
                    rows={2}
                  ></textarea>
                </div>
                {/* Medicamentos, Suplementos, Alergias */}
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    placeholder="Liste os medicamentos que você usa atualmente (nome, dosagem, frequência)"
                    rows={2}
                  ></textarea>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    placeholder="Suplementos, vitaminas ou produtos naturais que você usa"
                    rows={2}
                  ></textarea>
                </div>
                <div className={styles.row}>
                  <textarea
                    className={styles.colFull}
                    placeholder="Alergias medicamentosas, alimentares ou outras"
                    rows={2}
                  ></textarea>
                </div>
                {/* Fuma/Álcool */}
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Você fuma?</label>
                    <div>
                      <input type="radio" name="fuma" /> Não
                    </div>
                    <div>
                      <input type="radio" name="fuma" /> Sim
                    </div>
                    <div>
                      <input type="radio" name="fuma" /> Parei de fumar
                    </div>
                  </div>
                  <div className={styles.col}>
                    <label>Você bebe álcool?</label>
                    <div>
                      <input type="radio" name="alcool" /> Não
                    </div>
                    <div>
                      <input type="radio" name="alcool" /> Socialmente
                    </div>
                    <div>
                      <input type="radio" name="alcool" /> Regularmente
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 3 && (
              <form className={styles.form} onSubmit={handleNext}>
                <div className={styles.cardDesc}>{stepSubtitles[2]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Motivo da Consulta *</label>
                    <textarea
                      required
                      placeholder="Qual o principal motivo que te trouxe aqui? (ex: emagrecimento, controle de diabetes, etc.)"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Descrição dos Sintomas</label>
                    <textarea
                      placeholder="Descreva os sintomas que você está sentindo, quando começaram, intensidade, etc."
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Há quanto tempo você tem esses sintomas?</label>
                    <select>
                      <option value="">Selecione o período</option>
                      <option value="dias">Dias</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                      <option value="anos">Anos</option>
                      <option value="nao-sinto">Não sinto sintomas</option>
                    </select>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 4 && (
              <form className={styles.form} onSubmit={handleNext}>
                <div className={styles.cardDesc}>{stepSubtitles[3]}</div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Peso Atual (kg) *</label>
                    <input type="number" placeholder="Ex: 70" required />
                  </div>
                  <div className={styles.col}>
                    <label>Altura (cm) *</label>
                    <input type="number" placeholder="Ex: 170" required />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Histórico de Peso</label>
                    <textarea
                      placeholder="Conte sobre variações de peso, tentativas anteriores de emagrecimento/ganho de peso"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Hábitos Alimentares</label>
                    <textarea
                      placeholder="Descreva sua rotina alimentar: quantas refeições por dia, tipos de alimentos, horários, restrições"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Atividade Física</label>
                    <textarea
                      placeholder="Que tipo de atividade física você pratica? Descreva intensidade e duração"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Frequência de Atividade Física</label>
                    <div className={styles.radioColWrap}>
                      <label>
                        <input
                          type="radio"
                          name="freqAtiv"
                          value="sedentario"
                        />{" "}
                        Sedentário (não pratico)
                      </label>
                      <label>
                        <input type="radio" name="freqAtiv" value="leve" /> Leve
                        (1-2x por semana)
                      </label>
                      <label>
                        <input type="radio" name="freqAtiv" value="moderado" />{" "}
                        Moderado (3-4x por semana)
                      </label>
                      <label>
                        <input type="radio" name="freqAtiv" value="intenso" />{" "}
                        Intenso (5+ vezes por semana)
                      </label>
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 5 && (
              <form className={styles.form} onSubmit={handleNext}>
                <div className={styles.cardDesc}>{stepSubtitles[4]}</div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Exames Recentes</label>
                    <textarea
                      placeholder="Descreva resultados de exames recentes (sangue, imagem, etc.)"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Anexar Arquivos de Exames</label>
                    <div
                      className={styles.uploadBox}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={handleExamesClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleExamesClick();
                      }}
                    >
                      <div className={styles.uploadIcon}>⤴️</div>
                      <div className={styles.uploadTitle}>
                        Clique para enviar <span>ou arraste arquivos</span>
                      </div>
                      <div className={styles.uploadDesc}>
                        PNG, JPG, PDF (MAX. 10MB cada)
                      </div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        ref={examesInputRef}
                        style={{ display: "none" }}
                        onChange={handleExamesChange}
                      />
                      {examesFiles.length > 0 && (
                        <ul
                          style={{ marginTop: 10, fontSize: 13, color: "#222" }}
                        >
                          {examesFiles.map((file, idx) => (
                            <li key={idx}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Diagnósticos Anteriores</label>
                    <textarea
                      placeholder="Liste diagnósticos médicos que você já recebeu"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.colFull}>
                    <label>Anexar Arquivos de Diagnósticos</label>
                    <div
                      className={styles.uploadBox}
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={handleDiagClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleDiagClick();
                      }}
                    >
                      <div className={styles.uploadIcon}>⤴️</div>
                      <div className={styles.uploadTitle}>
                        Clique para enviar <span>ou arraste arquivos</span>
                      </div>
                      <div className={styles.uploadDesc}>
                        PNG, JPG, PDF (MAX. 10MB cada)
                      </div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        ref={diagInputRef}
                        style={{ display: "none" }}
                        onChange={handleDiagChange}
                      />
                      {diagFiles.length > 0 && (
                        <ul
                          style={{ marginTop: 10, fontSize: 13, color: "#222" }}
                        >
                          {diagFiles.map((file, idx) => (
                            <li key={idx}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isFirst={false}
                  isLast={false}
                />
              </form>
            )}
            {step === 6 && (
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault(); /* aqui você pode enviar os dados finais */
                }}
              >
                <div className={styles.cardDesc}>{stepSubtitles[5]}</div>
                <div className={styles.termosCard}>
                  <label className={styles.termoLabel}>
                    <input type="checkbox" required />
                    <div>
                      Consentimento para Telemedicina *<br />
                      <span>
                        Concordo em receber atendimento médico através de
                        telemedicina e entendo suas limitações, incluindo a
                        impossibilidade de exame físico durante a consulta
                        online. Reconheço que, se necessário, poderei ser
                        orientado a buscar atendimento presencial.
                      </span>
                    </div>
                  </label>
                  <label className={styles.termoLabel}>
                    <input type="checkbox" required />
                    <div>
                      Consentimento para Tratamento de Dados (LGPD) *<br />
                      <span>
                        Autorizo a coleta, armazenamento e uso dos meus dados
                        pessoais e sensíveis de saúde para fins de prestação de
                        serviços médicos, conforme a Lei Geral de Proteção de
                        Dados (LGPD). Entendo que posso revogar este
                        consentimento a qualquer momento.
                      </span>
                    </div>
                  </label>
                  <label className={styles.termoLabel}>
                    <input type="checkbox" required />
                    <div>
                      Termos de Uso da Plataforma *<br />
                      <span>
                        Li e aceito os termos de uso da plataforma Slim Shape
                        Digital, incluindo as responsabilidades e limitações do
                        serviço de saúde digital oferecido.
                      </span>
                    </div>
                  </label>
                </div>
                <div className={styles.nextStepsCard}>
                  <div className={styles.nextStepsTitle}>
                    <span>✔️</span> Próximos Passos
                  </div>
                  <ul className={styles.nextStepsList}>
                    <li>
                      Sua avaliação será analisada por um médico especialista
                    </li>
                    <li>Você receberá um contato em até 24 horas</li>
                    <li>Se necessário, será agendada uma teleconsulta</li>
                    <li>
                      Prescrições (se indicadas) serão enviadas com assinatura
                      digital
                    </li>
                  </ul>
                </div>
                <ModalFooter
                  onPrev={handlePrev}
                  onNext={null}
                  isFirst={false}
                  isLast={true}
                  submitLabel="Enviar Avaliação"
                />
              </form>
            )}
          </ModalCard>
        </div>
        <ModalDivider />
      </div>
    </div>
  );
}

export default ModalAvaliacao;
