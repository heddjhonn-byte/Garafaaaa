const pool = require('../config/db');
const trucks = require('../models/trucks');
const HttpError = require('../middlewares/httpError');
const { requiredString, idParam, coordinates } = require('../utils/validation');

async function validateDriver(driverId) {
  if (driverId === null || driverId === undefined || driverId === '') return null;
  const id = idParam(driverId, 'camionero_id');
  const { rows } = await pool.query(
    `SELECT id FROM usuarios WHERE id = $1 AND rol = 'Camionero' AND activo = TRUE`,
    [id],
  );
  if (!rows[0]) throw new HttpError(400, 'camionero_id debe corresponder a un Camionero activo.');
  return id;
}

async function list(req, res) {
  res.json({ camiones: await trucks.list() });
}

async function create(req, res) {
  const camioneroId = await validateDriver(req.body.camionero_id);
  const camion = await trucks.create({
    placa: requiredString(req.body.placa, 'placa', 20).toUpperCase(),
    camioneroId,
    marca: req.body.marca ? requiredString(req.body.marca, 'marca', 60) : null,
    modelo: req.body.modelo ? requiredString(req.body.modelo, 'modelo', 60) : null,
  });
  res.status(201).json({ camion });
}

async function update(req, res) {
  const id = idParam(req.params.id);
  const values = {};
  if (req.body.placa !== undefined) values.placa = requiredString(req.body.placa, 'placa', 20).toUpperCase();
  if (req.body.camionero_id !== undefined) values.camionero_id = await validateDriver(req.body.camionero_id);
  if (req.body.marca !== undefined) values.marca = req.body.marca === null ? null : requiredString(req.body.marca, 'marca', 60);
  if (req.body.modelo !== undefined) values.modelo = req.body.modelo === null ? null : requiredString(req.body.modelo, 'modelo', 60);
  if (req.body.activo !== undefined) {
    if (typeof req.body.activo !== 'boolean') throw new HttpError(400, 'activo debe ser booleano.');
    values.activo = req.body.activo;
  }
  if (!Object.keys(values).length) throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  const camion = await trucks.update(id, values);
  if (!camion) throw new HttpError(404, 'Camión no encontrado.');
  res.json({ camion });
}

async function updateLocation(req, res) {
  const id = idParam(req.params.id);
  const { lat, lng } = coordinates(req.body.latitud, req.body.longitud);
  const ubicacion = req.body.ubicacion === undefined || req.body.ubicacion === null
    ? null
    : requiredString(req.body.ubicacion, 'ubicacion', 250);
  const camion = await trucks.updateLocation({
    truckId: id,
    driverId: req.user.id,
    latitud: lat,
    longitud: lng,
    ubicacion,
  });
  if (!camion) throw new HttpError(403, 'El camión no está asignado a este Camionero o está inactivo.');
  res.json({ camion });
}

module.exports = { list, create, update, updateLocation };
