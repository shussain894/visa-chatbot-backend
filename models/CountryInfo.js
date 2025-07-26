const mongoose = require('mongoose');

const countryInfoSchema = new mongoose.Schema({
  visaFreeCountries: [String],
  visaRequiredCountries: [String],
  tbTestCountries: [String],
  tbTestExplanation: String,
});

module.exports = mongoose.model('CountryInfo', countryInfoSchema);
