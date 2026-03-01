export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          activo: boolean | null
          contacto_principal: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: number
          limite_credito: number | null
          notas: string | null
          razon_social: string
          rfc: string | null
          telefono: string | null
          tipo_cliente: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          contacto_principal?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: number
          limite_credito?: number | null
          notas?: string | null
          razon_social: string
          rfc?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          contacto_principal?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: number
          limite_credito?: number | null
          notas?: string | null
          razon_social?: string
          rfc?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contrato_items: {
        Row: {
          cantidad: number
          codigo: string | null
          contrato_id: number
          created_at: string | null
          descripcion: string
          id: number
          importe: number | null
          peso_total_kg: number | null
          peso_unitario_kg: number | null
          precio_unitario: number | null
          producto_id: number | null
        }
        Insert: {
          cantidad: number
          codigo?: string | null
          contrato_id: number
          created_at?: string | null
          descripcion: string
          id?: number
          importe?: number | null
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          precio_unitario?: number | null
          producto_id?: number | null
        }
        Update: {
          cantidad?: number
          codigo?: string | null
          contrato_id?: number
          created_at?: string | null
          descripcion?: string
          id?: number
          importe?: number | null
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          precio_unitario?: number | null
          producto_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_items_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          agente: string | null
          anticipo: number | null
          cliente_id: number | null
          costo_flete: number | null
          created_at: string | null
          created_by: string | null
          dias_renta: number | null
          direccion_proyecto: string | null
          distancia_km: number | null
          estatus: string | null
          factura: string | null
          fecha_contrato: string | null
          fecha_inicio: string | null
          fecha_pago: string | null
          fecha_solicitada: string | null
          fecha_vencimiento_estimada: string | null
          fecha_vencimiento_real: string | null
          flete_a_cargo_de: string | null
          folio_c: string
          folio_he: string | null
          folio_hs: string | null
          folio_raiz: string | null
          forma_pago: string | null
          id: number
          importe: number | null
          iva: number | null
          movil_recibe: string | null
          notas: string | null
          obra: string | null
          peso_total_kg: number | null
          quien_recibe: string | null
          razon_social: string | null
          renta_anterior: string | null
          renta_diaria: number | null
          renta_posterior: string | null
          requiere_flete: boolean | null
          subtotal: number | null
          sucursal: string | null
          tipo_operacion: string | null
          ubicacion_entrega: string | null
          updated_at: string | null
        }
        Insert: {
          agente?: string | null
          anticipo?: number | null
          cliente_id?: number | null
          costo_flete?: number | null
          created_at?: string | null
          created_by?: string | null
          dias_renta?: number | null
          direccion_proyecto?: string | null
          distancia_km?: number | null
          estatus?: string | null
          factura?: string | null
          fecha_contrato?: string | null
          fecha_inicio?: string | null
          fecha_pago?: string | null
          fecha_solicitada?: string | null
          fecha_vencimiento_estimada?: string | null
          fecha_vencimiento_real?: string | null
          flete_a_cargo_de?: string | null
          folio_c: string
          folio_he?: string | null
          folio_hs?: string | null
          folio_raiz?: string | null
          forma_pago?: string | null
          id?: number
          importe?: number | null
          iva?: number | null
          movil_recibe?: string | null
          notas?: string | null
          obra?: string | null
          peso_total_kg?: number | null
          quien_recibe?: string | null
          razon_social?: string | null
          renta_anterior?: string | null
          renta_diaria?: number | null
          renta_posterior?: string | null
          requiere_flete?: boolean | null
          subtotal?: number | null
          sucursal?: string | null
          tipo_operacion?: string | null
          ubicacion_entrega?: string | null
          updated_at?: string | null
        }
        Update: {
          agente?: string | null
          anticipo?: number | null
          cliente_id?: number | null
          costo_flete?: number | null
          created_at?: string | null
          created_by?: string | null
          dias_renta?: number | null
          direccion_proyecto?: string | null
          distancia_km?: number | null
          estatus?: string | null
          factura?: string | null
          fecha_contrato?: string | null
          fecha_inicio?: string | null
          fecha_pago?: string | null
          fecha_solicitada?: string | null
          fecha_vencimiento_estimada?: string | null
          fecha_vencimiento_real?: string | null
          flete_a_cargo_de?: string | null
          folio_c?: string
          folio_he?: string | null
          folio_hs?: string | null
          folio_raiz?: string | null
          forma_pago?: string | null
          id?: number
          importe?: number | null
          iva?: number | null
          movil_recibe?: string | null
          notas?: string | null
          obra?: string | null
          peso_total_kg?: number | null
          quien_recibe?: string | null
          razon_social?: string | null
          renta_anterior?: string | null
          renta_diaria?: number | null
          renta_posterior?: string | null
          requiere_flete?: boolean | null
          subtotal?: number | null
          sucursal?: string | null
          tipo_operacion?: string | null
          ubicacion_entrega?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_items: {
        Row: {
          cantidad: number
          cotizacion_id: number
          created_at: string | null
          descripcion: string
          descuento_pct: number | null
          id: number
          importe: number
          precio_unitario: number
          producto_id: number | null
        }
        Insert: {
          cantidad: number
          cotizacion_id: number
          created_at?: string | null
          descripcion: string
          descuento_pct?: number | null
          id?: number
          importe: number
          precio_unitario: number
          producto_id?: number | null
        }
        Update: {
          cantidad?: number
          cotizacion_id?: number
          created_at?: string | null
          descripcion?: string
          descuento_pct?: number | null
          id?: number
          importe?: number
          precio_unitario?: number
          producto_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          cliente_id: number | null
          condiciones_pago: string | null
          created_at: string | null
          created_by: string | null
          estatus: string | null
          fecha_emision: string | null
          fecha_vencimiento: string | null
          folio: string
          id: number
          iva: number | null
          notas: string | null
          subtotal: number | null
          tiempo_entrega: string | null
          total: number | null
          updated_at: string | null
          vigencia_dias: number | null
        }
        Insert: {
          cliente_id?: number | null
          condiciones_pago?: string | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          folio: string
          id?: number
          iva?: number | null
          notas?: string | null
          subtotal?: number | null
          tiempo_entrega?: string | null
          total?: number | null
          updated_at?: string | null
          vigencia_dias?: number | null
        }
        Update: {
          cliente_id?: number | null
          condiciones_pago?: string | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          folio?: string
          id?: number
          iva?: number | null
          notas?: string | null
          subtotal?: number | null
          tiempo_entrega?: string | null
          total?: number | null
          updated_at?: string | null
          vigencia_dias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_config: {
        Row: {
          id: number
          logo_url: string | null
          nombre_empresa: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          logo_url?: string | null
          nombre_empresa?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          logo_url?: string | null
          nombre_empresa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      he_items: {
        Row: {
          cantidad: number
          codigo: string | null
          condicion: string | null
          created_at: string | null
          descripcion: string
          he_id: number
          id: number
          peso_total_kg: number | null
          peso_unitario_kg: number | null
          producto_id: number | null
        }
        Insert: {
          cantidad: number
          codigo?: string | null
          condicion?: string | null
          created_at?: string | null
          descripcion: string
          he_id: number
          id?: number
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          producto_id?: number | null
        }
        Update: {
          cantidad?: number
          codigo?: string | null
          condicion?: string | null
          created_at?: string | null
          descripcion?: string
          he_id?: number
          id?: number
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          producto_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "he_items_he_id_fkey"
            columns: ["he_id"]
            isOneToOne: false
            referencedRelation: "hojas_entrada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "he_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      hojas_entrada: {
        Row: {
          cliente_id: number | null
          contrato_id: number | null
          created_at: string | null
          created_by: string | null
          estatus: string | null
          fecha_recepcion: string | null
          folio_c: string | null
          folio_he: string
          hora_llegada: string | null
          id: number
          notas: string | null
          obra: string | null
          operador: string | null
          peso_total_kg: number | null
          razon_social: string | null
          total_piezas: number | null
        }
        Insert: {
          cliente_id?: number | null
          contrato_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_recepcion?: string | null
          folio_c?: string | null
          folio_he: string
          hora_llegada?: string | null
          id?: number
          notas?: string | null
          obra?: string | null
          operador?: string | null
          peso_total_kg?: number | null
          razon_social?: string | null
          total_piezas?: number | null
        }
        Update: {
          cliente_id?: number | null
          contrato_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_recepcion?: string | null
          folio_c?: string | null
          folio_he?: string
          hora_llegada?: string | null
          id?: number
          notas?: string | null
          obra?: string | null
          operador?: string | null
          peso_total_kg?: number | null
          razon_social?: string | null
          total_piezas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hojas_entrada_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hojas_entrada_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      hojas_salida: {
        Row: {
          cliente_id: number | null
          contrato_id: number | null
          created_at: string | null
          created_by: string | null
          estatus: string | null
          fecha_entrega: string | null
          folio_c: string | null
          folio_hs: string
          hora_salida: string | null
          id: number
          notas: string | null
          obra: string | null
          operador: string | null
          peso_total_kg: number | null
          razon_social: string | null
          total_piezas: number | null
        }
        Insert: {
          cliente_id?: number | null
          contrato_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_entrega?: string | null
          folio_c?: string | null
          folio_hs: string
          hora_salida?: string | null
          id?: number
          notas?: string | null
          obra?: string | null
          operador?: string | null
          peso_total_kg?: number | null
          razon_social?: string | null
          total_piezas?: number | null
        }
        Update: {
          cliente_id?: number | null
          contrato_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estatus?: string | null
          fecha_entrega?: string | null
          folio_c?: string | null
          folio_hs?: string
          hora_salida?: string | null
          id?: number
          notas?: string | null
          obra?: string | null
          operador?: string | null
          peso_total_kg?: number | null
          razon_social?: string | null
          total_piezas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hojas_salida_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hojas_salida_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      hs_items: {
        Row: {
          cantidad: number
          codigo: string | null
          created_at: string | null
          descripcion: string
          hs_id: number
          id: number
          peso_total_kg: number | null
          peso_unitario_kg: number | null
          producto_id: number | null
        }
        Insert: {
          cantidad: number
          codigo?: string | null
          created_at?: string | null
          descripcion: string
          hs_id: number
          id?: number
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          producto_id?: number | null
        }
        Update: {
          cantidad?: number
          codigo?: string | null
          created_at?: string | null
          descripcion?: string
          hs_id?: number
          id?: number
          peso_total_kg?: number | null
          peso_unitario_kg?: number | null
          producto_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hs_items_hs_id_fkey"
            columns: ["hs_id"]
            isOneToOne: false
            referencedRelation: "hojas_salida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hs_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean | null
          categoria: string | null
          codigo: string
          costo_unitario: number | null
          created_at: string | null
          descripcion: string | null
          id: number
          nombre: string
          peso_kg: number | null
          precio_lista: number | null
          rentable: boolean | null
          unidad_medida: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria?: string | null
          codigo: string
          costo_unitario?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre: string
          peso_kg?: number | null
          precio_lista?: number | null
          rentable?: boolean | null
          unidad_medida?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: string | null
          codigo?: string
          costo_unitario?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre?: string
          peso_kg?: number | null
          precio_lista?: number | null
          rentable?: boolean | null
          unidad_medida?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string | null
          rol: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operador"],
    },
  },
} as const
