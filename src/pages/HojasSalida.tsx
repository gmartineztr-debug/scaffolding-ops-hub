import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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
}

export default function HojasSalida() {
  const [hojas, setHojas] = useState<HS[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("hojas_salida").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setHojas(data || []));
  }, []);

  const filtered = hojas.filter((h) =>
    h.folio_hs.toLowerCase().includes(search.toLowerCase()) ||
    (h.folio_c && h.folio_c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Hojas de Salida</h1>
          <p className="text-sm text-muted-foreground">{hojas.length} registros</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva HS
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
