"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShoppingCart } from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "./ui/StatusBadge";

interface PredictionData {
  producto: { id: number; nombre: string; stock: number; stock_minimo: number };
  prediccion: {
    tendencia: string;
    variabilidad: string;
    confianza: number;
    predicciones: Array<{ fecha: string; prediccion: number; intervalo_inferior: number; intervalo_superior: number }>;
  };
  reorden: {
    prediccion_mensual: number;
    punto_reorden: number;
    cantidad_sugerida: number;
    dias_hasta_agotar: number;
    riesgo_desabasto: string;
  };
}

export function PredictionCard({ productoId }: { productoId: number }) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/predictions/${productoId}/`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productoId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (!data || !data.prediccion) return null;

  const { prediccion, reorden } = data;

  const tendenciaIcon = { creciente: <TrendingUp className="h-5 w-5 text-success" />, estable: <Minus className="h-5 w-5 text-muted" />, decreciente: <TrendingDown className="h-5 w-5 text-danger" /> };
  const riesgoVariant: Record<string, "danger" | "warning" | "success"> = { alto: "danger", medio: "warning", bajo: "success" };
  const semaforo = data.producto.stock <= data.producto.stock_minimo ? "danger" : data.producto.stock <= data.producto.stock_minimo * 2 ? "warning" : "success";

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Pronóstico de Demanda
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-lg p-3">
          <p className="text-xs text-muted mb-1">Tendencia</p>
          <div className="flex items-center gap-1.5">
            {tendenciaIcon[prediccion.tendencia as keyof typeof tendenciaIcon] || tendenciaIcon.estable}
            <span className="text-sm font-semibold capitalize">{prediccion.tendencia}</span>
          </div>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <p className="text-xs text-muted mb-1">Confianza</p>
          <p className={`text-sm font-semibold ${prediccion.confianza > 50 ? "text-success" : "text-accent"}`}>
            {prediccion.confianza.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Stock actual</span>
          <span className={`font-semibold ${semaforo === "danger" ? "text-danger" : semaforo === "warning" ? "text-accent" : "text-success"}`}>
            {data.producto.stock} uds
          </span>
        </div>
        {reorden && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Pronóstico mensual</span>
              <span className="font-semibold">{reorden.prediccion_mensual.toFixed(0)} uds</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Días hasta agotar</span>
              <span className={`font-semibold ${reorden.dias_hasta_agotar < 7 ? "text-danger" : "text-foreground"}`}>
                {reorden.dias_hasta_agotar} días
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Riesgo de desabasto</span>
              <StatusBadge variant={riesgoVariant[reorden.riesgo_desabasto] || "default"}>
                {reorden.riesgo_desabasto}
              </StatusBadge>
            </div>
            {reorden.cantidad_sugerida > 0 && (
              <div className="bg-primary/5 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Compra sugerida: <strong>{reorden.cantidad_sugerida} unidades</strong></span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
