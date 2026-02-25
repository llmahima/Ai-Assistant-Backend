const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const database = require('../services/database');
const { generateResponse } = require('../services/llm');

const router = express.Router();

// Load docs once at module level
const docs = require(path.join(__dirname, '..', '..', 'docs.json'));

router.post('/', async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        error: 'sessionId is required and must be a string.',
        status: 400,
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'message is required and must be a non-empty string.',
        status: 400,
      });
    }

    // Create session if it doesn't exist
    database.createSession(sessionId);

    // Get recent messages for context (last 10 = 5 user-assistant pairs)
    const recentMessages = database.getRecentMessages(sessionId, 10);

    // Call LLM service
    const { reply, tokensUsed } = await generateResponse(message.trim(), recentMessages, docs);

    // Store user message
    database.addMessage(sessionId, 'user', message.trim(), 0);

    // Store assistant response
    database.addMessage(sessionId, 'assistant', reply, tokensUsed);

    // Update session timestamp
    database.updateSession(sessionId);

    return res.json({
      reply,
      tokensUsed,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
