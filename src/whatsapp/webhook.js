const express = require('express');
const router = express.Router();
const { processMessage } = require('../ai/claude');
const { sendMessage } = require('./sender');

const conversationHistory = {};

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/', async (req, res) => {
  console.log('RAW BODY:', JSON.stringify(req.body));

  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const msg = messages[0];
      const sender = msg.from;
      const text = msg.text?.body || '';

      if (text) {
        if (!conversationHistory[sender]) {
          conversationHistory[sender] = [];
        }

        conversationHistory[sender].push({ role: 'user', content: text });

        const reply = await processMessage(text, conversationHistory[sender]);

        conversationHistory[sender].push({ role: 'assistant', content: reply });

        await sendMessage(sender, reply);
      }
    }
  }

  res.sendStatus(200);
});

module.exports = router;
