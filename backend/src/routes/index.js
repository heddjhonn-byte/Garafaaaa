const express = require('express');
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboardController');
const authRoutes = require('./authRoutes');
const usersRoutes = require('./usersRoutes');
const trucksRoutes = require('./trucksRoutes');
const { zones, routes } = require('./zonesRoutes');
const dispatchesRoutes = require('./dispatchesRoutes');
const garrafasRoutes = require('./garrafasRoutes');
const { incidents, sightings } = require('./incidentsSightingsRoutes');
const { news, prices } = require('./contentRoutes');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check could not reach PostgreSQL:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
}));

router.use('/api/auth', authRoutes);
router.get('/api/dashboard/resumen', authenticate, authorize('Administrador'), asyncHandler(dashboardController.summary));
router.use('/api/usuarios', usersRoutes);
router.use('/api/camiones', trucksRoutes);
router.use('/api/zonas', zones);
router.use('/api/rutas', routes);
router.use('/api/despachos', dispatchesRoutes);
router.use('/api/garrafas', garrafasRoutes);
router.use('/api/incidentes', incidents);
router.use('/api/avistamientos', sightings);
router.use('/api/noticias', news);
router.use('/api/precios', prices);

module.exports = router;
