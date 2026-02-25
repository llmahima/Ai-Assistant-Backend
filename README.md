# AI-Powered Support Assistant — Backend

Node.js/Express API server with SQLite storage and OpenAI-powered document-based answering.

## Tech Stack

- **Node.js** + Express
- **SQLite** (via better-sqlite3)
- **OpenAI SDK** (compatible with any OpenAI-compatible API)
- **express-rate-limit** — IP-based rate limiting

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm run dev
```

Server runs at `http://localhost:3001` by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *(required)* | OpenAI API key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | API base URL (for compatible providers) |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `PORT` | `3001` | Server port |

## API Endpoints

### `POST /api/chat`

Send a message and get an AI response.

**Request:**
```json
{
  "sessionId": "abc-123",
  "message": "How can I reset my password?"
}
```

**Response:**
```json
{
  "reply": "Users can reset their password by navigating to Settings > Security > Reset Password...",
  "tokensUsed": 123
}
```

### `GET /api/sessions`

Returns all sessions with last updated timestamp and message preview.

**Response:**
```json
[
  {
    "id": "abc-123",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:05:00.000Z",
    "lastMessage": "How can I reset my password?"
  }
]
```

### `GET /api/conversations/:sessionId`

Returns all messages for a session in chronological order.

**Response:**
```json
{
  "sessionId": "abc-123",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "How can I reset my password?",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Users can reset their password by...",
      "created_at": "2025-01-01T00:00:01.000Z"
    }
  ]
}
```

### `GET /api/health`

Health check endpoint.

## Database Schema

### `sessions` table

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key (sessionId) |
| created_at | DATETIME | Auto-set |
| updated_at | DATETIME | Updated on each message |

### `messages` table

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, autoincrement |
| session_id | TEXT | FK to sessions |
| role | TEXT | "user" or "assistant" |
| content | TEXT | Message text |
| tokens_used | INTEGER | LLM tokens used (assistant only) |
| created_at | DATETIME | Auto-set |

## Document-Based Answering

The AI only answers based on content in `docs.json`. If a question is outside the documentation scope, it responds: "Sorry, I don't have information about that."

Context includes the last 5 user+assistant message pairs from the SQLite database.

## Rate Limiting

20 requests per minute per IP address. Returns HTTP 429 on limit exceeded.

## Project Structure

```
├── server.js              # Entry point
├── src/
│   ├── app.js             # Express app setup
│   ├── routes/
│   │   ├── chat.js        # POST /api/chat
│   │   └── sessions.js    # GET /api/sessions, GET /api/conversations/:id
│   ├── services/
│   │   ├── database.js    # SQLite operations
│   │   └── llm.js         # OpenAI integration
│   └── middleware/
│       ├── rateLimiter.js  # IP rate limiting
│       └── errorHandler.js # Global error handler
├── docs.json              # Product documentation
└── data/                  # SQLite database (auto-created)
```

## Assumptions

- OpenAI-compatible API is used (works with OpenAI, Azure OpenAI, local LLMs via compatible servers)
- SQLite database is created automatically on first run in `./data/`
- All docs are loaded into the LLM prompt (no embedding/vector search in basic version)
- Last 5 conversation pairs (10 messages) provide session context
