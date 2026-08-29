const express = require('express');
const router = express.Router();
const { upload } = require('../config/storage');
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- VER TODOS / FILTRAR --- 
router.get('/all', productController.getAllProducts);
router.get('/search', productController.getAllProducts); // Alias if needed, using same logic

// --- TRAER UNO POR ID ---
router.get('/:id', productController.getProductById);

// --- CREAR PRODUCTO (Solo Admin) ---
router.post('/create', protect, adminOnly, upload.fields([{ name: 'imagenes', maxCount: 20 }, { name: 'guiaTallesImg', maxCount: 1 }]), productController.createProduct);

// --- EDITAR PRODUCTO (Solo Admin) ---
router.put('/:id', protect, adminOnly, upload.fields([{ name: 'imagenes', maxCount: 20 }, { name: 'guiaTallesImg', maxCount: 1 }]), productController.updateProduct);

// --- TOGGLE ESTADOS (Solo Admin) ---
router.patch('/:id/toggle', protect, adminOnly, productController.toggleProductVisibility);
router.patch('/:id/toggle-drop', protect, adminOnly, productController.toggleProductDrop);
router.patch('/bulk/toggle-drop', protect, adminOnly, productController.bulkToggleProductDrop);

// --- ELIMINAR PRODUCTO (Solo Admin) ---
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;