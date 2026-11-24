const reports = require('../models/incidentsSightings');
const HttpError = require('../middlewares/httpError');
const { idParam, coordinates, requiredString } = require('../utils/validation');

async function incidentsList(req, res) {
  res.json({ incidentes: await reports.listIncidents(req.user) });
}

async function incidentCreate(req, res) {
  const { lat, lng } = req.body.latitud === undefined && req.body.longitud === undefined
    ? { lat: null, lng: null }
    : coordinates(req.body.latitud, req.body.longitud);
  const incidente = await reports.createIncident({
    routeId: idParam(req.body.ruta_id, 'ruta_id'),
    user: req.user,
    descripcion: requiredString(req.body.descripcion, 'descripcion', 1000),
    latitud: lat,
    longitud: lng,
  });
  if (!incidente) throw new HttpError(403, 'La ruta no existe o no está asignada a este Camionero.');
  res.status(201).json({ incidente });
}

async function incidentResolve(req, res) {
  const incidente = await reports.resolveIncident(idParam(req.params.id), req.user.id);
  if (!incidente) throw new HttpError(404, 'Incidente no encontrado o ya resuelto.');
  res.json({ incidente });
}

async function sightingsList(req, res) {
  res.json({ avistamientos: await reports.listSightings() });
}

async function sightingCreate(req, res) {
  const { lat, lng } = coordinates(req.body.latitud, req.body.longitud);
  const avistamiento = await reports.createSighting({
    camionId: idParam(req.body.camion_id, 'camion_id'),
    clienteId: req.user.id,
    latitud: lat,
    longitud: lng,
    ubicacion: req.body.ubicacion ? requiredString(req.body.ubicacion, 'ubicacion', 250) : null,
    comentario: req.body.comentario ? requiredString(req.body.comentario, 'comentario', 500) : null,
  });
  if (!avistamiento) throw new HttpError(404, 'Camión no encontrado o inactivo.');
  res.status(201).json({ avistamiento });
}

module.exports = {
  incidentsList, incidentCreate, incidentResolve, sightingsList, sightingCreate,
};
