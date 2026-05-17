"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";

interface Compra {
  id: number;
  fecha: string;
  total: string;
  notas: string;
  proveedor: number;
  productos: string;
  detalles: Array<{ id: number; producto: number; cantidad: number; costo_unitario: string; subtotal: string }>;
}

interface DetalleForm {
  producto: number;
  producto_nombre: string;
  cantidad: number;
  costo_unitario: string;
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productos, setProductos] = useState<Array<{ id: number; nombre: string; costo: string }>>([]);
  const [proveedores, setProveedores] = useState<Array<{ id: number; nombre: string }>>([]);
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 16), notas: "", proveedor: 0 });
  const [detalles, setDetalles] = useState<DetalleForm[]>([{ producto: 0, producto_nombre: "", cantidad: 1, costo_unitario: "0" }]);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/purchases/", { params: { search: search || undefined } })
      .then((r) => setCompras(r.data.results))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const loadData = async () => {
    const [pr, pv] = await Promise.all([
      api.get("/products/"),
      api.get("/suppliers/"),
    ]);
    setProductos(pr.data.results);
    setProveedores(pv.data.results);
  };

  const openCreate = () => {
    loadData();
    setForm({ fecha: new Date().toISOString().slice(0, 16), notas: "", proveedor: 0 });
    setDetalles([{ producto: 0, producto_nombre: "", cantidad: 1, costo_unitario: "0" }]);
    setModalOpen(true);
  };

  const addDetalle = () => setDetalles([...detalles, { producto: 0, producto_nombre: "", cantidad: 1, costo_unitario: "0" }]);

  const updateDetalle = (index: number, field: keyof DetalleForm, value: unknown) => {
    const updated = [...detalles];
    const det = { ...updated[index], [field]: value };
    if (field === "producto") {
      const prod = productos.find((p) => p.id === value);
      if (prod) {
        det.producto_nombre = prod.nombre;
        det.costo_unitario = prod.costo;
      }
    }
    updated[index] = det;
    setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
    if (detalles.length > 1) setDetalles(detalles.filter((_, i) => i !== index));
  };

  const totalCompra = detalles.reduce((sum, d) => sum + (parseFloat(d.costo_unitario) || 0) * d.cantidad, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/purchases/", {
        proveedor: form.proveedor,
        fecha: new Date(form.fecha).toISOString(),
        notas: form.notas,
        detalles: detalles.map((d) => ({
          producto: d.producto,
          cantidad: d.cantidad,
          costo_unitario: parseFloat(d.costo_unitario),
        })),
      });
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "id", label: "#", render: (c: Compra) => `#${c.id}` },
    {
      key: "fecha", label: "Fecha",
      render: (c: Compra) => new Date(c.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "productos", label: "Productos", render: (c: Compra) => c.productos || `${c.detalles?.length || 0} productos` },
    { key: "total", label: "Total", render: (c: Compra) => <span className="font-semibold">${parseFloat(c.total).toLocaleString()}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 inline mr-1" /> Nueva Compra</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar compras..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <DataTable columns={columns} data={compras} loading={loading} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Compra" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha">
              <Input type="datetime-local" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </FormField>
            <FormField label="Proveedor">
              <select value={form.proveedor || ""} onChange={(e) => setForm({ ...form, proveedor: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                <option value="">Seleccionar...</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </FormField>
          </div>

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
                    {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted">Cantidad</label>
                  <input type="number" min="1" value={det.cantidad} onChange={(e) => updateDetalle(i, "cantidad", parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted">Costo Unit.</label>
                  <input type="number" step="0.01" value={det.costo_unitario} onChange={(e) => updateDetalle(i, "costo_unitario", e.target.value)}
                    className="w-full px-2 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="w-20 text-right">
                  <label className="text-xs text-muted">Subtotal</label>
                  <p className="text-sm font-semibold pt-2">${((parseFloat(det.costo_unitario) || 0) * det.cantidad).toFixed(0)}</p>
                </div>
                <button type="button" onClick={() => removeDetalle(i)} className="text-muted hover:text-danger p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="text-right pt-2">
              <span className="text-lg font-bold">Total: ${totalCompra.toFixed(2)}</span>
            </div>
          </div>

          <FormField label="Notas">
            <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" rows={2} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !form.proveedor || detalles.some((d) => !d.producto)}>
              {saving ? "Guardando..." : "Registrar Compra"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
