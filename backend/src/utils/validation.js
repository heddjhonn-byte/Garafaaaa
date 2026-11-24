const HttpError = require('../middlewares/httpError');

function requiredString(value, field, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new HttpError(400, `${field} es obligatorio y debe tener hasta ${max} caracteres.`);
  }
  return value.trim();
}

function positiveInt(value, field) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new HttpError(400, `${field} debe ser un entero positivo.`);
  }
  return number;
}

function idParam(value, field = 'id') {
  return positiveInt(value, field);
}

function capacity(value) {
  const number = Number(value);
  if (number !== 10 && number !== 45) {
    throw new HttpError(400, 'capacidad_kg debe ser 10 o 45.');
  }
  return number;
}

function coordinates(latitud, longitud) {
  const lat = Number(latitud);
  const lng = Number(longitud);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new HttpError(400, 'Las coordenadas no son válidas.');
  }
  return { lat, lng };
}

module.exports = { requiredString, positiveInt, idParam, capacity, coordinates };
