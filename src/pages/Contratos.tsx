import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Contrato {
  id: number;
  folio_c: string;
  folio_raiz: string | null;
  razon_social: string | null;
  dias_renta: number | null;
  fecha_vencimiento_estimada: string | null;
  estatus: string;
}

export default function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("contratos").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setContratos(data || []));
  }, []);

  const filtered = contratos.filter((c) =>
    c.folio_c.toLowerCase().includes(search.toLowerCase()) ||
    (c.razon_social && c.razon_social.toLowerCase().includes(search.toLowerCase()))
  );

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-foreground">Contratos</h1>
        <p className="text-sm text-muted-foreground">{contratos.length} registros</p>
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
              <TableHead className="font-mono">Raíz</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Días Renta</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Días Restantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay contratos
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const days = getDaysRemaining(c.fecha_vencimiento_estimada);
                return (
                  <TableRow key={c.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm text-primary">{c.folio_c}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{c.folio_raiz || "—"}</TableCell>
                    <TableCell className="text-sm">{c.razon_social || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{c.dias_renta || "—"}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {c.fecha_vencimiento_estimada
                        ? new Date(c.fecha_vencimiento_estimada).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={c.estatus} /></TableCell>
                    <TableCell>
                      {days !== null ? (
                        <span className={`font-mono text-xs font-medium px-2 py-0.5 rounded ${
                          days < 0 ? "status-overdue" : days <= 15 ? "status-partial" : "status-active"
                        }`}>
                          {days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`}
                        </span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
