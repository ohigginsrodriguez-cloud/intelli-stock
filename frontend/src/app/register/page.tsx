"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    negocio: "",
    tipo_negocio: "otros",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register/", form);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { email?: string[] } } };
        setError(axiosErr.response?.data?.email?.[0] || "Error al registrar. Verifica tus datos.");
      } else {
        setError("Error al registrar. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <PackageSearch className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">InteliStock</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold text-center">Crear Cuenta</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Nombre del negocio</label>
              <input type="text" required value={form.negocio} onChange={update("negocio")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Mi Tienda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tipo de negocio</label>
              <select value={form.tipo_negocio} onChange={update("tipo_negocio")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="abarrotes">Abarrotes</option>
                <option value="ferreteria">Ferretería</option>
                <option value="papeleria">Papelería</option>
                <option value="farmacia">Farmacia</option>
                <option value="restaurante">Restaurante</option>
                <option value="tienda">Tienda de Ropa</option>
                <option value="otros">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tu nombre</label>
              <input type="text" required value={form.nombre} onChange={update("nombre")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Correo electrónico</label>
              <input type="email" required value={form.email} onChange={update("email")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="juan@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Contraseña</label>
              <input type="password" required value={form.password} onChange={update("password")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
