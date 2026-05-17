"use client";

import { useEffect, useState } from "react";
import { Download, FileText, BarChart3, PieChart, TrendingUp, Search } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Tab = "ventas" | "inventario" | "margenes";

export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>("ventas");
  const [start, setStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);

    api.get(`/reports/${tab}/`, { params: { start, end } })
      .then((r) => { if (!cancelled) setData(r.data); })
      .catch(() => { if (!cancelled) setError("Error al cargar el reporte. Verifica las fechas e intenta de nuevo."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tab, start, end, retry]);

  const exportUrl = (fmt: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/reports/export/${fmt}/${tab}/?start=${start}&end=${end}`;

  const handleExport = (fmt: string) => {
    const token = localStorage.getItem("access_token");
    window.open(`${exportUrl(fmt)}&token=${token}`, "_blank");
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "ventas", label: "Ventas", icon: TrendingUp },
    { key: "inventario", label: "Inventario", icon: BarChart3 },
    { key: "margenes", label: "Márgenes", icon: PieChart },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport("pdf")}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setData(null); setTab(t.key); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-muted">Desde</label>
          <input type="date" value={start} onChange={(e) => { setData(null); setStart(e.target.value); }}
            className="px-2 py-1.5 border border-border rounded-lg bg-surface text-sm w-36" />
          <label className="text-xs text-muted">Hasta</label>
          <input type="date" value={end} onChange={(e) => { setData(null); setEnd(e.target.value); }}
            className="px-2 py-1.5 border border-border rounded-lg bg-surface text-sm w-36" />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-danger font-medium mb-2">{error}</p>
          <button onClick={() => setRetry((c) => c + 1)} className="text-sm text-primary underline">Reintentar</button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !data ? null : (
        <div className="space-y-6">
          {tab === "ventas" && <ReporteVentas data={data} />}
          {tab === "inventario" && <ReporteInventario data={data} />}
          {tab === "margenes" && <ReporteMargenes data={data} />}
        </div>
      )}
    </div>
  );
}

function ReporteVentas({ data }: { data: Record<string, unknown> }) {
  const r = data?.resumen as Record<string, unknown> | undefined;
  const resumen = {
    total_ventas: (r?.total_ventas as number) ?? 0,
    total_ingresos: (r?.total_ingresos as number) ?? 0,
    promedio_por_venta: (r?.promedio_por_venta as number) ?? 0,
  };
  const ventasPorDia = (data?.ventas_por_dia ?? []) as Array<{ dia: string; total: number; cantidad: number }>;
  const topProductos = (data?.productos_mas_vendidos ?? []) as Array<{ producto: string; cantidad: number; total: number }>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Ventas", value: resumen.total_ventas.toLocaleString() },
          { label: "Ingresos Totales", value: `$${resumen.total_ingresos.toLocaleString()}`, color: "text-success" },
          { label: "Promedio por Venta", value: `$${resumen.promedio_por_venta.toLocaleString()}`, color: "text-primary" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 text-2xl font-bold ${c.color || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Ventas por Día</h3>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {ventasPorDia.map((v) => (
              <div key={v.dia} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted">{new Date(v.dia).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted">{v.cantidad} ventas</span>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(((v.total ?? 0) / Math.max(...ventasPorDia.map((x) => x.total ?? 0), 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-success w-20 text-right">${(v.total ?? 0).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Productos Más Vendidos</h3>
          <div className="space-y-3">
            {topProductos.slice(0, 10).map((p, i) => (
              <div key={p.producto || i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted w-5">{i + 1}.</span>
                  <span className="text-sm">{p.producto}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{p.cantidad ?? 0} uds</span>
                  <span className="text-sm font-semibold text-success w-20 text-right">${(p.total ?? 0).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ReporteInventario({ data }: { data: Record<string, unknown> }) {
  const r = data?.resumen as Record<string, unknown> | undefined;
  const resumen = {
    total_productos: (r?.total_productos as number) ?? 0,
    valor_inventario: (r?.valor_inventario as number) ?? 0,
    stock_bajo: (r?.stock_bajo as number) ?? 0,
    sin_stock: (r?.sin_stock as number) ?? 0,
  };
  const categorias = (data?.categorias_stock ?? []) as Array<{ categoria: string; cantidad: number; color: string }>;
  const productos = (data?.productos ?? []) as Array<{ id: number; nombre: string; stock: number; stock_minimo: number; precio_venta: number; costo: number; valor: number }>;

  const maxCat = Math.max(...categorias.map((c) => c.cantidad), 1);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Productos", value: resumen.total_productos.toLocaleString() },
          { label: "Valor Inventario", value: `$${resumen.valor_inventario.toLocaleString()}`, color: "text-primary" },
          { label: "Stock Bajo", value: resumen.stock_bajo, color: "text-accent" },
          { label: "Sin Stock", value: resumen.sin_stock, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 text-2xl font-bold ${c.color || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Distribución de Stock</h3>
          <div className="space-y-3">
            {categorias.map((c) => (
              <div key={c.categoria}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{c.categoria}</span>
                  <span className="text-sm font-semibold">{c.cantidad} ({resumen.total_productos > 0 ? Math.round(c.cantidad / resumen.total_productos * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${c.color === "danger" ? "bg-danger" : c.color === "warning" ? "bg-accent" : "bg-success"}`}
                    style={{ width: `${(c.cantidad / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">Productos con Stock Crítico</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {productos.filter((p) => p.stock <= p.stock_minimo).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <p className="text-xs text-muted">Mín: {p.stock_minimo}</p>
                </div>
                <StatusBadge variant={p.stock === 0 ? "danger" : "warning"}>
                  {p.stock} uds
                </StatusBadge>
              </div>
            ))}
            {productos.filter((p) => p.stock <= p.stock_minimo).length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No hay productos con stock crítico</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ReporteMargenes({ data }: { data: Record<string, unknown> }) {
  const r = data?.resumen as Record<string, unknown> | undefined;
  const resumen = {
    ingresos_totales: (r?.ingresos_totales as number) ?? 0,
    costos_totales: (r?.costos_totales as number) ?? 0,
    ganancia_total: (r?.ganancia_total as number) ?? 0,
    margen_general: (r?.margen_general as number) ?? 0,
  };
  const detalle = (data?.detalle ?? []) as Array<{ producto: string; cantidad_vendida: number; ingresos: number; costo_total: number; ganancia: number; margen: number }>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Ingresos", value: `$${resumen.ingresos_totales.toLocaleString()}`, color: "text-success" },
          { label: "Costos", value: `$${resumen.costos_totales.toLocaleString()}`, color: "text-danger" },
          { label: "Ganancia", value: `$${resumen.ganancia_total.toLocaleString()}`, color: "text-primary" },
          { label: "Margen General", value: `${resumen.margen_general}%`, color: resumen.margen_general > 20 ? "text-success" : "text-accent" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 text-2xl font-bold ${c.color || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4">Detalle por Producto</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-muted">Producto</th>
                <th className="text-right py-3 px-3 font-medium text-muted">Vendidos</th>
                <th className="text-right py-3 px-3 font-medium text-muted">Ingresos</th>
                <th className="text-right py-3 px-3 font-medium text-muted">Costo</th>
                <th className="text-right py-3 px-3 font-medium text-muted">Ganancia</th>
                <th className="text-right py-3 px-3 font-medium text-muted">Margen</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((p, i) => (
                <tr key={p.producto || i} className="border-b border-border hover:bg-gray-50">
                  <td className="py-3 px-3">{p.producto}</td>
                  <td className="py-3 px-3 text-right">{p.cantidad_vendida ?? 0}</td>
                  <td className="py-3 px-3 text-right font-medium">${(p.ingresos ?? 0).toFixed(0)}</td>
                  <td className="py-3 px-3 text-right text-muted">${(p.costo_total ?? 0).toFixed(0)}</td>
                  <td className={`py-3 px-3 text-right font-medium ${(p.ganancia ?? 0) >= 0 ? "text-success" : "text-danger"}`}>
                    ${(p.ganancia ?? 0).toFixed(0)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <StatusBadge variant={(p.margen ?? 0) > 30 ? "success" : (p.margen ?? 0) > 10 ? "warning" : "danger"}>
                      {p.margen ?? 0}%
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
