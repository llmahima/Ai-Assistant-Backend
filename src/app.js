const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const chatRouter = require('./routes/chat');
const sessionsRouter = require('./routes/sessions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/conversations', sessionsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
