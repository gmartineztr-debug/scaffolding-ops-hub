import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Cotizacion {
  id: number;
  folio: string;
  cliente_id: number | null;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  subtotal: number | null;
  iva: number | null;
  total: number | null;
  estatus: string | null;
  condiciones_pago: string | null;
  tiempo_entrega: string | null;
  vigencia_dias: number | null;
  notas: string | null;
}

interface Cliente {
  id: number;
  razon_social: string;
  rfc: string | null;
  telefono: string | null;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio_lista: number | null;
}

interface LineItem {
  key: string;
  producto_id: number | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
  importe: number;
}

const newLineItem = (): LineItem => ({
  key: crypto.randomUUID(),
  producto_id: null,
  descripcion: "",
  cantidad: 1,
  precio_unitario: 0,
  descuento_pct: 0,
  importe: 0,
});

const formatMXN = (n: number | null) =>
  n != null ? `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—";

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [condicionesPago, setCondicionesPago] = useState("");
  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [vigenciaDias, setVigenciaDias] = useState(15);
  const [notas, setNotas] = useState("");
  const [estatus, setEstatus] = useState("borrador");
  const [items, setItems] = useState<LineItem[]>([newLineItem()]);

  const fetchAll = async () => {
    const [cotRes, cliRes, prodRes] = await Promise.all([
      supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, razon_social, rfc, telefono").eq("activo", true).order("razon_social"),
      supabase.from("productos").select("id, codigo, nombre, precio_lista").eq("activo", true).order("codigo"),
    ]);
    setCotizaciones(cotRes.data || []);
    setClientes(cliRes.data || []);
    setProductos(prodRes.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  // Client name lookup
  const clienteMap = useMemo(() => {
    const m = new Map<number, string>();
    clientes.forEach(c => m.set(c.id, c.razon_social));
    return m;
  }, [clientes]);

  const filtered = cotizaciones.filter((c) =>
    c.folio.toLowerCase().includes(search.toLowerCase()) ||
    (c.cliente_id && (clienteMap.get(c.cliente_id) || "").toLowerCase().includes(search.toLowerCase()))
  );

  // Client autocomplete
  const filteredClientes = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    (c.rfc && c.rfc.toLowerCase().includes(clienteSearch.toLowerCase()))
  ).slice(0, 8);

  // Line items calculations
  const calcImporte = (item: LineItem) => {
    const base = item.cantidad * item.precio_unitario;
    return base - (base * item.descuento_pct / 100);
  };

  const updateItem = (key: string, field: Partial<LineItem>) => {
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const updated = { ...item, ...field };
      updated.importe = calcImporte(updated);
      return updated;
    }));
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.length <= 1 ? prev : prev.filter(i => i.key !== key));
  };

  const subtotal = items.reduce((s, i) => s + i.importe, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Generate next folio
  const generateFolio = async () => {
    const { data } = await supabase
      .from("cotizaciones")
      .select("folio")
      .order("id", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const last = data[0].folio;
      const num = parseInt(last.replace(/\D/g, "")) || 0;
      return `COT-${String(num + 1).padStart(4, "0")}`;
    }
    return "COT-0001";
  };

  const resetForm = () => {
    setClienteId(null);
    setClienteSearch("");
    setCondicionesPago("");
    setTiempoEntrega("");
    setVigenciaDias(15);
    setNotas("");
    setEstatus("borrador");
    setItems([newLineItem()]);
    setEditId(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = async (cot: Cotizacion) => {
    setEditId(cot.id);
    setClienteId(cot.cliente_id);
    setClienteSearch(cot.cliente_id ? (clienteMap.get(cot.cliente_id) || "") : "");
    setCondicionesPago(cot.condiciones_pago || "");
    setTiempoEntrega(cot.tiempo_entrega || "");
    setVigenciaDias(cot.vigencia_dias || 15);
    setNotas(cot.notas || "");
    setEstatus(cot.estatus || "borrador");

    // Load items
    const { data } = await supabase
      .from("cotizacion_items")
      .select("*")
      .eq("cotizacion_id", cot.id);

    if (data && data.length > 0) {
      setItems(data.map(d => ({
        key: crypto.randomUUID(),
        producto_id: d.producto_id,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        descuento_pct: d.descuento_pct || 0,
        importe: d.importe,
      })));
    } else {
      setItems([newLineItem()]);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!clienteId) { toast.error("Selecciona un cliente"); return; }
    if (items.every(i => !i.descripcion.trim())) { toast.error("Agrega al menos un producto"); return; }

    setSaving(true);
    try {
      const validItems = items.filter(i => i.descripcion.trim());

      if (editId) {
        // Update cotización
        const { error } = await supabase.from("cotizaciones").update({
          cliente_id: clienteId,
          subtotal, iva, total,
          estatus,
          condiciones_pago: condicionesPago || null,
          tiempo_entrega: tiempoEntrega || null,
          vigencia_dias: vigenciaDias,
          notas: notas || null,
        }).eq("id", editId);
        if (error) throw error;

        // Delete old items and re-insert
        await supabase.from("cotizacion_items").delete().eq("cotizacion_id", editId);
        const { error: itemsError } = await supabase.from("cotizacion_items").insert(
          validItems.map(i => ({
            cotizacion_id: editId,
            producto_id: i.producto_id,
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            descuento_pct: i.descuento_pct,
            importe: i.importe,
          }))
        );
        if (itemsError) throw itemsError;
        toast.success("Cotización actualizada");
      } else {
        // Create new
        const folio = await generateFolio();
        const { data: user } = await supabase.auth.getUser();

        const { data: newCot, error } = await supabase.from("cotizaciones").insert({
          folio,
          cliente_id: clienteId,
          subtotal, iva, total,
          estatus,
          condiciones_pago: condicionesPago || null,
          tiempo_entrega: tiempoEntrega || null,
          vigencia_dias: vigenciaDias,
          notas: notas || null,
          created_by: user.user?.id || null,
        }).select("id").single();
        if (error) throw error;

        const { error: itemsError } = await supabase.from("cotizacion_items").insert(
          validItems.map(i => ({
            cotizacion_id: newCot.id,
            producto_id: i.producto_id,
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precio_unitario: i.precio_unitario,
            descuento_pct: i.descuento_pct,
            importe: i.importe,
          }))
        );
        if (itemsError) throw itemsError;
        toast.success(`Cotización ${folio} creada`);
      }

      setShowForm(false);
      resetForm();
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleProductSelect = (key: string, productoId: string) => {
    const prod = productos.find(p => p.id === Number(productoId));
    if (prod) {
      updateItem(key, {
        producto_id: prod.id,
        descripcion: prod.nombre,
        precio_unitario: prod.precio_lista || 0,
      });
    }
  };

  // ─── FORM VIEW ───
  if (showForm) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); resetForm(); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {editId ? "Editar Cotización" : "Nueva Cotización"}
            </h1>
          </div>
        </div>

        {/* Client + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card rounded-lg border p-4">
          <div className="relative">
            <Label>Cliente *</Label>
            <Input
              value={clienteSearch}
              onChange={(e) => {
                setClienteSearch(e.target.value);
                setShowClienteDropdown(true);
                if (!e.target.value) setClienteId(null);
              }}
              onFocus={() => setShowClienteDropdown(true)}
              placeholder="Buscar por razón social o RFC..."
              className="mt-1"
            />
            {showClienteDropdown && clienteSearch && filteredClientes.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredClientes.map(c => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    onClick={() => {
                      setClienteId(c.id);
                      setClienteSearch(c.razon_social);
                      setShowClienteDropdown(false);
                    }}
                  >
                    <span className="font-medium">{c.razon_social}</span>
                    {c.rfc && <span className="ml-2 text-muted-foreground font-mono text-xs">{c.rfc}</span>}
                    {c.telefono && <span className="ml-2 text-muted-foreground text-xs">{c.telefono}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Estatus</Label>
            <Select value={estatus} onValueChange={setEstatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Partidas</h2>
            <Button size="sm" variant="outline" onClick={() => setItems(prev => [...prev, newLineItem()])}>
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Producto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-20 text-right">Cant.</TableHead>
                <TableHead className="w-28 text-right">P. Unit.</TableHead>
                <TableHead className="w-20 text-right">Dto. %</TableHead>
                <TableHead className="w-28 text-right">Importe</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="p-2">
                    <Select
                      value={item.producto_id ? String(item.producto_id) : ""}
                      onValueChange={(v) => handleProductSelect(item.key, v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="SKU..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map(p => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            <span className="font-mono">{p.codigo}</span> — {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.descripcion}
                      onChange={(e) => updateItem(item.key, { descripcion: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) => updateItem(item.key, { cantidad: Number(e.target.value) })}
                      className="h-8 text-xs font-mono text-right"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.precio_unitario}
                      onChange={(e) => updateItem(item.key, { precio_unitario: Number(e.target.value) })}
                      className="h-8 text-xs font-mono text-right"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.descuento_pct}
                      onChange={(e) => updateItem(item.key, { descuento_pct: Number(e.target.value) })}
                      className="h-8 text-xs font-mono text-right"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-right font-mono text-sm">
                    {formatMXN(item.importe)}
                  </TableCell>
                  <TableCell className="p-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.key)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="border-t p-4 flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatMXN(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IVA 16%</span><span className="font-mono">{formatMXN(iva)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span className="font-mono">{formatMXN(total)}</span></div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card rounded-lg border p-4">
          <div>
            <Label>Condiciones de Pago</Label>
            <Input value={condicionesPago} onChange={(e) => setCondicionesPago(e.target.value)} className="mt-1" placeholder="Ej: 50% anticipo, 50% contra entrega" />
          </div>
          <div>
            <Label>Tiempo de Entrega</Label>
            <Input value={tiempoEntrega} onChange={(e) => setTiempoEntrega(e.target.value)} className="mt-1" placeholder="Ej: 3-5 días hábiles" />
          </div>
          <div>
            <Label>Vigencia (días)</Label>
            <Input type="number" value={vigenciaDias} onChange={(e) => setVigenciaDias(Number(e.target.value))} className="mt-1 font-mono" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <Label>Notas</Label>
          <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="mt-1" rows={3} />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : editId ? "Actualizar Cotización" : "Crear Cotización"}
          </Button>
          <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ─── TABLE VIEW ───
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">{cotizaciones.length} registros</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva cotización
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por folio o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono">Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay cotizaciones
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(c)}>
                  <TableCell className="font-mono text-sm text-primary">{c.folio}</TableCell>
                  <TableCell className="text-sm">{c.cliente_id ? clienteMap.get(c.cliente_id) || "—" : "—"}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {c.fecha_emision ? new Date(c.fecha_emision).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatMXN(c.total)}</TableCell>
                  <TableCell><StatusBadge status={c.estatus || "borrador"} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
