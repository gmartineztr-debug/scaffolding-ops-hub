import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Cotizacion {
  id: number;
  folio: string;
  cliente_id: number | null;
  fecha_emision: string | null;
  total: number | null;
  estatus: string;
}

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("cotizaciones").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setCotizaciones(data || []));
  }, []);

  const filtered = cotizaciones.filter((c) =>
    c.folio.toLowerCase().includes(search.toLowerCase())
  );

  const formatMXN = (n: number | null) =>
    n != null ? `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">{cotizaciones.length} registros</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva cotización
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por folio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono">Folio</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No hay cotizaciones
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-primary">{c.folio}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {c.fecha_emision ? new Date(c.fecha_emision).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatMXN(c.total)}</TableCell>
                  <TableCell><StatusBadge status={c.estatus} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
