const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  matchedVisaType: String,
  matchedCountry: String,
  usedLLMFallback: { type: Boolean, default: false },
  llmResponse: String,
  finalDecision: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
