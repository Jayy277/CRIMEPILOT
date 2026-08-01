const express = require('express');
const { login, signup, forgotPassword, resetPassword, uploadProfilePicture, deleteProfilePicture } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// General Staff Auth Routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/signup', protect, restrictTo('admin'), signup);

// Profile Picture operations for officers
router.post('/profile-picture', protect, restrictTo('officer'), upload.single('file'), uploadProfilePicture);
router.delete('/profile-picture', protect, restrictTo('officer'), deleteProfilePicture);

module.exports = router;
