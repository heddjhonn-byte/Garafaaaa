const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/usersController');

const router = express.Router();
router.use(authenticate, authorize('Administrador'));
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.patch('/:id/estado', asyncHandler(controller.setStatus));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
