const pool = require('../config/db');

async function listNews() {
  const { rows } = await pool.query(`
    SELECT n.id, n.titulo, n.contenido, n.created_at, u.nombre AS autor_nombre, u.rol AS autor_rol
      FROM noticias n JOIN usuarios u ON u.id = n.usuario_id
     WHERE n.activa = TRUE ORDER BY n.created_at DESC LIMIT 200`);
  return rows;
}

async function createNews({ titulo, contenido, usuarioId }) {
  const { rows } = await pool.query(
    `INSERT INTO noticias (titulo, contenido, usuario_id)
     VALUES ($1, $2, $3)
     RETURNING id, titulo, contenido, created_at`,
    [titulo, contenido, usuarioId],
  );
  return rows[0];
}

async function listPrices() {
  const { rows } = await pool.query(
    'SELECT capacidad_kg, precio_bs, updated_at FROM configuracion_precios ORDER BY capacidad_kg',
  );
  return rows;
}

async function updatePrice({ capacidadKg, precioBs, userId }) {
  const { rows } = await pool.query(
    `INSERT INTO configuracion_precios (capacidad_kg, precio_bs, actualizado_por)
     VALUES ($1, $2, $3)
     ON CONFLICT (capacidad_kg) DO UPDATE
       SET precio_bs = EXCLUDED.precio_bs, actualizado_por = EXCLUDED.actualizado_por, updated_at = NOW()
     RETURNING capacidad_kg, precio_bs, updated_at`,
    [capacidadKg, precioBs, userId],
  );
  return rows[0];
}

module.exports = { listNews, createNews, listPrices, updatePrice };
