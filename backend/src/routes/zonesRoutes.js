const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/zonesRoutesController');

const zones = express.Router();
zones.get('/', asyncHandler(controller.zonesList));
zones.post('/', authenticate, authorize('Administrador'), asyncHandler(controller.zoneCreate));
zones.put('/:id', authenticate, authorize('Administrador'), asyncHandler(controller.zoneUpdate));
zones.delete('/:id', authenticate, authorize('Administrador'), asyncHandler(controller.zoneDelete));

const routes = express.Router();
routes.use(authenticate, authorize('Administrador', 'Camionero'));
routes.get('/mi-ruta', authorize('Camionero'), asyncHandler(controller.myRoute));
routes.get('/', asyncHandler(controller.routesList));
routes.post('/', authorize('Administrador'), asyncHandler(controller.routeCreate));
routes.get('/:id', asyncHandler(controller.routeGet));
routes.put('/:id', authorize('Administrador'), asyncHandler(controller.routeUpdate));
routes.delete('/:id', authorize('Administrador'), asyncHandler(controller.routeDelete));
routes.patch('/:id/progreso', authorize('Camionero'), asyncHandler(controller.progress));

module.exports = { zones, routes };
