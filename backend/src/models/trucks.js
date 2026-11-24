const pool = require('../config/db');

const truckSelect = `
  SELECT c.id, c.placa, c.camionero_id, u.nombre AS camionero_nombre,
         c.marca, c.modelo, c.activo,
         CASE WHEN a.created_at IS NOT NULL AND
                   (c.ultima_ubicacion_at IS NULL OR a.created_at > c.ultima_ubicacion_at)
              THEN a.latitud ELSE c.latitud END AS latitud,
         CASE WHEN a.created_at IS NOT NULL AND
                   (c.ultima_ubicacion_at IS NULL OR a.created_at > c.ultima_ubicacion_at)
              THEN a.longitud ELSE c.longitud END AS longitud,
         CASE WHEN a.created_at IS NOT NULL AND
                   (c.ultima_ubicacion_at IS NULL OR a.created_at > c.ultima_ubicacion_at)
              THEN a.ubicacion ELSE c.ubicacion END AS ubicacion,
         GREATEST(c.ultima_ubicacion_at, a.created_at) AS ubicacion_actualizada_en,
         COALESCE(r.garrafas_iniciales - r.garrafas_entregadas, 0)::int AS stock_restante,
         r.capacidad_kg AS capacidad_ruta_kg, c.created_at, c.updated_at
    FROM camiones c
    LEFT JOIN usuarios u ON u.id = c.camionero_id
    LEFT JOIN LATERAL (
      SELECT latitud, longitud, ubicacion, created_at FROM avistamientos
       WHERE camion_id = c.id ORDER BY created_at DESC LIMIT 1
    ) a ON TRUE
    LEFT JOIN LATERAL (
      SELECT garrafas_iniciales, garrafas_entregadas, capacidad_kg FROM rutas
       WHERE camion_id = c.id AND estado = 'ACTIVA' ORDER BY updated_at DESC LIMIT 1
    ) r ON TRUE`;

async function list() {
  const { rows } = await pool.query(`${truckSelect} ORDER BY c.placa`);
  return rows;
}

async function create({ placa, camioneroId, marca, modelo }) {
  const { rows } = await pool.query(
    `INSERT INTO camiones (placa, camionero_id, marca, modelo)
     VALUES ($1, $2, $3, $4) RETURNING id, placa, camionero_id, marca, modelo, activo, created_at`,
    [placa, camioneroId || null, marca || null, modelo || null],
  );
  return rows[0];
}

async function update(id, values) {
  const columns = { placa: 'placa', camionero_id: 'camionero_id', marca: 'marca', modelo: 'modelo', activo: 'activo' };
  const entries = Object.entries(values).filter(([key]) => columns[key]);
  if (!entries.length) {
    const { rows } = await pool.query(`${truckSelect} WHERE c.id = $1`, [id]);
    return rows[0] || null;
  }
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
  const params = entries.map(([, value]) => value);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE camiones SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING id, placa, camionero_id, marca, modelo, activo, updated_at`,
    params,
  );
  return rows[0] || null;
}

async function updateLocation({ truckId, driverId, latitud, longitud, ubicacion }) {
  const { rows } = await pool.query(
    `UPDATE camiones SET latitud = $1, longitud = $2, ubicacion = $3,
       ultima_ubicacion_at = NOW(), updated_at = NOW()
     WHERE id = $4 AND camionero_id = $5 AND activo = TRUE
     RETURNING id, placa, latitud, longitud, ubicacion, ultima_ubicacion_at`,
    [latitud, longitud, ubicacion || null, truckId, driverId],
  );
  return rows[0] || null;
}

module.exports = { list, create, update, updateLocation };
