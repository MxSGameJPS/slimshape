"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://slimshapeapi.vercel.app/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Swagger mostra o body em português: { usuario, senha }
        body: JSON.stringify({ usuario: user, senha: pass }),
      });

      if (!res.ok) {
        let msg = `Erro ${res.status}`;
        try {
          const json = await res.json();
          if (json && json.message) msg = json.message;
        } catch (err) {
          // ignore
        }
        setError(msg || "Usuário ou senha inválidos");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Espera: { token, admin } (admin provavelmente tem campo 'usuario')
      if (data?.token) {
        localStorage.setItem("adminToken", data.token);
        if (data.admin)
          localStorage.setItem("admin", JSON.stringify(data.admin));
      } else if (data?.token === undefined && data?.admin === undefined) {
        // corpo inesperado — guarda para debug
        console.warn("Resposta inesperada do login admin:", data);
        localStorage.setItem("adminAuth", JSON.stringify(data));
      }

      setLoading(false);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor. Tente novamente.");
      setLoading(false);
    }
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
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
