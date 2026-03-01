import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { FileCheck, Truck, AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContratoRow {
  id: number;
  folio_c: string;
  razon_social: string | null;
  obra: string | null;
  estatus: string;
  fecha_vencimiento_estimada: string | null;
  dias_renta: number | null;
}

export default function Dashboard() {
  const [contratos, setContratos] = useState<ContratoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("contratos")
        .select("id, folio_c, razon_social, obra, estatus, fecha_vencimiento_estimada, dias_renta")
        .in("estatus", ["EN RENTA", "ENTREGA PARCIAL"])
        .order("fecha_vencimiento_estimada", { ascending: true });
      setContratos(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const today = new Date();

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activos = contratos.filter((c) => c.estatus === "EN RENTA").length;
  const parciales = contratos.filter((c) => c.estatus === "ENTREGA PARCIAL").length;
  const vencidosEstaSemana = contratos.filter((c) => {
    const days = getDaysRemaining(c.fecha_vencimiento_estimada);
    return days !== null && days <= 7 && days >= 0;
  }).length;
  const porVencer15 = contratos.filter((c) => {
    const days = getDaysRemaining(c.fecha_vencimiento_estimada);
    return days !== null && days <= 15 && days > 7;
  }).length;

  const getTrafficLight = (dateStr: string | null) => {
    const days = getDaysRemaining(dateStr);
    if (days === null) return "neutral";
    if (days < 0) return "overdue";
    if (days <= 15) return "partial";
    return "active";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de operaciones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Contratos Activos" value={activos} icon={FileCheck} variant="default" />
        <KPICard title="Entregas Parciales" value={parciales} icon={Truck} variant="warning" />
        <KPICard title="Vencen esta semana" value={vencidosEstaSemana} icon={AlertTriangle} variant="danger" />
        <KPICard title="Por vencer (15 días)" value={porVencer15} icon={Clock} variant="success" />
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-foreground">Contratos Urgentes</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono">Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Días</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : contratos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay contratos activos
                </TableCell>
              </TableRow>
            ) : (
              contratos.map((c) => {
                const days = getDaysRemaining(c.fecha_vencimiento_estimada);
                const light = getTrafficLight(c.fecha_vencimiento_estimada);
                return (
                  <TableRow key={c.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link to={`/contratos`} className="font-mono text-sm text-primary hover:underline">
                        {c.folio_c}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{c.razon_social || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{c.obra || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.estatus} /></TableCell>
                    <TableCell className="text-sm font-mono">
                      {c.fecha_vencimiento_estimada
                        ? new Date(c.fecha_vencimiento_estimada).toLocaleDateString("es-MX", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {days !== null ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded ${
                          light === "overdue" ? "status-overdue" :
                          light === "partial" ? "status-partial" :
                          "status-active"
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
