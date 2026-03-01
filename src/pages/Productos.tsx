import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string | null;
  unidad_medida: string | null;
  precio_lista: number | null;
  peso_kg: number | null;
  rentable: boolean | null;
}

const emptyProducto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria: "",
  unidad_medida: "PZA",
  peso_kg: 0,
  precio_lista: 0,
  costo_unitario: 0,
  rentable: true,
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyProducto);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("codigo");
    setProductos(data || []);
  };

  useEffect(() => { fetchProductos(); }, []);

  const categories = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const filtered = productos.filter((p) => {
    const matchSearch = p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => { setForm(emptyProducto); setEditId(null); setDrawerOpen(true); };

  const openEdit = (p: Producto) => {
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: "",
      categoria: p.categoria || "",
      unidad_medida: p.unidad_medida || "PZA",
      peso_kg: p.peso_kg || 0,
      precio_lista: p.precio_lista || 0,
      costo_unitario: 0,
      rentable: p.rentable ?? true,
    });
    setEditId(p.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.codigo.trim() || !form.nombre.trim()) {
      toast.error("Código y nombre son requeridos");
      return;
    }
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from("productos").update(form).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Producto actualizado");
    } else {
      const { error } = await supabase.from("productos").insert(form);
      if (error) toast.error(error.message);
      else toast.success("Producto creado");
    }
    setSaving(false);
    setDrawerOpen(false);
    fetchProductos();
  };

  const formatMXN = (n: number | null) =>
    n != null ? `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">{productos.length} SKUs</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo producto
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por código o nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {categories.length > 0 && (
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 rounded-md border bg-card px-3 text-sm text-foreground"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c} value={c!}>{c}</option>)}
          </select>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Peso (kg)</TableHead>
              <TableHead>Rentable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(p)}>
                  <TableCell className="font-mono text-sm text-primary">{p.codigo}</TableCell>
                  <TableCell className="text-sm font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.categoria || "—"}</TableCell>
                  <TableCell className="text-sm">{p.unidad_medida || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatMXN(p.precio_lista)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{p.peso_kg ?? "—"}</TableCell>
                  <TableCell>
                    {p.rentable ? (
                      <span className="status-active text-xs px-2 py-0.5 rounded">Sí</span>
                    ) : (
                      <span className="status-neutral text-xs px-2 py-0.5 rounded">No</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editId ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Código *</Label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoría</Label>
                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio Lista (MXN)</Label>
                <Input type="number" value={form.precio_lista} onChange={(e) => setForm({ ...form, precio_lista: Number(e.target.value) })} className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.001" value={form.peso_kg} onChange={(e) => setForm({ ...form, peso_kg: Number(e.target.value) })} className="mt-1 font-mono" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.rentable} onCheckedChange={(v) => setForm({ ...form, rentable: v })} />
              <Label>Producto rentable</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : editId ? "Actualizar" : "Crear Producto"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
