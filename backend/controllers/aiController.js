const { spawn } = require('child_process');
const path = require('path');
const domainClassifier = require('../services/domainClassifier');
const ragService = require('../services/ragService');
const aiService = require('../services/aiService');
const { sequelize } = require('../models');

/**
 * Public Conversational AI Endpoint Handler
 * POST /api/ai/chat
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, conversation_id, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message field is required.'
      });
    }

    const conversationId = conversation_id || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userQuery = message.trim();

    // 1. Domain & Safety Classification
    const classification = domainClassifier.classify(userQuery, history);

    if (!classification.isAllowed) {
      return res.status(200).json({
        success: true,
        answer: classification.refusalReason,
        sources: [],
        suggested_actions: [
          { label: 'File Digital FIR', action: 'NAVIGATE', target: '/citizen/register-fir' },
          { label: 'Find Police Station', action: 'NAVIGATE', target: '/admin/locations' }
        ],
        conversation_id: conversationId,
        answer_type: classification.category === 'HARMFUL_CRIMINAL_HELP' ? 'SAFETY_REFUSAL' : 'DOMAIN_REJECTION'
      });
    }

    // 2. Legal Knowledge Retrieval (RAG)
    const ragPassages = ragService.searchLegalKnowledge(userQuery, 4);

    // 3. AI Grounded Response Generation
    const aiResult = await aiService.generateGroundedAnswer({
      userMessage: userQuery,
      history,
      ragPassages,
      language: classification.language
    });

    return res.status(200).json({
      success: true,
      answer: aiResult.answer,
      sources: aiResult.sources || [],
      suggested_actions: aiResult.suggested_actions || [],
      conversation_id: conversationId,
      answer_type: aiResult.answer_type || 'LEGAL_INFORMATION'
    });
  } catch (error) {
    console.error('[AIController] Error handling chat request:', error);
    return res.status(500).json({
      success: false,
      message: 'CrimePilot AI system encountered an internal processing error. Please try again.',
      error: error.message
    });
  }
};

/**
 * AI Legal Case Prediction Endpoint Handler
 * POST /api/ai/predict
 */
exports.handlePrediction = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../../src/predict.py');
    const args = [scriptPath];

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.pdf') {
        args.push('--pdf', req.file.path);
      } else {
        args.push('--image', req.file.path);
      }
    } else {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Either file upload or description text is required for prediction.'
        });
      }
      args.push('--text', text.trim());
    }

    // Run Python Inference Pipeline
    const pyProcess = spawn('python', args);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('[AIController] Python process exited with code:', code, 'stderr:', stderrData);
        return res.status(500).json({
          success: false,
          message: 'Error executing prediction pipeline.',
          details: stderrData
        });
      }

      try {
        const jsonMatch = stdoutData.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in Python stdout.');
        }
        const result = JSON.parse(jsonMatch[0].trim());
        if (result.error) {
          return res.status(400).json({
            success: false,
            message: result.error
          });
        }

        // Insert Prediction Log in MySQL database for search / tracking
        try {
          const insertQuery = `
            INSERT INTO predictions (
              input_text, category, predicted_bns, predicted_bnss, predicted_bsa,
              punishment, outcome, duration_months, confidence_score, keywords, evidence_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await sequelize.query(insertQuery, {
            replacements: [
              result.extracted_text,
              result.category || 'General',
              result.predicted_bns,
              result.predicted_bnss,
              result.predicted_bsa,
              result.punishment,
              result.outcome,
              result.duration_months,
              result.confidence_score,
              JSON.stringify(result.keywords),
              JSON.stringify(result.evidence_required)
            ]
          });
        } catch (dbErr) {
          console.error('[AIController] Database logging of prediction failed:', dbErr.message);
        }

        return res.status(200).json({
          success: true,
          prediction: result
        });
      } catch (parseErr) {
        console.error('[AIController] JSON Parse error on python stdout:', parseErr, 'stdout:', stdoutData);
        return res.status(500).json({
          success: false,
          message: 'Failed to parse AI predictions response.',
          raw: stdoutData
        });
      }
    });

  } catch (error) {
    console.error('[AIController] Error handling prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while executing Legal Prediction.',
      error: error.message
    });
  }
};
