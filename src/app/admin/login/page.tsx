"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(username, password);
      sessionStorage.setItem("haiz_admin_token", token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>Admin Login</h2>
        <div className="field">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Masuk..." : "Masuk"}
        </button>
        {error && <div className="error-text">{error}</div>}
      </form>
    </div>
  );
}
