const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- ENVIAR NEWSLETTER ---
router.post('/newsletter', protect, adminOnly, adminController.enviarNewsletter);

module.exports = router;
