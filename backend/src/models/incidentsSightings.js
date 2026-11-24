const pool = require('../config/db');

async function listIncidents(user) {
  const values = [];
  let filter = '';
  if (user.rol === 'Camionero') {
    values.push(user.id);
    filter = 'WHERE r.camionero_id = $1';
  }
  const { rows } = await pool.query(
    `SELECT i.*, r.camion_id, c.placa, reporter.nombre AS reportado_por_nombre,
            resolver.nombre AS resuelto_por_nombre
       FROM incidentes i
       JOIN rutas r ON r.id = i.ruta_id
       JOIN camiones c ON c.id = r.camion_id
       JOIN usuarios reporter ON reporter.id = i.reportado_por
       LEFT JOIN usuarios resolver ON resolver.id = i.resuelto_por
       ${filter} ORDER BY i.created_at DESC`,
    values,
  );
  return rows;
}

async function createIncident({ routeId, user, descripcion, latitud, longitud }) {
  const { rows } = await pool.query(
    `INSERT INTO incidentes (ruta_id, reportado_por, descripcion, latitud, longitud)
     SELECT $1, $2, $4, $5, $6
      WHERE EXISTS (
        SELECT 1 FROM rutas WHERE id = $1
          AND ($3 = 'Administrador' OR camionero_id = $2)
      )
     RETURNING *`,
    [routeId, user.id, user.rol, descripcion, latitud, longitud],
  );
  return rows[0] || null;
}

async function resolveIncident(id, userId) {
  const { rows } = await pool.query(
    `UPDATE incidentes SET resuelto_por = $1, resuelto_en = NOW()
      WHERE id = $2 AND resuelto_en IS NULL RETURNING *`,
    [userId, id],
  );
  return rows[0] || null;
}

async function listSightings() {
  const { rows } = await pool.query(`
    SELECT a.*, c.placa, u.nombre AS cliente_nombre
      FROM avistamientos a
      JOIN camiones c ON c.id = a.camion_id
      JOIN usuarios u ON u.id = a.cliente_id
     ORDER BY a.created_at DESC LIMIT 100`);
  return rows;
}

async function createSighting({ camionId, clienteId, latitud, longitud, ubicacion, comentario }) {
  const { rows } = await pool.query(
    `INSERT INTO avistamientos (camion_id, cliente_id, latitud, longitud, ubicacion, comentario)
     SELECT $1, $2, $3, $4, $5, $6 FROM camiones WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [camionId, clienteId, latitud, longitud, ubicacion || null, comentario || null],
  );
  return rows[0] || null;
}

module.exports = { listIncidents, createIncident, resolveIncident, listSightings, createSighting };
