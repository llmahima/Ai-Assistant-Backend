const OpenAI = require('openai');

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return client;
}

const getModel = () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function buildSystemPrompt(docs) {
  const docsText = docs
    .map((doc) => `## ${doc.title}\n${doc.content}`)
    .join('\n\n');

  return `You are a helpful support assistant. Answer ONLY based on the provided documentation.

If the question cannot be answered from the docs, respond exactly: Sorry, I don't have information about that.

Do not make up information. Do not guess. Only use what is in the documentation below.

--- Documentation ---

${docsText}`;
}

async function generateResponse(userMessage, chatHistory, docs) {
  const systemPrompt = buildSystemPrompt(docs);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await getClient().chat.completions.create({
      model: getModel(),
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const reply = completion.choices[0].message.content;
    const tokensUsed = completion.usage ? completion.usage.total_tokens : 0;

    return { reply, tokensUsed };
  } catch (error) {
    console.error('LLM service error:', error.message);

    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your GROQ_API_KEY.');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    throw new Error('Failed to generate response from AI service.');
  }
}

module.exports = { generateResponse };
