require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`GarrafaYa API escuchando en el puerto ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} recibido; cerrando servidor.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
