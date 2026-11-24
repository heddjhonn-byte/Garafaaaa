const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const HttpError = require('./httpError');

const validRoles = ['Administrador', 'Camionero', 'Cliente'];

async function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Se requiere autenticación.'));
  }
  if (!process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET no está configurado.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.sub || !validRoles.includes(payload.rol)) {
      throw new HttpError(401, 'Token inválido.');
    }

    const { rows } = await pool.query(
      'SELECT id, nombre, email, telefono, ci, rol FROM usuarios WHERE id = $1 AND activo = TRUE',
      [payload.sub],
    );
    if (!rows[0]) {
      throw new HttpError(401, 'La cuenta no existe o está inactiva.');
    }
    req.user = rows[0];
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Token inválido o expirado.'));
    }
    return next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, 'No tienes permiso para realizar esta acción.'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize, validRoles };
