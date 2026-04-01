const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- VER TODAS ---
router.get('/', categoryController.getAllCategories);

// --- VER UNA POR ID ---
router.get('/:id', categoryController.getCategoryById);

// --- CREAR CATEGORÍA (Solo Admin) ---
router.post('/', protect, adminOnly, categoryController.createCategory);

// --- ACTUALIZAR CATEGORÍA (Solo Admin) ---
router.put('/:id', protect, adminOnly, categoryController.updateCategory);

// --- ELIMINAR CATEGORÍA (Solo Admin) ---
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
