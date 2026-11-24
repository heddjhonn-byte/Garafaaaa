const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/contentController');

const news = express.Router();
news.get('/', asyncHandler(controller.newsList));
news.post('/', authenticate, authorize('Cliente', 'Administrador'), asyncHandler(controller.newsCreate));

const prices = express.Router();
prices.get('/', asyncHandler(controller.pricesList));
prices.put('/:capacidad_kg', authenticate, authorize('Administrador'), asyncHandler(controller.priceUpdate));

module.exports = { news, prices };
