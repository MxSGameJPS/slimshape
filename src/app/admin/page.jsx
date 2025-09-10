"use client";
import { useState } from "react";
import styles from "./admin.module.css";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [logged, setLogged] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (user === "Teste-admin" && pass === "teste123") {
      setLogged(true);
      setError("");
    } else {
      setError("Usuário ou senha inválidos");
    }
  }

  if (logged) {
    return (
      <div className={styles.adminDashboard}>
        <h2>Bem-vindo, Teste-admin!</h2>
        <p>Dashboard de exemplo carregado abaixo:</p>
        <iframe
          src="/dashboard/App.tsx"
          title="Dashboard Exemplo"
          style={{ width: "100%", height: "80vh", border: "none" }}
        />
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <h2>Login Admin</h2>
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
