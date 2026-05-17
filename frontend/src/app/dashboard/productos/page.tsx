"use client";

import { useEffect, useState } from "react";
import { Plus, Search, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PredictionCard } from "@/components/PredictionCard";

interface Producto {
  id: number;
  nombre: string;
  precio_venta: string;
  costo: string;
  stock: number;
  stock_minimo: number;
  stock_bajo: boolean;
  margen_ganancia: number;
  codigo_barras: string;
  descripcion: string;
  is_active: boolean;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [predictionProduct, setPredictionProduct] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "", precio_venta: "", costo: "", stock: 0, stock_minimo: 0, codigo_barras: "", descripcion: "",
  });

  const load = () => {
    setLoading(true);
    api.get("/products/", { params: { search: search || undefined } })
      .then((r) => setProductos(r.data.results))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", precio_venta: "", costo: "", stock: 0, stock_minimo: 0, codigo_barras: "", descripcion: "" });
    setModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, precio_venta: p.precio_venta, costo: p.costo,
      stock: p.stock, stock_minimo: p.stock_minimo, codigo_barras: p.codigo_barras, descripcion: p.descripcion,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/products/${editing.id}/`, form);
      } else {
        await api.post("/products/", form);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Producto" },
    {
      key: "precio_venta",
      label: "Precio",
      render: (p: Producto) => `$${parseFloat(p.precio_venta).toLocaleString()}`,
    },
    {
      key: "costo",
      label: "Costo",
      render: (p: Producto) => `$${parseFloat(p.costo).toLocaleString()}`,
    },
    {
      key: "margen_ganancia",
      label: "Margen",
      render: (p: Producto) => (
        <span className={p.margen_ganancia > 50 ? "text-success" : "text-accent"}>
          {p.margen_ganancia.toFixed(0)}%
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (p: Producto) => (
        <span className={`font-semibold ${p.stock_bajo ? "text-danger" : "text-foreground"}`}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "stock_minimo",
      label: "Stock Mín",
      render: (p: Producto) => p.stock_minimo,
    },
    {
      key: "stock_bajo",
      label: "Estado",
      render: (p: Producto) =>
        p.stock <= 0 ? (
          <StatusBadge variant="danger">Sin Stock</StatusBadge>
        ) : p.stock_bajo ? (
          <StatusBadge variant="warning">Stock Bajo</StatusBadge>
        ) : (
          <StatusBadge variant="success">Normal</StatusBadge>
        ),
    },
    {
      key: "prediccion",
      label: "",
      render: (p: Producto) => (
        <button onClick={() => setPredictionProduct(p.id)} className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" /> Predecir
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 inline mr-1" /> Nuevo Producto
        </Button>
      </div>

      <div className="relative mb-4">
        <Modal open={predictionProduct !== null} onClose={() => setPredictionProduct(null)} title="Pronóstico de Demanda" size="sm">
          {predictionProduct && <PredictionCard productoId={predictionProduct} />}
        </Modal>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <DataTable columns={columns} data={productos} loading={loading} onEdit={openEdit} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Producto" : "Nuevo Producto"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Nombre">
            <Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio de Venta">
              <Input required type="number" step="0.01" min="0" value={form.precio_venta}
                onChange={(e) => setForm({ ...form, precio_venta: e.target.value })} />
            </FormField>
            <FormField label="Costo">
              <Input required type="number" step="0.01" min="0" value={form.costo}
                onChange={(e) => setForm({ ...form, costo: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stock Actual">
              <Input required type="number" min="0" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            </FormField>
            <FormField label="Stock Mínimo">
              <Input required type="number" min="0" value={form.stock_minimo}
                onChange={(e) => setForm({ ...form, stock_minimo: parseInt(e.target.value) || 0 })} />
            </FormField>
          </div>
          <FormField label="Código de Barras">
            <Input value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} />
          </FormField>
          <FormField label="Descripción">
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" rows={3} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
