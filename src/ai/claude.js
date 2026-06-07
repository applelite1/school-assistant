const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = 'You are an AI assistant for a school vice principal in India. Your role is to help manage teachers, assign tasks, track follow-ups, schedule meetings, and handle day-to-day administrative work. Respond in a professional yet friendly tone. Keep responses concise and actionable.';

async function processMessage(userMessage, history) {
  const messages = history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    system: SYSTEM_PROMPT,
    messages: messages,
    max_tokens: 1024,
  });

  return response.content[0].text;
}

module.exports = { processMessage };
