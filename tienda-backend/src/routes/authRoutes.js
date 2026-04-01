const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// --- REGISTER ---
router.post('/register', userController.register);

// --- LOGIN ---
router.post('/login', userController.login);

// --- PROFILE ---
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

module.exports = router;
