import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Cliente {
  id: number;
  razon_social: string;
  rfc: string | null;
  tipo_cliente: string | null;
  contacto_principal: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  limite_credito: number | null;
  notas: string | null;
}

const emptyCliente = {
  razon_social: "",
  rfc: "",
  tipo_cliente: "prospecto",
  contacto_principal: "",
  telefono: "",
  email: "",
  direccion: "",
  limite_credito: 0,
  notas: "",
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyCliente);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("activo", true)
      .order("razon_social");
    setClientes(data || []);
  };

  useEffect(() => { fetchClientes(); }, []);

  const filtered = clientes.filter((c) =>
    c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
    (c.rfc && c.rfc.toLowerCase().includes(search.toLowerCase())) ||
    (c.telefono && c.telefono.includes(search))
  );

  const openNew = () => {
    setForm(emptyCliente);
    setEditId(null);
    setDrawerOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setForm({
      razon_social: c.razon_social,
      rfc: c.rfc || "",
      tipo_cliente: c.tipo_cliente || "prospecto",
      contacto_principal: c.contacto_principal || "",
      telefono: c.telefono || "",
      email: c.email || "",
      direccion: c.direccion || "",
      limite_credito: c.limite_credito || 0,
      notas: c.notas || "",
    });
    setEditId(c.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.razon_social.trim()) {
      toast.error("Razón social es requerida");
      return;
    }
    setSaving(true);

    if (editId) {
      const { error } = await supabase.from("clientes").update(form).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Cliente actualizado");
    } else {
      const { error } = await supabase.from("clientes").insert(form);
      if (error) toast.error(error.message);
      else toast.success("Cliente creado");
    }

    setSaving(false);
    setDrawerOpen(false);
    fetchClientes();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} registros</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por razón social, RFC o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón Social</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay clientes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openEdit(c)}
                >
                  <TableCell className="font-medium text-sm">{c.razon_social}</TableCell>
                  <TableCell className="font-mono text-sm">{c.rfc || "—"}</TableCell>
                  <TableCell className="text-sm">{c.telefono || "—"}</TableCell>
                  <TableCell className="text-sm">{c.email || "—"}</TableCell>
                  <TableCell><StatusBadge status={c.tipo_cliente || "prospecto"} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editId ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Razón Social *</Label>
              <Input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>RFC</Label>
              <Input value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} className="mt-1 font-mono" maxLength={13} />
            </div>
            <div>
              <Label>Tipo de Cliente</Label>
              <Select value={form.tipo_cliente} onValueChange={(v) => setForm({ ...form, tipo_cliente: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="cliente_activo">Cliente Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contacto Principal</Label>
              <Input value={form.contacto_principal} onChange={(e) => setForm({ ...form, contacto_principal: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Dirección</Label>
              <Textarea value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Límite de Crédito (MXN)</Label>
              <Input type="number" value={form.limite_credito} onChange={(e) => setForm({ ...form, limite_credito: Number(e.target.value) })} className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="mt-1" rows={3} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : editId ? "Actualizar" : "Crear Cliente"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
