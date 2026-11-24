const garrafas = require('../models/garrafas');
const HttpError = require('../middlewares/httpError');
const { capacity, positiveInt, requiredString } = require('../utils/validation');

async function inventory(req, res) {
  res.json({ inventario: await garrafas.getInventory() });
}

async function movements(req, res) {
  res.json({ movimientos: await garrafas.listMovements() });
}

async function createMovement(req, res) {
  const tipo = req.body.tipo;
  if (!['ENTRADA_PLANTA', 'RETORNO_VACIOS'].includes(tipo)) {
    throw new HttpError(400, 'tipo debe ser ENTRADA_PLANTA o RETORNO_VACIOS.');
  }
  const movimiento = await garrafas.createMovement({
    capacidadKg: capacity(req.body.capacidad_kg),
    cantidad: positiveInt(req.body.cantidad, 'cantidad'),
    tipo,
    usuarioId: req.user.id,
    detalle: req.body.detalle ? requiredString(req.body.detalle, 'detalle', 500) : null,
  });
  res.status(201).json({ movimiento });
}

module.exports = { inventory, movements, createMovement };
