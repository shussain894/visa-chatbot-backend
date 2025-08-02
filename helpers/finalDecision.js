const axios = require('axios');

async function getFinalDecision(userMessage, visaType, country) {
  const prompt = `
User message: "${userMessage}"

They are applying to visit the UK.
Known details:
- Visa type: ${visaType || 'Unknown'}
- Country of origin: ${country || 'Unknown'}

Based on this, return only ONE of the following decisions:
- "Visa required"
- "Visa not required"
- "More information needed"

Reply ONLY with the exact decision phrase.
`;

  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    return response.data.message.content.trim().replace(/^"|"$/g, '');
  } catch (err) {
    console.error('Error determining final decision:', err.message);
    return 'More information needed';
  }
}

module.exports = getFinalDecision;
