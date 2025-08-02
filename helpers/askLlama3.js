const axios = require('axios');

async function askLlama(prompt) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt: prompt,
      stream: false
    });

    return response.data.response;
  } catch (error) {
    console.error('Error talking to LLaMA 3:', error.message);
    return 'Sorry, there was an error generating a response.';
  }
}

module.exports = askLlama;