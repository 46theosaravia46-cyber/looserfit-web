const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const homeController = require('../controllers/homeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- GET CONTENT ---
router.get('/', homeController.getHome);

// --- UPDATE HERO (Solo Admin) ---
router.put('/hero', protect, adminOnly, upload.array('newHeroImages', 10), homeController.updateHero);

// --- UPDATE FAMILY (Solo Admin) ---
router.put('/family', protect, adminOnly, upload.array('newFamilyImages', 20), homeController.updateFamily);

// --- UPDATE SETTINGS (Solo Admin) ---
router.put('/settings', protect, adminOnly, homeController.updateSettings);

module.exports = router;
