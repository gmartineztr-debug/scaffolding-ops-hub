import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface HS {
  id: number;
  folio_hs: string;
  folio_c: string | null;
  razon_social: string | null;
  fecha_entrega: string | null;
  operador: string | null;
  total_piezas: number | null;
  peso_total_kg: number | null;
  estatus: string;
  contrato_id: number | null;
  cliente_id: number | null;
  obra: string | null;
}

interface Contrato {
  id: number;
  folio_c: string;
  razon_social: string | null;
  obra: string | null;
  cliente_id: number | null;
  estatus: string | null;
  fecha_solicitada: string | null;
}

interface ContratoItem {
  id: number;
  contrato_id: number;
  producto_id: number | null;
  codigo: string | null;
  descripcion: string;
  cantidad: number;
  peso_unitario_kg: number | null;
  peso_total_kg: number | null;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  peso_kg: number | null;
}

interface HSLineItem {
  key: string;
  producto_id: number | null;
  codigo: string;
  descripcion: string;
  cantidad: number;
  peso_unitario_kg: number;
  peso_total_kg: number;
  contrato_qty: number; // from contract
  shipped_qty: number;  // already shipped
}

export default function HojasSalida() {
  const [hojas, setHojas] = useState<HS[]>([]);
  const [search, setSearch] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Contract selection
  const [activeContracts, setActiveContracts] = useState<Contrato[]>([]);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [contratoSearch, setContratoSearch] = useState("");

  // HS form fields
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split("T")[0]);
  const [horaSalida, setHoraSalida] = useState("");
  const [operador, setOperador] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<HSLineItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const fetchHojas = async () => {
    const { data } = await supabase
      .from("hojas_salida")
      .select("*")
      .order("created_at", { ascending: false });
    setHojas(data || []);
  };

  const fetchContracts = async () => {
    const { data } = await supabase
      .from("contratos")
      .select("id, folio_c, razon_social, obra, cliente_id, estatus, fecha_solicitada")
      .in("estatus", ["EN RENTA", "ENTREGA PARCIAL"])
      .order("created_at", { ascending: false });
    setActiveContracts(data || []);
  };

  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("id, codigo, nombre, peso_kg")
      .eq("activo", true)
      .order("codigo");
    setProductos(data || []);
  };

  useEffect(() => {
    fetchHojas();
    fetchContracts();
    fetchProductos();
  }, []);

  const filtered = hojas.filter((h) =>
    h.folio_hs.toLowerCase().includes(search.toLowerCase()) ||
    (h.folio_c && h.folio_c.toLowerCase().includes(search.toLowerCase())) ||
    (h.razon_social && h.razon_social.toLowerCase().includes(search.toLowerCase()))
  );

  // Load contract items + already shipped quantities
  const loadContractItems = async (contrato: Contrato) => {
    const [itemsRes, shippedRes] = await Promise.all([
      supabase.from("contrato_items").select("*").eq("contrato_id", contrato.id),
      supabase.from("hs_items")
        .select("producto_id, cantidad, hs_id")
        .in("hs_id",
          (await supabase.from("hojas_salida").select("id").eq("contrato_id", contrato.id)).data?.map(h => h.id) || []
        ),
    ]);

    const contratoItems = itemsRes.data || [];
    const shippedItems = shippedRes.data || [];

    // Sum shipped qty per producto_id
    const shippedMap = new Map<number, number>();
    shippedItems.forEach(si => {
      if (si.producto_id) {
        shippedMap.set(si.producto_id, (shippedMap.get(si.producto_id) || 0) + si.cantidad);
      }
    });

    const lineItems: HSLineItem[] = contratoItems.map(ci => {
      const shipped = ci.producto_id ? (shippedMap.get(ci.producto_id) || 0) : 0;
      const pending = Math.max(0, ci.cantidad - shipped);
      return {
        key: crypto.randomUUID(),
        producto_id: ci.producto_id,
        codigo: ci.codigo || "",
        descripcion: ci.descripcion,
        cantidad: pending,
        peso_unitario_kg: ci.peso_unitario_kg || 0,
        peso_total_kg: pending * (ci.peso_unitario_kg || 0),
        contrato_qty: ci.cantidad,
        shipped_qty: shipped,
      };
    });

    setItems(lineItems);
  };

  const selectContrato = async (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setContratoSearch(contrato.folio_c);
    await loadContractItems(contrato);
  };

  const totalPiezas = items.reduce((s, i) => s + i.cantidad, 0);
  const totalPeso = items.reduce((s, i) => s + i.peso_total_kg, 0);

  const updateItem = (key: string, field: Partial<HSLineItem>) => {
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const updated = { ...item, ...field };
      if ("cantidad" in field) {
        updated.peso_total_kg = updated.cantidad * updated.peso_unitario_kg;
      }
      return updated;
    }));
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  // Generate folio
  const generateFolio = async () => {
    const { data } = await supabase
      .from("hojas_salida")
      .select("folio_hs")
      .order("id", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const num = parseInt(data[0].folio_hs.replace(/\D/g, "")) || 0;
      return `HS-${String(num + 1).padStart(4, "0")}`;
    }
    return "HS-0001";
  };

  const resetForm = () => {
    setSelectedContrato(null);
    setContratoSearch("");
    setFechaEntrega(new Date().toISOString().split("T")[0]);
    setHoraSalida("");
    setOperador("");
    setNotas("");
    setItems([]);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedContrato) { toast.error("Selecciona un contrato"); return; }
    const validItems = items.filter(i => i.cantidad > 0);
    if (validItems.length === 0) { toast.error("Agrega al menos un item con cantidad > 0"); return; }

    setSaving(true);
    try {
      const folio = await generateFolio();
      const { data: user } = await supabase.auth.getUser();

      // Create HS
      const { data: newHS, error } = await supabase.from("hojas_salida").insert({
        folio_hs: folio,
        folio_c: selectedContrato.folio_c,
        contrato_id: selectedContrato.id,
        cliente_id: selectedContrato.cliente_id,
        razon_social: selectedContrato.razon_social,
        obra: selectedContrato.obra,
        fecha_entrega: fechaEntrega || null,
        hora_salida: horaSalida || null,
        operador: operador || null,
        total_piezas: totalPiezas,
        peso_total_kg: totalPeso,
        estatus: "completada",
        notas: notas || null,
        created_by: user.user?.id || null,
      }).select("id").single();
      if (error) throw error;

      // Create HS items
      const { error: itemsErr } = await supabase.from("hs_items").insert(
        validItems.map(i => ({
          hs_id: newHS.id,
          producto_id: i.producto_id,
          codigo: i.codigo || null,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          peso_unitario_kg: i.peso_unitario_kg,
          peso_total_kg: i.peso_total_kg,
        }))
      );
      if (itemsErr) throw itemsErr;

      // Update contract status based on total shipped
      // Re-fetch all shipped items for this contract
      const { data: allHs } = await supabase
        .from("hojas_salida")
        .select("id")
        .eq("contrato_id", selectedContrato.id);
      const hsIds = (allHs || []).map(h => h.id);

      const { data: allShipped } = await supabase
        .from("hs_items")
        .select("producto_id, cantidad")
        .in("hs_id", hsIds);

      const shippedMap = new Map<number, number>();
      (allShipped || []).forEach(si => {
        if (si.producto_id) {
          shippedMap.set(si.producto_id, (shippedMap.get(si.producto_id) || 0) + si.cantidad);
        }
      });

      const { data: contratoItems } = await supabase
        .from("contrato_items")
        .select("producto_id, cantidad")
        .eq("contrato_id", selectedContrato.id);

      const allFullyShipped = (contratoItems || []).every(ci => {
        const shipped = ci.producto_id ? (shippedMap.get(ci.producto_id) || 0) : 0;
        return shipped >= ci.cantidad;
      });

      const newEstatus = allFullyShipped ? "ENTREGA TOTAL" : "ENTREGA PARCIAL";
      await supabase.from("contratos").update({
        estatus: newEstatus,
        folio_hs: folio,
      }).eq("id", selectedContrato.id);

      toast.success(`Hoja de salida ${folio} creada — Contrato: ${newEstatus}`);
      setShowForm(false);
      resetForm();
      fetchHojas();
      fetchContracts();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Filter active contracts for search
  const filteredContracts = activeContracts.filter(c =>
    c.folio_c.toLowerCase().includes(contratoSearch.toLowerCase()) ||
    (c.razon_social && c.razon_social.toLowerCase().includes(contratoSearch.toLowerCase()))
  );

  // ─── FORM VIEW ───
  if (showForm) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); resetForm(); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Nueva Hoja de Salida</h1>
        </div>

        {/* Section A: Contract selection */}
        {!selectedContrato ? (
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <Label className="text-sm font-semibold">Seleccionar Contrato</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por folio o cliente..."
                  value={contratoSearch}
                  onChange={(e) => setContratoSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Recent contracts as cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(contratoSearch ? filteredContracts : activeContracts.slice(0, 6)).map(c => (
                <button
                  key={c.id}
                  onClick={() => selectContrato(c)}
                  className="bg-card border rounded-lg p-4 text-left hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <div className="font-mono text-sm text-primary font-bold">{c.folio_c}</div>
                  <div className="text-sm font-medium mt-1 truncate">{c.razon_social || "—"}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{c.obra || "Sin obra"}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={c.estatus || "EN RENTA"} />
                    {c.fecha_solicitada && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(c.fecha_solicitada).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {activeContracts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay contratos activos</p>
            )}
          </div>
        ) : (
          <>
            {/* Selected contract header */}
            <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-primary font-bold text-sm">{selectedContrato.folio_c}</span>
                <span className="mx-2 text-muted-foreground">—</span>
                <span className="text-sm font-medium">{selectedContrato.razon_social}</span>
                {selectedContrato.obra && (
                  <span className="ml-2 text-xs text-muted-foreground">({selectedContrato.obra})</span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedContrato(null); setItems([]); setContratoSearch(""); }}>
                Cambiar
              </Button>
            </div>

            {/* Section B: Delivery data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card rounded-lg border p-4">
              <div>
                <Label>Fecha de Entrega</Label>
                <Input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Hora de Salida</Label>
                <Input type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Operador</Label>
                <Input value={operador} onChange={(e) => setOperador(e.target.value)} className="mt-1" placeholder="Nombre del operador" />
              </div>
            </div>

            {/* Section C: Equipment */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-sm font-semibold text-foreground">Equipos a Entregar</h2>
                <p className="text-xs text-muted-foreground mt-1">Las cantidades se pre-llenan con lo pendiente del contrato</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono w-24">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right w-20">Contrato</TableHead>
                    <TableHead className="text-right w-20">Enviado</TableHead>
                    <TableHead className="text-right w-24">A Enviar</TableHead>
                    <TableHead className="text-right w-24">Peso U. (kg)</TableHead>
                    <TableHead className="text-right w-24">Peso T. (kg)</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Este contrato no tiene partidas
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => {
                      const fullyShipped = item.shipped_qty >= item.contrato_qty;
                      return (
                        <TableRow key={item.key} className={fullyShipped ? "opacity-50" : ""}>
                          <TableCell className="p-2 font-mono text-xs">{item.codigo || "—"}</TableCell>
                          <TableCell className="p-2 text-sm">
                            {item.descripcion}
                            {fullyShipped && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs status-active px-1.5 py-0.5 rounded">
                                <CheckCircle className="h-3 w-3" /> Enviado
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="p-2 text-right font-mono text-xs">{item.contrato_qty}</TableCell>
                          <TableCell className="p-2 text-right font-mono text-xs">{item.shipped_qty}</TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min={0}
                              max={item.contrato_qty - item.shipped_qty}
                              value={item.cantidad}
                              onChange={(e) => updateItem(item.key, { cantidad: Number(e.target.value) })}
                              className="h-8 text-xs font-mono text-right"
                              disabled={fullyShipped}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-right font-mono text-xs">{item.peso_unitario_kg}</TableCell>
                          <TableCell className="p-2 text-right font-mono text-xs">{item.peso_total_kg.toFixed(2)}</TableCell>
                          <TableCell className="p-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.key)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t p-4 flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Piezas</span>
                    <span className="font-mono font-bold">{totalPiezas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso Total (kg)</span>
                    <span className="font-mono font-bold">{totalPeso.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-card rounded-lg border p-4">
              <Label>Notas</Label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="mt-1" rows={3} />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Crear Hoja de Salida"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── TABLE VIEW ───
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Hojas de Salida</h1>
          <p className="text-sm text-muted-foreground">{hojas.length} registros</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva HS
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
              <TableHead className="font-mono">Folio HS</TableHead>
              <TableHead className="font-mono">Contrato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead className="text-right">Piezas</TableHead>
              <TableHead className="text-right">Peso (kg)</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay hojas de salida
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((h) => (
                <TableRow key={h.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-primary">{h.folio_hs}</TableCell>
                  <TableCell className="font-mono text-sm">{h.folio_c || "—"}</TableCell>
                  <TableCell className="text-sm">{h.razon_social || "—"}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {h.fecha_entrega ? new Date(h.fecha_entrega).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{h.operador || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{h.total_piezas ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{h.peso_total_kg ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={h.estatus} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
