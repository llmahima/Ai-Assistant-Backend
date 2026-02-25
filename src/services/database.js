const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'chat.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables on initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`);

// Prepared statements for performance
const stmts = {
  createSession: db.prepare('INSERT OR IGNORE INTO sessions (id) VALUES (?)'),
  updateSession: db.prepare('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  getSession: db.prepare('SELECT * FROM sessions WHERE id = ?'),
  getAllSessions: db.prepare(`
    SELECT
      s.id,
      s.created_at AS createdAt,
      s.updated_at AS lastUpdated,
      (SELECT m.content FROM messages m WHERE m.session_id = s.id ORDER BY m.created_at DESC LIMIT 1) AS preview
    FROM sessions s
    ORDER BY s.updated_at DESC
  `),
  addMessage: db.prepare('INSERT INTO messages (session_id, role, content, tokens_used) VALUES (?, ?, ?, ?)'),
  getMessages: db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'),
  getRecentMessages: db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?'),
};

function createSession(sessionId) {
  return stmts.createSession.run(sessionId);
}

function updateSession(sessionId) {
  return stmts.updateSession.run(sessionId);
}

function getSession(sessionId) {
  return stmts.getSession.get(sessionId);
}

function getAllSessions() {
  return stmts.getAllSessions.all();
}

function addMessage(sessionId, role, content, tokensUsed = 0) {
  return stmts.addMessage.run(sessionId, role, content, tokensUsed);
}

function getMessages(sessionId) {
  return stmts.getMessages.all(sessionId);
}

function getRecentMessages(sessionId, limit = 10) {
  const messages = stmts.getRecentMessages.all(sessionId, limit);
  // Reverse to get chronological order (query returns DESC)
  return messages.reverse();
}

module.exports = {
  db,
  createSession,
  updateSession,
  getSession,
  getAllSessions,
  addMessage,
  getMessages,
  getRecentMessages,
};
