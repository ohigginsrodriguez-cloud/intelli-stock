"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login/", { email, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <PackageSearch className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">IntelliStock</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold text-center text-foreground">
            Iniciar Sesión
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="admin@intellistock.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Entrar
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
