const HttpError = require('./httpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'Recurso no encontrado.'));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = error.status || 500;
  let message = status < 500 ? error.message : 'Error interno del servidor.';

  if (error.code === '23505') {
    status = 409;
    message = 'Ya existe un registro con esos datos.';
  } else if (error.code === '23503') {
    status = 400;
    message = 'La referencia indicada no existe o está en uso.';
  } else if (error.code === '23514' || error.code === '22P02') {
    status = 400;
    message = 'Los datos no cumplen las reglas del sistema.';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
