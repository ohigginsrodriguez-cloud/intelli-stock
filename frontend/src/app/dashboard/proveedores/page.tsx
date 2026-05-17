"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Button } from "@/components/ui/FormField";

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "", email: "", direccion: "" });

  const load = () => {
    setLoading(true);
    api.get("/suppliers/", { params: { search: search || undefined } })
      .then((r) => setProveedores(r.data.results))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "" });
    setModalOpen(true);
  };

  const openEdit = (p: Proveedor) => {
    setEditing(p);
    setForm({ nombre: p.nombre, contacto: p.contacto, telefono: p.telefono, email: p.email, direccion: p.direccion });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/suppliers/${editing.id}/`, form);
      } else {
        await api.post("/suppliers/", form);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Proveedor" },
    { key: "contacto", label: "Contacto" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 inline mr-1" /> Nuevo Proveedor</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedores..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <DataTable columns={columns} data={proveedores} loading={loading} onEdit={openEdit} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Proveedor" : "Nuevo Proveedor"}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Nombre del Proveedor">
            <Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </FormField>
          <FormField label="Persona de Contacto">
            <Input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Teléfono">
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Dirección">
            <textarea value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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
