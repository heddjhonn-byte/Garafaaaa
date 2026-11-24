const dispatches = require('../models/dispatches');
const { idParam, capacity, positiveInt } = require('../utils/validation');

async function list(req, res) {
  res.json({ despachos: await dispatches.list() });
}

async function create(req, res) {
  const result = await dispatches.create({
    camionId: idParam(req.body.camion_id, 'camion_id'),
    zonaId: idParam(req.body.zona_id, 'zona_id'),
    capacidadKg: capacity(req.body.capacidad_kg),
    cantidad: positiveInt(req.body.cantidad, 'cantidad'),
    administradorId: req.user.id,
  });
  res.status(201).json(result);
}

module.exports = { list, create };
