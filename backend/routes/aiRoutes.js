const express = require('express');
const { handleChat, handlePrediction } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Conversational AI Chat Endpoint (No login required for Phase 1 public legal information)
router.post('/chat', handleChat);

// AI Legal Case Prediction Endpoint
router.post('/predict', protect, upload.single('file'), handlePrediction);

module.exports = router;
