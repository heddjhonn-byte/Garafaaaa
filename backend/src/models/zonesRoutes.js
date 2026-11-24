const pool = require('../config/db');

async function listZones() {
  const { rows } = await pool.query('SELECT * FROM zonas ORDER BY ciudad, macrodistrito, nombre');
  return rows;
}

async function createZone({ nombre, ciudad, macrodistrito }) {
  const { rows } = await pool.query(
    `INSERT INTO zonas (nombre, ciudad, macrodistrito)
     VALUES ($1, $2, $3) RETURNING *`,
    [nombre, ciudad, macrodistrito || null],
  );
  return rows[0];
}

async function updateZone(id, values) {
  const columns = { nombre: 'nombre', ciudad: 'ciudad', macrodistrito: 'macrodistrito', activa: 'activa' };
  const entries = Object.entries(values).filter(([key]) => columns[key]);
  if (!entries.length) {
    const { rows } = await pool.query('SELECT * FROM zonas WHERE id = $1', [id]);
    return rows[0] || null;
  }
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
  const params = entries.map(([, value]) => value);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE zonas SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

async function deleteZone(id) {
  const { rows } = await pool.query('DELETE FROM zonas WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

async function listRoutes(user) {
  const params = [];
  let filter = '';
  if (user.rol === 'Camionero') {
    params.push(user.id);
    filter = 'WHERE r.camionero_id = $1';
  }
  const { rows } = await pool.query(
    `SELECT r.*, c.placa, z.nombre AS zona_nombre, z.ciudad, u.nombre AS camionero_nombre
       FROM rutas r
       JOIN camiones c ON c.id = r.camion_id
       JOIN zonas z ON z.id = r.zona_id
       JOIN usuarios u ON u.id = r.camionero_id
       ${filter} ORDER BY r.created_at DESC`,
    params,
  );
  return rows;
}

async function getRoute(id) {
  const { rows } = await pool.query(
    `SELECT r.*, c.placa, z.nombre AS zona_nombre, z.ciudad, u.nombre AS camionero_nombre
       FROM rutas r JOIN camiones c ON c.id = r.camion_id
       JOIN zonas z ON z.id = r.zona_id JOIN usuarios u ON u.id = r.camionero_id
      WHERE r.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function getDriverRoute(driverId) {
  const { rows } = await pool.query(
    `SELECT r.*, c.placa, z.nombre AS zona_nombre, z.ciudad
       FROM rutas r JOIN camiones c ON c.id = r.camion_id
       JOIN zonas z ON z.id = r.zona_id
      WHERE r.camionero_id = $1 AND r.estado = 'ACTIVA'
      ORDER BY r.updated_at DESC LIMIT 1`,
    [driverId],
  );
  return rows[0] || null;
}

async function createRoute({ camionId, camioneroId, zonaId, capacidadKg }) {
  const { rows } = await pool.query(
    `INSERT INTO rutas (camion_id, camionero_id, zona_id, capacidad_kg, estado)
     VALUES ($1, $2, $3, $4, 'PENDIENTE') RETURNING *`,
    [camionId, camioneroId, zonaId, capacidadKg],
  );
  return rows[0];
}

async function updateRoute(id, values) {
  const columns = {
    camion_id: 'camion_id',
    camionero_id: 'camionero_id',
    zona_id: 'zona_id',
    capacidad_kg: 'capacidad_kg',
    estado: 'estado',
    garrafas_iniciales: 'garrafas_iniciales',
    garrafas_entregadas: 'garrafas_entregadas',
  };
  const entries = Object.entries(values).filter(([key]) => columns[key]);
  if (!entries.length) return getRoute(id);
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
  const params = entries.map(([, value]) => value);
  assignments.push('updated_at = NOW()');
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE rutas SET ${assignments.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

async function deleteRoute(id) {
  const { rows } = await pool.query(
    `DELETE FROM rutas WHERE id = $1 AND estado <> 'ACTIVA' RETURNING id`,
    [id],
  );
  return rows[0] || null;
}

async function updateProgress({ routeId, driverId, delivered, finish }) {
  const { rows } = await pool.query(
    `UPDATE rutas
        SET garrafas_entregadas = $1,
            estado = CASE WHEN $2 THEN 'FINALIZADA' ELSE estado END,
            completed_at = CASE WHEN $2 THEN NOW() ELSE completed_at END,
            updated_at = NOW()
      WHERE id = $3 AND camionero_id = $4 AND estado = 'ACTIVA'
        AND $1 >= garrafas_entregadas AND $1 <= garrafas_iniciales
      RETURNING *`,
    [delivered, finish, routeId, driverId],
  );
  return rows[0] || null;
}

module.exports = {
  listZones, createZone, updateZone, deleteZone,
  listRoutes, getRoute, getDriverRoute, createRoute, updateRoute, deleteRoute, updateProgress,
};
