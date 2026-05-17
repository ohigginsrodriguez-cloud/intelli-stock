"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Lightbulb, RefreshCw, ShoppingCart, Percent, XCircle, PackageSearch, TrendingDown, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/FormField";

const alertaConfig: Record<string, { variant: "danger" | "warning" | "info"; icon: React.ElementType; label: string }> = {
  stock_critico: { variant: "danger", icon: AlertTriangle, label: "Stock Crítico" },
  sin_movimiento: { variant: "warning", icon: TrendingDown, label: "Sin Movimiento" },
  baja_ventas: { variant: "warning", icon: TrendingDown, label: "Baja de Ventas" },
  sobreinventario: { variant: "info", icon: PackageSearch, label: "Sobreinventario" },
};

const recomendacionConfig: Record<string, { variant: "success" | "info" | "warning" | "danger"; icon: React.ElementType; label: string }> = {
  reabastecer: { variant: "success", icon: ShoppingCart, label: "Reabastecer" },
  promocion: { variant: "warning", icon: Percent, label: "Promoción" },
  descuento: { variant: "danger", icon: Percent, label: "Descuento" },
  descontinuar: { variant: "danger", icon: XCircle, label: "Descontinuar" },
};

type Tab = "alertas" | "recomendaciones";

export default function AlertasPage() {
  const [tab, setTab] = useState<Tab>("alertas");
  const [alertas, setAlertas] = useState<any[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [ar, rr] = await Promise.all([
        api.get("/alerts/alertas/", { params: { ordering: "-fecha" } }),
        api.get("/alerts/recomendaciones/", { params: { ordering: "-fecha" } }),
      ]);
      setAlertas(ar.data.results);
      setRecomendaciones(rr.data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const marcarLeida = async (id: number) => {
    await api.post(`/alerts/alertas/${id}/marcar_leida/`);
    load();
  };

  const marcarAplicada = async (id: number) => {
    await api.post(`/alerts/recomendaciones/${id}/marcar_aplicada/`);
    load();
  };

  const marcarTodasLeidas = async () => {
    await api.post("/alerts/alertas/marcar_todas_leidas/");
    load();
  };

  const generarAhora = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const r = await api.post("/alerts/generate/");
      setMessage(r.data.mensaje);
      load();
    } finally {
      setGenerating(false);
    }
  };

  const pendientes = alertas.filter((a) => !a.leida).length;
  const recomendaciones_pendientes = recomendaciones.filter((r) => !r.aplicada).length;

  const renderAlerta = (a: any) => {
    const config = alertaConfig[a.tipo] || { variant: "default" as const, icon: Bell, label: a.tipo };
    const Icon = config.icon;
    return (
      <div key={a.id} className={`bg-card border rounded-xl p-5 transition-all ${a.leida ? "border-border opacity-70" : "border-l-4 border-l-danger"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`h-5 w-5 mt-0.5 ${a.leida ? "text-muted" : "text-danger"}`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
                {!a.leida && <span className="h-2 w-2 rounded-full bg-danger" />}
              </div>
              <p className="text-sm text-foreground mt-1">{a.mensaje}</p>
              {a.producto_nombre && <p className="text-xs text-muted mt-1">Producto: {a.producto_nombre}</p>}
              <p className="text-xs text-muted mt-0.5">
                {new Date(a.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          {!a.leida && <Button variant="secondary" onClick={() => marcarLeida(a.id)}>Marcar leída</Button>}
        </div>
      </div>
    );
  };

  const renderRecomendacion = (r: any) => {
    const config = recomendacionConfig[r.tipo] || { variant: "default" as const, icon: Lightbulb, label: r.tipo };
    const Icon = config.icon;
    return (
      <div key={r.id} className={`bg-card border rounded-xl p-5 transition-all ${r.aplicada ? "border-border opacity-60" : "border-l-4 border-l-success"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`h-5 w-5 mt-0.5 ${r.aplicada ? "text-muted" : "text-success"}`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
                {!r.aplicada && <span className="h-2 w-2 rounded-full bg-success" />}
              </div>
              <p className="text-sm text-foreground mt-1">{r.mensaje}</p>
              {r.producto_nombre && <p className="text-xs text-muted mt-1">Producto: {r.producto_nombre}</p>}
              <p className="text-xs text-muted mt-0.5">
                {new Date(r.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          {!r.aplicada && <Button variant="secondary" onClick={() => marcarAplicada(r.id)}>Aplicada</Button>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Alertas y Recomendaciones</h1>
          {pendientes > 0 && <StatusBadge variant="danger">{pendientes} alertas</StatusBadge>}
          {recomendaciones_pendientes > 0 && <StatusBadge variant="info">{recomendaciones_pendientes} recomendaciones</StatusBadge>}
        </div>
        <div className="flex items-center gap-2">
          {tab === "alertas" && pendientes > 0 && (
            <Button variant="secondary" onClick={marcarTodasLeidas}>
              <CheckCheck className="h-4 w-4 mr-1" /> Todas leídas
            </Button>
          )}
          <Button variant="secondary" onClick={generarAhora} disabled={generating}>
            <RefreshCw className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generando..." : "Analizar Ahora"}
          </Button>
        </div>
      </div>

      {message && (
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-sm mb-4">
          {message}
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button onClick={() => setTab("alertas")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "alertas" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
          Alertas {pendientes > 0 && `(${pendientes})`}
        </button>
        <button onClick={() => setTab("recomendaciones")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "recomendaciones" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
          Recomendaciones {recomendaciones_pendientes > 0 && `(${recomendaciones_pendientes})`}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : tab === "alertas" ? (
        alertas.length === 0 ? (
          <div className="text-center py-12 text-muted"><Bell className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No hay alertas</p></div>
        ) : (
          <div className="space-y-3">{alertas.map(renderAlerta)}</div>
        )
      ) : (
        recomendaciones.length === 0 ? (
          <div className="text-center py-12 text-muted"><Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No hay recomendaciones</p></div>
        ) : (
          <div className="space-y-3">{recomendaciones.map(renderRecomendacion)}</div>
        )
      )}
    </div>
  );
}
