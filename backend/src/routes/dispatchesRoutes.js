const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/dispatchesController');

const router = express.Router();
router.use(authenticate, authorize('Administrador'));
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));

module.exports = router;
