const express = require('express');
const router = express.Router();
const { processMessage } = require('../ai/claude');
const { sendMessage } = require('./sender');
const { saveContact } = require('../contacts/contactManager');
const { addTask } = require('../tasks/taskManager');
const { Conversation } = require('../database/models');

const pendingActions = {};

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

      try {
        if (msg.type === 'contacts') {
          const contactData = msg.contacts?.[0];
          const name = contactData?.name?.formatted_name || 'Unknown';
          const phone = contactData?.phones?.[0]?.phone || 'Unknown';

          pendingActions[sender] = {
            action: 'awaiting_contact_role',
            contactName: name,
            contactPhone: phone,
          };

          const reply = `I can see you've shared ${name}'s contact (${phone}). Shall I save them as a team member? If yes, what is their role Divya Ma'am?`;
          await sendMessage(sender, reply);
        } else if (msg.type === 'text') {
          const text = msg.text?.body || '';

          if (!text) {
            res.sendStatus(200);
            return;
          }

          const pending = pendingActions[sender];

          if (pending && pending.action === 'awaiting_contact_role') {
            const role = text.trim();
            await saveContact(pending.contactName, role, pending.contactPhone);

            pendingActions[sender] = {
              action: 'awaiting_task_after_contact',
              contactName: pending.contactName,
              contactPhone: pending.contactPhone,
            };

            const reply = `${pending.contactName} has been saved as ${role}. Is there any follow-up task you'd like me to assign to ${pending.contactName} right away Divya Ma'am?`;
            await sendMessage(sender, reply);
          } else if (pending && pending.action === 'awaiting_task_after_contact') {
            const negativeResponses = ['no', 'not now', 'nope', 'no thanks', 'later', 'skip', 'that\'s all', 'nothing'];
            const normalized = text.trim().toLowerCase();
            const isNegative = negativeResponses.includes(normalized);

            if (isNegative) {
              delete pendingActions[sender];

              const reply = `No problem Divya Ma'am! ${pending.contactName} has been saved to your contacts. Feel free to assign tasks anytime!`;
              await sendMessage(sender, reply);
            } else {
              const task = await addTask(pending.contactName, text, null, pending.contactPhone);

              delete pendingActions[sender];

              try {
                const notifyMsg = `Hello ${pending.contactName}, this is JARVIS from school. Divya Ma'am has assigned you the following task: "${text}". Please ensure it is completed on time.`;
                await sendMessage(pending.contactPhone, notifyMsg);
              } catch (notifyErr) {
                console.error('Failed to notify staff member:', notifyErr.message);
              }

              const reply = `Task assigned to ${pending.contactName}: "${text}" has been noted, and ${pending.contactName} has been notified. Is there anything else you'd like me to help with Divya Ma'am?`;
              await sendMessage(sender, reply);
            }
          } else {
            let conversation = await Conversation.findOne({ senderPhone: sender });
            if (!conversation) {
              conversation = await Conversation.create({ senderPhone: sender, history: [] });
            }

            conversation.history.push({ role: 'user', content: text });
            const reply = await processMessage(text, conversation.history);
            conversation.history.push({ role: 'assistant', content: reply });
            conversation.updatedAt = new Date();

            await conversation.save();
            await sendMessage(sender, reply);
          }
        }
      } catch (err) {
        console.error('Webhook handler error:', err);
        await sendMessage(sender, "I encountered an error processing your request. Please try again Divya Ma'am.");
      }
    }
  }

  res.sendStatus(200);
});

module.exports = router;
