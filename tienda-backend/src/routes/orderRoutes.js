const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- CREAR UN NUEVO PEDIDO (Solo Usuarios Registrados) ---
router.post('/create', protect, upload.single('comprobante'), orderController.createOrder);

// --- VER MIS PEDIDOS ---
router.get('/mine', protect, orderController.getOrdersMine);

// --- VER TODOS LOS PEDIDOS (Solo Admin) ---
router.get('/all', protect, adminOnly, orderController.getAllOrders);

// --- VER UN PEDIDO POR ID ---
router.get('/:id', orderController.getOrderById);

// --- CAMBIAR ESTADO DEL PEDIDO (Solo Admin) ---
router.patch('/:id/estado', protect, adminOnly, orderController.updateStatus);

// --- ACTUALIZAR NÚMERO DE SEGUIMIENTO (Solo Admin) ---
router.patch('/:id/tracking', protect, adminOnly, orderController.updateTracking);

// --- SUBIR COMPROBANTE DE PAGO ---
router.post('/upload-comprobante/:id', upload.single('comprobante'), orderController.uploadComprobante);

module.exports = router;