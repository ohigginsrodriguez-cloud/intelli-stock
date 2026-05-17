"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShoppingCart,
  Bell,
} from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DashboardData {
  total_productos: number;
  stock_bajo: number;
  ingresos_mes: number;
  total_ventas_mes: number;
  costos_mes: number;
  margen_mes: number;
  alertas_pendientes: number;
  ventas_recientes: Array<{
    id: number;
    fecha: string;
    total: number;
    productos: string;
  }>;
  top_productos: Array<{
    producto__nombre: string;
    total_vendido: number;
  }>;
  predicciones?: Array<Record<string, unknown>>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    api
      .get("/dashboard/")
      .then((r) => {
        setData(r.data);
        const name = r.data.user?.nombre || r.data.user_name;
        if (name) localStorage.setItem("user_name", name);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: "Ingresos del Mes", value: `$${data.ingresos_mes.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Productos", value: data.total_productos, icon: Package, color: "text-primary" },
    { label: "Ventas del Mes", value: data.total_ventas_mes, icon: TrendingUp, color: "text-secondary" },
    { label: "Stock Bajo", value: data.stock_bajo, icon: AlertTriangle, color: "text-accent" },
    { label: "Alertas Pendientes", value: data.alertas_pendientes, icon: Bell, color: "text-danger" },
    { label: "Margen del Mes", value: `$${data.margen_mes.toLocaleString()}`, icon: DollarSign, color: data.margen_mes >= 0 ? "text-success" : "text-danger" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {data.predicciones && data.predicciones.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pronósticos de Demanda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.predicciones.map((p: Record<string, unknown>, i: number) => {
              const nombre = p.producto_nombre as string;
              const tendencia = p.tendencia as string;
              const reorden = p.recomendacion_reorden as Record<string, unknown> | undefined;
              const cantidad = (reorden?.cantidad_sugerida as number) || 0;
              return (
                <div key={nombre || String(i)} className="bg-surface rounded-lg p-3 border border-border">
                  <p className="text-sm font-medium truncate">{nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {tendencia === "creciente" ? <TrendingUp className="h-4 w-4 text-success" /> : tendencia === "decreciente" ? <TrendingDown className="h-4 w-4 text-danger" /> : <Minus className="h-4 w-4 text-muted" />}
                    <span className="text-xs capitalize text-muted">{tendencia}</span>
                  </div>
                  {cantidad > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                      <ShoppingCart className="h-3 w-3" />
                      Comprar: {cantidad} uds
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Productos Más Vendidos</h2>
          <div className="space-y-3">
            {data.top_productos.slice(0, 5).map((p, i) => (
              <div key={p.producto__nombre} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted w-5">#{i + 1}</span>
                  <span className="text-sm text-foreground">{p.producto__nombre}</span>
                </div>
                <span className="text-sm font-semibold text-primary">{p.total_vendido} vendidos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Ventas Recientes</h2>
          <div className="space-y-3">
            {data.ventas_recientes.map((v) => (
              <div key={v.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 text-muted" />
                  <div>
                    <p className="text-sm text-foreground">{v.productos}</p>
                    <p className="text-xs text-muted">{new Date(v.fecha).toLocaleDateString("es-MX")}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-success">${v.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


