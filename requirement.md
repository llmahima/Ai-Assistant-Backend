# **Innoira Assignment Question**

# 🧪 Assignment: AI-Powered Support Assistant

## 🧠 Tech Stack (Must Use)

- **Frontend:** React.js
- **Backend:** Node.js (Express preferred)
- **Database:** SQLite
- **LLM:** Any provider (OpenAI / Gemini / Claude / Mistral etc.)

---

## 🎯 Problem Statement

Build a **full-stack AI-powered Support Assistant**.

Users should be able to chat with an AI assistant via a React UI.

The assistant must answer based on **provided product documentation**, maintain **session-wise context**, and store conversations in **SQLite**.

If the answer is not found in the docs, the assistant must respond:

> “Sorry, I don’t have information about that.”
> 

---

# ✅ Functional Requirements (Mandatory)

## 1️⃣ Frontend (React.js)

### UI Pages / Components

**A. Chat Screen**

- Input box + Send button
- Message list (user + assistant messages)
- Loading state while response is being generated

**B. Session Handling**

- Generate a `sessionId` on first load (UUID or timestamp-based)
- Store it in localStorage
- Continue conversation using the same sessionId

**C. Extras (nice-to-have)**

- Button: “New Chat” → generates a new sessionId
- Display conversation timestamp

---

## 2️⃣ Backend (Node.js)

### API Endpoints

### ✅ A. Chat Endpoint

`POST /api/chat`

**Request Body:**

```json
{
  "sessionId": "abc123",
  "message": "How can I reset my password?"
}
```

**Response:**

```json
{
  "reply": "Users can reset password from Settings > Security.",
  "tokensUsed": 123
}
```

### ✅ B. Fetch Conversation

`GET /api/conversations/:sessionId`

Returns all messages (user + assistant) for that session in chronological order.

### ✅ C. List Sessions

`GET /api/sessions`

Returns list of sessionIds with lastUpdated timestamp.

---

## 3️⃣ SQLite Database (Mandatory)

### Tables

### ✅ sessions

| column | type | notes |
| --- | --- | --- |
| id | TEXT | sessionId |
| created_at | DATETIME |  |
| updated_at | DATETIME |  |

### ✅ messages

| column | type | notes |
| --- | --- | --- |
| id | INTEGER | PK autoincrement |
| session_id | TEXT | FK to sessions |
| role | TEXT | "user" / "assistant" |
| content | TEXT | message text |
| created_at | DATETIME |  |

All messages must be stored in SQLite.

---

## 4️⃣ Document-Based Answering (Strict Rule)

Provide a file called `docs.json` containing product FAQs like:

```json
[
  {
    "title": "Reset Password",
    "content": "Users can reset password from Settings > Security."
  },
  {
    "title": "Refund Policy",
    "content": "Refunds are allowed within 7 days of purchase."
  }
]
```

### AI Rules

- The assistant must generate responses **only using this document content**
- If user asks something outside the docs:
    
    ✅ Must respond: `"Sorry, I don’t have information about that."`
    
- Do not hallucinate or guess.

---

## 5️⃣ Context & Memory

- Maintain last **5 user+assistant message pairs** as context when calling the LLM
- Context should come from **SQLite**, not in-memory

---

## 6️⃣ Prompting Requirement

The backend must:

- Construct a prompt with:
    - relevant docs content
    - recent chat history (last 5 pairs)
    - current user question
- Ensure the assistant follows document-only rule

---

## 7️⃣ Rate Limiting + Error Handling

- Add basic **rate limiting per IP**
- Handle:
    - missing sessionId/message
    - LLM API failure
    - DB failure
- Return clean JSON errors

---

# 🌟 Bonus Features (Optional, Extra Credit)

- Use embeddings + similarity search (instead of sending full docs)
- Dockerize (frontend + backend)
- Unit tests (backend preferred)
- Markdown rendering in assistant replies
- Deployed link (Render/Railway/Vercel)

---

# 📦 Deliverables

1. GitHub repo with:
    - `/frontend` (React)
    - `/backend` (Node)
2. `.env.example` with required keys
3. README including:
    - setup steps
    - API docs
    - schema explanation
    - assumptions
4. Sample screenshots (UI)

---

# ✅ Evaluation Criteria