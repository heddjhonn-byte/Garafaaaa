const pool = require('../config/db');

async function getSummary() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE((SELECT cantidad FROM inventario_planta WHERE capacidad_kg = 10), 0)::int AS stock_planta_10kg,
      COALESCE((SELECT cantidad FROM inventario_planta WHERE capacidad_kg = 45), 0)::int AS stock_planta_45kg,
      (SELECT COUNT(*)::int FROM despachos
        WHERE (created_at AT TIME ZONE 'America/La_Paz')::date =
              (NOW() AT TIME ZONE 'America/La_Paz')::date) AS salidas_hoy,
      (SELECT COALESCE(SUM(cantidad), 0)::int FROM movimientos_garrafas
        WHERE tipo = 'RETORNO_VACIOS'
          AND (created_at AT TIME ZONE 'America/La_Paz')::date =
              (NOW() AT TIME ZONE 'America/La_Paz')::date) AS retornos_hoy,
      (SELECT COUNT(DISTINCT camion_id)::int FROM rutas WHERE estado = 'ACTIVA') AS camiones_activos,
      (SELECT COALESCE(SUM(garrafas_entregadas), 0)::int FROM rutas
        WHERE (updated_at AT TIME ZONE 'America/La_Paz')::date =
              (NOW() AT TIME ZONE 'America/La_Paz')::date) AS entregas_hoy
  `);
  return rows[0];
}

module.exports = { getSummary };
