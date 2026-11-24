const bcrypt = require('bcrypt');
const users = require('../models/users');
const HttpError = require('../middlewares/httpError');
const { requiredString, idParam } = require('../utils/validation');
const { normalizeEmail, validatePassword } = require('./authController');
const { validRoles } = require('../middlewares/auth');

function userRole(value, allowed = validRoles) {
  if (!allowed.includes(value)) throw new HttpError(400, 'rol debe ser Administrador, Camionero o Cliente.');
  return value;
}

async function list(req, res) {
  res.json({ usuarios: await users.list() });
}

async function create(req, res) {
  const rol = userRole(req.body.rol || req.body.role, ['Administrador', 'Camionero']);
  const nombre = requiredString(req.body.nombre, 'nombre', 120);
  const email = normalizeEmail(req.body.email);
  validatePassword(req.body.password);
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const usuario = await users.create({
    nombre,
    email,
    passwordHash,
    telefono: req.body.telefono ? requiredString(req.body.telefono, 'telefono', 30) : null,
    ci: req.body.ci ? requiredString(req.body.ci, 'ci', 30) : null,
    rol,
  });
  res.status(201).json({ usuario });
}

async function update(req, res) {
  const id = idParam(req.params.id);
  const values = {};
  if (req.body.nombre !== undefined) values.nombre = requiredString(req.body.nombre, 'nombre', 120);
  if (req.body.email !== undefined) values.email = normalizeEmail(req.body.email);
  if (req.body.telefono !== undefined) values.telefono = req.body.telefono === null ? null : requiredString(req.body.telefono, 'telefono', 30);
  if (req.body.ci !== undefined) values.ci = req.body.ci === null ? null : requiredString(req.body.ci, 'ci', 30);
  if (req.body.rol !== undefined || req.body.role !== undefined) values.rol = userRole(req.body.rol || req.body.role);
  if (id === req.user.id && values.rol && values.rol !== 'Administrador') {
    throw new HttpError(400, 'No puedes cambiar tu propio perfil de Administrador.');
  }
  if (req.body.password !== undefined) {
    validatePassword(req.body.password);
    values.passwordHash = await bcrypt.hash(req.body.password, 12);
  }
  if (Object.keys(values).length === 0) throw new HttpError(400, 'Debe indicar al menos un campo para actualizar.');
  const usuario = await users.update(id, values);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado.');
  res.json({ usuario });
}

async function setStatus(req, res) {
  const id = idParam(req.params.id);
  if (typeof req.body.activo !== 'boolean') throw new HttpError(400, 'activo debe ser booleano.');
  if (id === req.user.id && req.body.activo === false) {
    throw new HttpError(400, 'No puedes desactivar tu propia cuenta.');
  }
  const usuario = await users.setActive(id, req.body.activo);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado.');
  res.json({ usuario });
}

async function remove(req, res) {
  const id = idParam(req.params.id);
  if (id === req.user.id) throw new HttpError(400, 'No puedes desactivar tu propia cuenta.');
  const usuario = await users.setActive(id, false);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado.');
  res.json({ usuario, mensaje: 'Cuenta desactivada.' });
}

module.exports = { list, create, update, setStatus, remove };
