const pool = require('../config/db');

async function getInventory() {
  const { rows } = await pool.query(
    'SELECT capacidad_kg, cantidad, updated_at FROM inventario_planta ORDER BY capacidad_kg',
  );
  return rows;
}

async function listMovements() {
  const { rows } = await pool.query(`
    SELECT m.*, u.nombre AS usuario_nombre
      FROM movimientos_garrafas m
      JOIN usuarios u ON u.id = m.usuario_id
     ORDER BY m.created_at DESC LIMIT 500`);
  return rows;
}

async function createMovement({ capacidadKg, cantidad, tipo, usuarioId, detalle }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (tipo === 'ENTRADA_PLANTA') {
      await client.query(
        `INSERT INTO inventario_planta (capacidad_kg, cantidad)
         VALUES ($1, $2)
         ON CONFLICT (capacidad_kg) DO UPDATE
           SET cantidad = inventario_planta.cantidad + EXCLUDED.cantidad, updated_at = NOW()`,
        [capacidadKg, cantidad],
      );
    }
    const { rows } = await client.query(
      `INSERT INTO movimientos_garrafas (capacidad_kg, cantidad, tipo, usuario_id, detalle)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [capacidadKg, cantidad, tipo, usuarioId, detalle || null],
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Could not roll back cylinder movement transaction:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getInventory, listMovements, createMovement };
