const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../models/users');
const HttpError = require('../middlewares/httpError');
const { requiredString } = require('../utils/validation');

function normalizeEmail(value) {
  const email = requiredString(value, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'email no tiene un formato válido.');
  }
  return email;
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.');
  }
}

async function register(req, res) {
  const requestedRole = req.body.rol || req.body.role;
  if (requestedRole && requestedRole !== 'Cliente') {
    throw new HttpError(403, 'El registro público solo permite el perfil Cliente.');
  }
  const nombre = requiredString(req.body.nombre, 'nombre', 120);
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  validatePassword(password);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await users.create({
    nombre,
    email,
    passwordHash,
    telefono: req.body.telefono ? requiredString(req.body.telefono, 'telefono', 30) : null,
    ci: req.body.ci ? requiredString(req.body.ci, 'ci', 30) : null,
    rol: 'Cliente',
  });
  res.status(201).json({ usuario: user });
}

async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  if (typeof password !== 'string' || !password) throw new HttpError(400, 'password es obligatorio.');
  const user = await users.findByEmail(email);
  const matches = user && user.activo && await bcrypt.compare(password, user.password_hash);
  if (!matches) throw new HttpError(401, 'Correo o contraseña incorrectos.');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está configurado.');

  const token = jwt.sign(
    { rol: user.rol },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || '12h' },
  );
  const { password_hash: omitted, ...safeUser } = user;
  res.json({ token, usuario: safeUser });
}

async function me(req, res) {
  res.json({ usuario: req.user });
}

module.exports = { register, login, me, normalizeEmail, validatePassword };
