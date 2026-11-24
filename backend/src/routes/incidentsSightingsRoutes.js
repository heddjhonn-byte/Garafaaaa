const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/incidentsSightingsController');

const incidents = express.Router();
incidents.use(authenticate);
incidents.get('/', authorize('Administrador', 'Camionero'), asyncHandler(controller.incidentsList));
incidents.post('/', authorize('Administrador', 'Camionero'), asyncHandler(controller.incidentCreate));
incidents.patch('/:id/resolver', authorize('Administrador'), asyncHandler(controller.incidentResolve));

const sightings = express.Router();
sightings.use(authenticate);
sightings.get('/', authorize('Administrador', 'Camionero', 'Cliente'), asyncHandler(controller.sightingsList));
sightings.post('/', authorize('Cliente'), asyncHandler(controller.sightingCreate));

module.exports = { incidents, sightings };
