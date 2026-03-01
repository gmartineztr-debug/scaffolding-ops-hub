
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operador');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(150),
  rol app_role DEFAULT 'operador',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND rol = _role
  )
$$;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, rol)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email), 'operador');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clientes
CREATE TABLE public.clientes (
  id SERIAL PRIMARY KEY,
  razon_social VARCHAR(200) NOT NULL,
  rfc VARCHAR(13) UNIQUE,
  tipo_cliente VARCHAR(50) CHECK (tipo_cliente IN ('prospecto','cliente_activo','inactivo')) DEFAULT 'prospecto',
  contacto_principal VARCHAR(150),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  limite_credito DECIMAL(12,2) DEFAULT 0,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Productos
CREATE TABLE public.productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  unidad_medida VARCHAR(20),
  peso_kg DECIMAL(10,3) DEFAULT 0,
  precio_lista DECIMAL(12,2) DEFAULT 0,
  costo_unitario DECIMAL(12,2) DEFAULT 0,
  rentable BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view productos" ON public.productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert productos" ON public.productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update productos" ON public.productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete productos" ON public.productos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Cotizaciones
CREATE TABLE public.cotizaciones (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(50) UNIQUE NOT NULL,
  cliente_id INTEGER REFERENCES public.clientes(id),
  fecha_emision DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  iva DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  estatus VARCHAR(50) DEFAULT 'borrador' CHECK (estatus IN ('borrador','enviada','aprobada','rechazada','convertida')),
  condiciones_pago TEXT,
  tiempo_entrega VARCHAR(100),
  vigencia_dias INTEGER,
  notas TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view cotizaciones" ON public.cotizaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert cotizaciones" ON public.cotizaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cotizaciones" ON public.cotizaciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete cotizaciones" ON public.cotizaciones FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cotizacion_items (
  id SERIAL PRIMARY KEY,
  cotizacion_id INTEGER NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES public.productos(id),
  descripcion VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  descuento_pct DECIMAL(5,2) DEFAULT 0,
  importe DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view cotizacion_items" ON public.cotizacion_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert cotizacion_items" ON public.cotizacion_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cotizacion_items" ON public.cotizacion_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete cotizacion_items" ON public.cotizacion_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Contratos
CREATE TABLE public.contratos (
  id SERIAL PRIMARY KEY,
  folio_c VARCHAR(50) UNIQUE NOT NULL,
  folio_raiz VARCHAR(50),
  renta_anterior VARCHAR(50),
  renta_posterior VARCHAR(50),
  sucursal VARCHAR(100) DEFAULT 'Torres',
  estatus VARCHAR(50) DEFAULT 'EN RENTA' CHECK (estatus IN ('EN RENTA','ENTREGA PARCIAL','ENTREGA TOTAL','RENOVACION','RECOLECTADO','CANCELADO','VENTA')),
  tipo_operacion VARCHAR(50) CHECK (tipo_operacion IN ('RENTA','VENTA','CANCELADO')),
  cliente_id INTEGER REFERENCES public.clientes(id),
  razon_social VARCHAR(200),
  obra VARCHAR(300),
  direccion_proyecto TEXT,
  ubicacion_entrega TEXT,
  quien_recibe VARCHAR(150),
  movil_recibe VARCHAR(20),
  requiere_flete BOOLEAN DEFAULT false,
  flete_a_cargo_de VARCHAR(50),
  distancia_km DECIMAL(8,2),
  costo_flete DECIMAL(10,2),
  dias_renta INTEGER,
  fecha_contrato DATE,
  fecha_solicitada DATE,
  fecha_inicio DATE,
  fecha_vencimiento_estimada DATE,
  fecha_vencimiento_real DATE,
  anticipo DECIMAL(12,2),
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  importe DECIMAL(12,2),
  renta_diaria DECIMAL(10,2),
  peso_total_kg DECIMAL(10,2),
  forma_pago VARCHAR(100),
  fecha_pago DATE,
  factura VARCHAR(50),
  agente VARCHAR(100),
  folio_hs VARCHAR(50),
  folio_he VARCHAR(50),
  notas TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contratos" ON public.contratos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete contratos" ON public.contratos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contrato_items (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES public.productos(id),
  codigo VARCHAR(50),
  descripcion VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(12,2) DEFAULT 0,
  peso_unitario_kg DECIMAL(10,3) DEFAULT 0,
  peso_total_kg DECIMAL(10,3) DEFAULT 0,
  importe DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contrato_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view contrato_items" ON public.contrato_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contrato_items" ON public.contrato_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contrato_items" ON public.contrato_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete contrato_items" ON public.contrato_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Hojas de Salida
CREATE TABLE public.hojas_salida (
  id SERIAL PRIMARY KEY,
  folio_hs VARCHAR(50) UNIQUE NOT NULL,
  contrato_id INTEGER REFERENCES public.contratos(id),
  folio_c VARCHAR(50),
  cliente_id INTEGER REFERENCES public.clientes(id),
  razon_social VARCHAR(200),
  obra VARCHAR(300),
  fecha_entrega DATE,
  hora_salida TIME,
  operador VARCHAR(150),
  total_piezas DECIMAL(10,2) DEFAULT 0,
  peso_total_kg DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  estatus VARCHAR(50) DEFAULT 'pendiente' CHECK (estatus IN ('pendiente','completada','cancelada')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hojas_salida ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view hojas_salida" ON public.hojas_salida FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert hojas_salida" ON public.hojas_salida FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hojas_salida" ON public.hojas_salida FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete hojas_salida" ON public.hojas_salida FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.hs_items (
  id SERIAL PRIMARY KEY,
  hs_id INTEGER NOT NULL REFERENCES public.hojas_salida(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES public.productos(id),
  codigo VARCHAR(50),
  descripcion VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  peso_unitario_kg DECIMAL(10,3) DEFAULT 0,
  peso_total_kg DECIMAL(10,3) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hs_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view hs_items" ON public.hs_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert hs_items" ON public.hs_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hs_items" ON public.hs_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete hs_items" ON public.hs_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Hojas de Entrada
CREATE TABLE public.hojas_entrada (
  id SERIAL PRIMARY KEY,
  folio_he VARCHAR(50) UNIQUE NOT NULL,
  contrato_id INTEGER REFERENCES public.contratos(id),
  folio_c VARCHAR(50),
  cliente_id INTEGER REFERENCES public.clientes(id),
  razon_social VARCHAR(200),
  obra VARCHAR(300),
  fecha_recepcion DATE,
  hora_llegada TIME,
  operador VARCHAR(150),
  total_piezas DECIMAL(10,2) DEFAULT 0,
  peso_total_kg DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  estatus VARCHAR(50) DEFAULT 'pendiente' CHECK (estatus IN ('pendiente','completada','cancelada')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hojas_entrada ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view hojas_entrada" ON public.hojas_entrada FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert hojas_entrada" ON public.hojas_entrada FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update hojas_entrada" ON public.hojas_entrada FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete hojas_entrada" ON public.hojas_entrada FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.he_items (
  id SERIAL PRIMARY KEY,
  he_id INTEGER NOT NULL REFERENCES public.hojas_entrada(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES public.productos(id),
  codigo VARCHAR(50),
  descripcion VARCHAR(500) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  peso_unitario_kg DECIMAL(10,3) DEFAULT 0,
  peso_total_kg DECIMAL(10,3) DEFAULT 0,
  condicion VARCHAR(50) DEFAULT 'Bueno' CHECK (condicion IN ('Bueno','Dañado','Incompleto')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.he_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view he_items" ON public.he_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert he_items" ON public.he_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update he_items" ON public.he_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete he_items" ON public.he_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Configuracion empresa
CREATE TABLE public.empresa_config (
  id SERIAL PRIMARY KEY,
  nombre_empresa VARCHAR(200) DEFAULT 'ICAM 360',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view config" ON public.empresa_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage config" ON public.empresa_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.empresa_config (nombre_empresa) VALUES ('ICAM 360');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
