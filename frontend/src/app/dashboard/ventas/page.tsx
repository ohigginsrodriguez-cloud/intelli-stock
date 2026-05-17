"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Venta {
  id: number;
  fecha: string;
  total: string;
  notas: string;
  productos: string;
  detalles: Array<{ id: number; producto: number; cantidad: number; precio_unitario: string; subtotal: string }>;
}

interface Producto {
  id: number;
  nombre: string;
  precio_venta: string;
  stock: number;
}

interface DetalleForm {
  producto: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: string;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 16), notas: "" });
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/sales/", { params: { search: search || undefined } })
      .then((r) => setVentas(r.data.results))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const loadProductos = async () => {
    const r = await api.get("/products/");
    setProductos(r.data.results);
  };

  const openCreate = () => {
    loadProductos();
    setForm({ fecha: new Date().toISOString().slice(0, 16), notas: "" });
    setDetalles([{ producto: 0, producto_nombre: "", cantidad: 1, precio_unitario: "0" }]);
    setModalOpen(true);
  };

  const addDetalle = () => {
    setDetalles([...detalles, { producto: 0, producto_nombre: "", cantidad: 1, precio_unitario: "0" }]);
  };

  const updateDetalle = (index: number, field: keyof DetalleForm, value: unknown) => {
    const updated = [...detalles];
    const det = { ...updated[index], [field]: value };
    if (field === "producto") {
      const prod = productos.find((p) => p.id === value);
      if (prod) {
        det.producto_nombre = prod.nombre;
        det.precio_unitario = prod.precio_venta;
      }
    }
    updated[index] = det;
    setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
    if (detalles.length > 1) setDetalles(detalles.filter((_, i) => i !== index));
  };

  const totalVenta = detalles.reduce((sum, d) => sum + (parseFloat(d.precio_unitario) || 0) * d.cantidad, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/sales/", {
        fecha: new Date(form.fecha).toISOString(),
        notas: form.notas,
        detalles: detalles.map((d) => ({
          producto: d.producto,
          cantidad: d.cantidad,
          precio_unitario: parseFloat(d.precio_unitario),
        })),
      });
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "id", label: "#", render: (v: Venta) => `#${v.id}` },
    {
      key: "fecha", label: "Fecha",
      render: (v: Venta) => new Date(v.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    },
    { key: "productos", label: "Productos", render: (v: Venta) => v.productos || `${v.detalles?.length || 0} productos` },
    { key: "total", label: "Total", render: (v: Venta) => <span className="font-semibold text-success">${parseFloat(v.total).toLocaleString()}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 inline mr-1" /> Nueva Venta</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ventas..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <DataTable columns={columns} data={ventas} loading={loading} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Venta" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Fecha y Hora">
            <Input type="datetime-local" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </FormField>

          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Productos</h3>
              <Button type="button" variant="secondary" onClick={addDetalle}>+ Agregar</Button>
            </div>
            {detalles.map((det, i) => (
              <div key={i} className="flex items-end gap-3 border-b border-border pb-3">
                <div className="flex-1">
                  <label className="text-xs text-muted">Producto</label>
                  <select value={det.producto || ""} onChange={(e) => updateDetalle(i, "producto", parseInt(e.target.value))}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                    <option value="">Seleccionar...</option>
                    {productos.filter((p) => p.stock > 0).map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted">Cantidad</label>
                  <input type="number" min="1" max="999" value={det.cantidad} onChange={(e) => updateDetalle(i, "cantidad", parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted">Precio Unit.</label>
                  <input type="number" step="0.01" value={det.precio_unitario} onChange={(e) => updateDetalle(i, "precio_unitario", e.target.value)}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="w-20 text-right">
                  <label className="text-xs text-muted">Subtotal</label>
                  <p className="text-sm font-semibold pt-2">${((parseFloat(det.precio_unitario) || 0) * det.cantidad).toFixed(0)}</p>
                </div>
                <button type="button" onClick={() => removeDetalle(i)} className="text-muted hover:text-danger p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="text-right pt-2">
              <span className="text-lg font-bold">Total: ${totalVenta.toFixed(2)}</span>
            </div>
          </div>

          <FormField label="Notas">
            <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" rows={2} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || detalles.some((d) => !d.producto)}>
              {saving ? "Guardando..." : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
