const pool = require('../config/db');

const publicFields = 'id, nombre, email, telefono, ci, rol, activo, created_at, updated_at';

async function findByEmail(email) {
  const { rows } = await pool.query(`SELECT ${publicFields}, password_hash FROM usuarios WHERE email = $1`, [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${publicFields} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function list() {
  const { rows } = await pool.query(`SELECT ${publicFields} FROM usuarios ORDER BY created_at DESC`);
  return rows;
}

async function create({ nombre, email, passwordHash, telefono, ci, rol }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, telefono, ci, rol)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${publicFields}`,
    [nombre, email, passwordHash, telefono || null, ci || null, rol],
  );
  return rows[0];
}

async function update(id, values) {
  const columns = {
    nombre: 'nombre',
    email: 'email',
    telefono: 'telefono',
    ci: 'ci',
    rol: 'rol',
    passwordHash: 'password_hash',
    activo: 'activo',
  };
  const entries = Object.entries(values).filter(([key]) => columns[key]);
  if (!entries.length) return findById(id);

  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
  const params = entries.map(([, value]) => value);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING ${publicFields}`,
    params,
  );
  return rows[0] || null;
}

async function setActive(id, active) {
  const { rows } = await pool.query(
    `UPDATE usuarios SET activo = $1, updated_at = NOW()
     WHERE id = $2 RETURNING ${publicFields}`,
    [active, id],
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, list, create, update, setActive };
