const axios = require('axios');

async function getNextBestQuestion(userMessage, visaType, country) {
  const prompt = `
A user said: "${userMessage}"

They are interested in a visa to the UK. So far, we have identified:
- Visa type: ${visaType || 'Unknown'}
- Country: ${country || 'Unknown'}

As a helpful assistant, what is the next best question we should ask to help them complete their application or find the right visa? Only return the next question without any explanation.
`;

  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    return response.data.message.content;
  } catch (error) {
    console.error('Error generating next question:', error.message);
    return null;
  }
}

module.exports = getNextBestQuestion;
