const pool = require('../config/db');
const HttpError = require('../middlewares/httpError');

async function list() {
  const { rows } = await pool.query(`
    SELECT d.*, c.placa, u.nombre AS camionero_nombre, z.nombre AS zona_nombre,
           a.nombre AS administrador_nombre
      FROM despachos d
      JOIN camiones c ON c.id = d.camion_id
      JOIN usuarios u ON u.id = d.camionero_id
      JOIN zonas z ON z.id = d.zona_id
      JOIN usuarios a ON a.id = d.administrador_id
     ORDER BY d.created_at DESC`);
  return rows;
}

async function create({ camionId, zonaId, capacidadKg, cantidad, administradorId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const truckResult = await client.query(
      'SELECT id, camionero_id FROM camiones WHERE id = $1 AND activo = TRUE FOR UPDATE',
      [camionId],
    );
    const truck = truckResult.rows[0];
    if (!truck) throw new HttpError(404, 'Camión no encontrado o inactivo.');
    if (!truck.camionero_id) throw new HttpError(400, 'El camión debe tener un Camionero asignado.');

    const driverResult = await client.query(
      `SELECT id FROM usuarios WHERE id = $1 AND rol = 'Camionero' AND activo = TRUE`,
      [truck.camionero_id],
    );
    if (!driverResult.rows[0]) throw new HttpError(400, 'El Camionero asignado no está activo.');

    const zoneResult = await client.query('SELECT id FROM zonas WHERE id = $1 AND activa = TRUE', [zonaId]);
    if (!zoneResult.rows[0]) throw new HttpError(404, 'Zona no encontrada o inactiva.');

    const inventoryResult = await client.query(
      'SELECT cantidad FROM inventario_planta WHERE capacidad_kg = $1 FOR UPDATE',
      [capacidadKg],
    );
    if (!inventoryResult.rows[0] || inventoryResult.rows[0].cantidad < cantidad) {
      throw new HttpError(409, 'Stock insuficiente en planta.');
    }

    await client.query(
      'UPDATE inventario_planta SET cantidad = cantidad - $1, updated_at = NOW() WHERE capacidad_kg = $2',
      [cantidad, capacidadKg],
    );

    const dispatchResult = await client.query(
      `INSERT INTO despachos (camion_id, camionero_id, zona_id, administrador_id, capacidad_kg, cantidad)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [camionId, truck.camionero_id, zonaId, administradorId, capacidadKg, cantidad],
    );
    const dispatch = dispatchResult.rows[0];

    await client.query(
      `INSERT INTO movimientos_garrafas (capacidad_kg, cantidad, tipo, usuario_id, despacho_id, detalle)
       VALUES ($1, $2, 'SALIDA_PLANTA', $3, $4, $5)`,
      [capacidadKg, cantidad, administradorId, dispatch.id, `Despacho #${dispatch.id}`],
    );

    const activeRouteResult = await client.query(
      `SELECT id FROM rutas WHERE camion_id = $1 AND estado = 'ACTIVA' FOR UPDATE`,
      [camionId],
    );
    let route;
    if (activeRouteResult.rows[0]) {
      const routeResult = await client.query(
        `UPDATE rutas
            SET camionero_id = $1, zona_id = $2, despacho_id = $3, capacidad_kg = $4,
                garrafas_iniciales = $5, garrafas_entregadas = 0,
                started_at = NOW(), completed_at = NULL, updated_at = NOW()
          WHERE id = $6 RETURNING *`,
        [truck.camionero_id, zonaId, dispatch.id, capacidadKg, cantidad, activeRouteResult.rows[0].id],
      );
      route = routeResult.rows[0];
    } else {
      const routeResult = await client.query(
        `INSERT INTO rutas
          (camion_id, camionero_id, zona_id, despacho_id, capacidad_kg, estado,
           garrafas_iniciales, garrafas_entregadas, started_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVA', $6, 0, NOW()) RETURNING *`,
        [camionId, truck.camionero_id, zonaId, dispatch.id, capacidadKg, cantidad],
      );
      route = routeResult.rows[0];
    }

    await client.query('COMMIT');
    return { despacho: dispatch, ruta: route };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Could not roll back dispatch transaction:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { list, create };
