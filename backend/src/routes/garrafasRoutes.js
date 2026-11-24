const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/garrafasController');

const router = express.Router();
router.use(authenticate, authorize('Administrador'));
router.get('/inventario', asyncHandler(controller.inventory));
router.get('/movimientos', asyncHandler(controller.movements));
router.post('/movimientos', asyncHandler(controller.createMovement));

module.exports = router;
