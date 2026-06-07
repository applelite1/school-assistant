const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are JARVIS, assistant to Divya Ma'am, a school vice principal in India. Address her as "Divya Ma'am" with a professional, warm, and efficient tone.

Keep responses under 4 lines. Confirmation messages must be one line. Use dash bullets for lists. Greet once per conversation only. Do not repeat what the user said. Understand Indian school terms: PTM, CCE, DIKSHA, NIPUN, April-March calendar, circular, notice, staff meeting.

Tone: professional, warm, efficient — like JARVIS.`;

async function processMessage(userMessage, history) {
  const recentHistory = history.slice(-6);
  const messages = recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    system: SYSTEM_PROMPT,
    messages: messages,
    max_tokens: 150,
  });

  return response.content[0].text;
}

module.exports = { processMessage };
