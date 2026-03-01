import { cn } from "@/lib/utils";

type StatusVariant = "active" | "partial" | "overdue" | "neutral" | "info" | "purple";

const variantMap: Record<string, StatusVariant> = {
  // Contratos
  "EN RENTA": "info",
  "ENTREGA PARCIAL": "partial",
  "ENTREGA TOTAL": "active",
  "RENOVACION": "purple",
  "RECOLECTADO": "neutral",
  "CANCELADO": "overdue",
  "VENTA": "neutral",
  // Cotizaciones
  borrador: "neutral",
  enviada: "info",
  aprobada: "active",
  rechazada: "overdue",
  convertida: "purple",
  // Clientes
  prospecto: "partial",
  cliente_activo: "active",
  inactivo: "neutral",
  // HS/HE
  pendiente: "partial",
  completada: "active",
  cancelada: "overdue",
};

const classMap: Record<StatusVariant, string> = {
  active: "status-active",
  partial: "status-partial",
  overdue: "status-overdue",
  neutral: "status-neutral",
  info: "status-info",
  purple: "status-purple",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = variantMap[status] || "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        classMap[variant]
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
