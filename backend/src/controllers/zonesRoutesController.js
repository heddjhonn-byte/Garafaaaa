const pool = require('../config/db');
const zonesRoutes = require('../models/zonesRoutes');
const HttpError = require('../middlewares/httpError');
const { requiredString, positiveInt, idParam, capacity } = require('../utils/validation');

function cityName(value) {
  const city = requiredString(value, 'ciudad', 80);
  if (!['La Paz', 'El Alto'].includes(city)) {
    throw new HttpError(400, 'ciudad debe ser La Paz o El Alto.');
  }
  return city;
}

async function zonesList(req, res) {
  res.json({ zonas: await zonesRoutes.listZones() });
}

async function zoneCreate(req, res) {
  const zona = await zonesRoutes.createZone({
    nombre: requiredString(req.body.nombre, 'nombre', 100),
    ciudad: cityName(req.body.ciudad),
    macrodistrito: req.body.macrodistrito ? requiredString(req.body.macrodistrito, 'macrodistrito', 100) : null,
  });
  res.status(201).json({ zona });
}

async function zoneUpdate(req, res) {
  const id = idParam(req.params.id);
  const values = {};
  if (req.body.nombre !== undefined) values.nombre = requiredString(req.body.nombre, 'nombre', 100);
  if (req.body.ciudad !== undefined) values.ciudad = cityName(req.body.ciudad);
  if (req.body.macrodistrito !== undefined) {
    values.macrodistrito = req.body.macrodistrito === null
      ? null
      : requiredString(req.body.macrodistrito, 'macrodistrito', 100);
  }
  if (req.body.activa !== undefined) {
    if (typeof req.body.activa !== 'boolean') throw new HttpError(400, 'activa debe ser booleano.');
    values.activa = req.body.activa;
  }
  if (!Object.keys(values).length) throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  const zona = await zonesRoutes.updateZone(id, values);
  if (!zona) throw new HttpError(404, 'Zona no encontrada.');
  res.json({ zona });
}

async function zoneDelete(req, res) {
  const zona = await zonesRoutes.deleteZone(idParam(req.params.id));
  if (!zona) throw new HttpError(404, 'Zona no encontrada.');
  res.json({ mensaje: 'Zona eliminada.' });
}

async function validateTruckAndDriver(camionId, camioneroId) {
  const { rows } = await pool.query(
    `SELECT c.camionero_id, c.activo, u.rol, u.activo AS camionero_activo
       FROM camiones c LEFT JOIN usuarios u ON u.id = c.camionero_id
      WHERE c.id = $1`,
    [camionId],
  );
  const truck = rows[0];
  if (!truck || !truck.activo) throw new HttpError(400, 'camion_id debe corresponder a un camión activo.');
  if (truck.camionero_id !== camioneroId || truck.rol !== 'Camionero' || !truck.camionero_activo) {
    throw new HttpError(400, 'El camión debe estar asignado al Camionero indicado.');
  }
}

async function routesList(req, res) {
  res.json({ rutas: await zonesRoutes.listRoutes(req.user) });
}

async function routeGet(req, res) {
  const ruta = await zonesRoutes.getRoute(idParam(req.params.id));
  if (!ruta) throw new HttpError(404, 'Ruta no encontrada.');
  if (req.user.rol === 'Camionero' && ruta.camionero_id !== req.user.id) {
    throw new HttpError(403, 'Esta ruta no está asignada a este Camionero.');
  }
  res.json({ ruta });
}

async function myRoute(req, res) {
  const ruta = await zonesRoutes.getDriverRoute(req.user.id);
  res.json({ ruta });
}

async function routeCreate(req, res) {
  const camionId = positiveInt(req.body.camion_id, 'camion_id');
  const camioneroId = positiveInt(req.body.camionero_id, 'camionero_id');
  const zonaId = positiveInt(req.body.zona_id, 'zona_id');
  const capacidadKg = capacity(req.body.capacidad_kg);
  await validateTruckAndDriver(camionId, camioneroId);
  const ruta = await zonesRoutes.createRoute({ camionId, camioneroId, zonaId, capacidadKg });
  res.status(201).json({ ruta });
}

async function routeUpdate(req, res) {
  const id = idParam(req.params.id);
  const current = await zonesRoutes.getRoute(id);
  if (!current) throw new HttpError(404, 'Ruta no encontrada.');
  const values = {};
  if (req.body.camion_id !== undefined) values.camion_id = positiveInt(req.body.camion_id, 'camion_id');
  if (req.body.camionero_id !== undefined) values.camionero_id = positiveInt(req.body.camionero_id, 'camionero_id');
  if (req.body.zona_id !== undefined) values.zona_id = positiveInt(req.body.zona_id, 'zona_id');
  if (req.body.capacidad_kg !== undefined) values.capacidad_kg = capacity(req.body.capacidad_kg);
  if (req.body.estado !== undefined) {
    const states = ['PENDIENTE', 'ACTIVA', 'FINALIZADA', 'CANCELADA'];
    if (!states.includes(req.body.estado)) throw new HttpError(400, 'estado de ruta inválido.');
    values.estado = req.body.estado;
  }
  if (req.body.garrafas_iniciales !== undefined) values.garrafas_iniciales = positiveInt(req.body.garrafas_iniciales, 'garrafas_iniciales');
  if (req.body.garrafas_entregadas !== undefined) {
    const delivered = Number(req.body.garrafas_entregadas);
    if (!Number.isSafeInteger(delivered) || delivered < 0) throw new HttpError(400, 'garrafas_entregadas debe ser un entero no negativo.');
    values.garrafas_entregadas = delivered;
  }
  if (!Object.keys(values).length) throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  const truckId = values.camion_id || current.camion_id;
  const driverId = values.camionero_id || current.camionero_id;
  await validateTruckAndDriver(truckId, driverId);
  const ruta = await zonesRoutes.updateRoute(id, values);
  res.json({ ruta });
}

async function routeDelete(req, res) {
  const id = idParam(req.params.id);
  const current = await zonesRoutes.getRoute(id);
  if (!current) throw new HttpError(404, 'Ruta no encontrada.');
  if (current.estado === 'ACTIVA') throw new HttpError(409, 'No se puede eliminar una ruta activa.');
  await zonesRoutes.deleteRoute(id);
  res.json({ mensaje: 'Ruta eliminada.' });
}

async function progress(req, res) {
  const routeId = idParam(req.params.id);
  const delivered = Number(req.body.garrafas_entregadas);
  if (!Number.isSafeInteger(delivered) || delivered < 0) {
    throw new HttpError(400, 'garrafas_entregadas debe ser un entero no negativo.');
  }
  if (req.body.finalizar !== undefined && typeof req.body.finalizar !== 'boolean') {
    throw new HttpError(400, 'finalizar debe ser booleano.');
  }
  const ruta = await zonesRoutes.updateProgress({
    routeId,
    driverId: req.user.id,
    delivered,
    finish: req.body.finalizar === true,
  });
  if (!ruta) throw new HttpError(409, 'La ruta no está activa/asignada o el progreso está fuera de rango.');
  res.json({ ruta });
}

module.exports = {
  zonesList, zoneCreate, zoneUpdate, zoneDelete,
  routesList, routeGet, myRoute, routeCreate, routeUpdate, routeDelete, progress,
};
