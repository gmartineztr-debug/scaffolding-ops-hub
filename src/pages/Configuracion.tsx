import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  nombre: string | null;
  rol: string;
  activo: boolean | null;
}

export default function Configuracion() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [empresa, setEmpresa] = useState({ nombre_empresa: "", logo_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").then(({ data }) => setProfiles(data || []));
    supabase.from("empresa_config").select("*").limit(1).single()
      .then(({ data }) => {
        if (data) setEmpresa({ nombre_empresa: data.nombre_empresa || "", logo_url: data.logo_url || "" });
      });
  }, []);

  const saveEmpresa = async () => {
    setSaving(true);
    const { error } = await supabase.from("empresa_config").update(empresa).eq("id", 1);
    if (error) toast.error(error.message);
    else toast.success("Configuración guardada");
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Administración del sistema</p>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Datos de la Empresa</h2>
        </div>
        <div>
          <Label>Nombre de la Empresa</Label>
          <Input value={empresa.nombre_empresa} onChange={(e) => setEmpresa({ ...empresa, nombre_empresa: e.target.value })} className="mt-1 max-w-md" />
        </div>
        <div>
          <Label>URL del Logo</Label>
          <Input value={empresa.logo_url} onChange={(e) => setEmpresa({ ...empresa, logo_url: e.target.value })} className="mt-1 max-w-md" placeholder="https://..." />
        </div>
        <Button onClick={saveEmpresa} disabled={saving} size="sm">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Usuarios</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No hay usuarios
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium">{p.nombre || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.rol === "admin" ? "status-info" : "status-neutral"}`}>
                      {p.rol}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded ${p.activo ? "status-active" : "status-overdue"}`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
