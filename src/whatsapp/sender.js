const axios = require('axios');

async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;

  const cleanNumber = to.replace('+', '');

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('WhatsApp error:', error.response?.data);
    throw error;
  }
}

module.exports = { sendMessage };
