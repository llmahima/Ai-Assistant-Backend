const express = require('express');
const database = require('../services/database');

const router = express.Router();

// GET / — list all sessions with lastUpdated and preview
router.get('/', (req, res, next) => {
  try {
    const sessions = database.getAllSessions();
    return res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// GET /:sessionId — get all messages for a session
router.get('/:sessionId', (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = database.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found.',
        status: 404,
      });
    }

    const messages = database.getMessages(sessionId);
    return res.json({
      sessionId,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
