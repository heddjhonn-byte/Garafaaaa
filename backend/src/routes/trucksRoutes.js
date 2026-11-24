const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/trucksController');

const router = express.Router();
router.get('/', authenticate, authorize('Administrador', 'Camionero', 'Cliente'), asyncHandler(controller.list));
router.post('/', authenticate, authorize('Administrador'), asyncHandler(controller.create));
router.put('/:id', authenticate, authorize('Administrador'), asyncHandler(controller.update));
router.patch('/:id/ubicacion', authenticate, authorize('Camionero'), asyncHandler(controller.updateLocation));

module.exports = router;
