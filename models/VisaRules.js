const mongoose = require('mongoose');

const visaRuleSchema = new mongoose.Schema({
  visaType: { type: String, required: true, unique: true },
  eligibility: { type: Object, required: true },
  documents_required: [String],
  fees: Object,
  processing_times: Object,
  exceptions: [String],
});

module.exports = mongoose.model('VisaRule', visaRuleSchema);
