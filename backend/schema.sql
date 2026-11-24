CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  telefono VARCHAR(30),
  ci VARCHAR(30),
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('Administrador', 'Camionero', 'Cliente')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_lower_uidx ON usuarios (LOWER(email));

CREATE TABLE IF NOT EXISTS inventario_planta (
  capacidad_kg SMALLINT PRIMARY KEY CHECK (capacidad_kg IN (10, 45)),
  cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zonas (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ciudad VARCHAR(80) NOT NULL CHECK (ciudad IN ('La Paz', 'El Alto')),
  macrodistrito VARCHAR(100),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ciudad, nombre)
);

CREATE TABLE IF NOT EXISTS camiones (
  id BIGSERIAL PRIMARY KEY,
  placa VARCHAR(20) NOT NULL UNIQUE,
  camionero_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  marca VARCHAR(60),
  modelo VARCHAR(60),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  latitud NUMERIC(9, 6) CHECK (latitud BETWEEN -90 AND 90),
  longitud NUMERIC(9, 6) CHECK (longitud BETWEEN -180 AND 180),
  ubicacion VARCHAR(250),
  ultima_ubicacion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS camiones_camionero_idx ON camiones (camionero_id);

CREATE TABLE IF NOT EXISTS despachos (
  id BIGSERIAL PRIMARY KEY,
  camion_id BIGINT NOT NULL REFERENCES camiones(id),
  camionero_id BIGINT NOT NULL REFERENCES usuarios(id),
  zona_id BIGINT NOT NULL REFERENCES zonas(id),
  administrador_id BIGINT NOT NULL REFERENCES usuarios(id),
  capacidad_kg SMALLINT NOT NULL CHECK (capacidad_kg IN (10, 45)),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS despachos_created_at_idx ON despachos (created_at DESC);
CREATE INDEX IF NOT EXISTS despachos_camionero_idx ON despachos (camionero_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rutas (
  id BIGSERIAL PRIMARY KEY,
  camion_id BIGINT NOT NULL REFERENCES camiones(id),
  camionero_id BIGINT NOT NULL REFERENCES usuarios(id),
  zona_id BIGINT NOT NULL REFERENCES zonas(id),
  despacho_id BIGINT REFERENCES despachos(id) ON DELETE SET NULL,
  capacidad_kg SMALLINT NOT NULL DEFAULT 10 CHECK (capacidad_kg IN (10, 45)),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('PENDIENTE', 'ACTIVA', 'FINALIZADA', 'CANCELADA')),
  garrafas_iniciales INTEGER NOT NULL DEFAULT 0 CHECK (garrafas_iniciales >= 0),
  garrafas_entregadas INTEGER NOT NULL DEFAULT 0 CHECK (
    garrafas_entregadas >= 0 AND garrafas_entregadas <= garrafas_iniciales
  ),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS rutas_un_camion_activo_uidx
  ON rutas (camion_id) WHERE estado = 'ACTIVA';
CREATE INDEX IF NOT EXISTS rutas_camionero_estado_idx ON rutas (camionero_id, estado);
CREATE INDEX IF NOT EXISTS rutas_zona_idx ON rutas (zona_id);

CREATE TABLE IF NOT EXISTS movimientos_garrafas (
  id BIGSERIAL PRIMARY KEY,
  capacidad_kg SMALLINT NOT NULL CHECK (capacidad_kg IN (10, 45)),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  tipo VARCHAR(20) NOT NULL
    CHECK (tipo IN ('ENTRADA_PLANTA', 'SALIDA_PLANTA', 'RETORNO_VACIOS')),
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  despacho_id BIGINT REFERENCES despachos(id) ON DELETE SET NULL,
  detalle VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS movimientos_created_at_idx ON movimientos_garrafas (created_at DESC);
CREATE INDEX IF NOT EXISTS movimientos_tipo_created_idx ON movimientos_garrafas (tipo, created_at DESC);

CREATE TABLE IF NOT EXISTS incidentes (
  id BIGSERIAL PRIMARY KEY,
  ruta_id BIGINT NOT NULL REFERENCES rutas(id),
  reportado_por BIGINT NOT NULL REFERENCES usuarios(id),
  descripcion VARCHAR(1000) NOT NULL,
  latitud NUMERIC(9, 6) CHECK (latitud BETWEEN -90 AND 90),
  longitud NUMERIC(9, 6) CHECK (longitud BETWEEN -180 AND 180),
  resuelto_por BIGINT REFERENCES usuarios(id),
  resuelto_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((latitud IS NULL) = (longitud IS NULL))
);
CREATE INDEX IF NOT EXISTS incidentes_ruta_created_idx ON incidentes (ruta_id, created_at DESC);

CREATE TABLE IF NOT EXISTS avistamientos (
  id BIGSERIAL PRIMARY KEY,
  camion_id BIGINT NOT NULL REFERENCES camiones(id),
  cliente_id BIGINT NOT NULL REFERENCES usuarios(id),
  latitud NUMERIC(9, 6) NOT NULL CHECK (latitud BETWEEN -90 AND 90),
  longitud NUMERIC(9, 6) NOT NULL CHECK (longitud BETWEEN -180 AND 180),
  ubicacion VARCHAR(250),
  comentario VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS avistamientos_camion_created_idx ON avistamientos (camion_id, created_at DESC);
CREATE INDEX IF NOT EXISTS avistamientos_created_idx ON avistamientos (created_at DESC);

CREATE TABLE IF NOT EXISTS noticias (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  contenido VARCHAR(5000) NOT NULL,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS noticias_activa_created_idx ON noticias (activa, created_at DESC);

CREATE TABLE IF NOT EXISTS configuracion_precios (
  capacidad_kg SMALLINT PRIMARY KEY CHECK (capacidad_kg IN (10, 45)),
  precio_bs NUMERIC(8, 2) NOT NULL CHECK (precio_bs > 0),
  actualizado_por BIGINT REFERENCES usuarios(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
