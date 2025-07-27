const VisaRule = require('./VisaRules');
const CountryInfo = require('./CountryInfo');

async function getVisaRules(filters) {
  const { visaType, country } = filters;
  const response = {};

  if (visaType) {
    const visaRule = await VisaRule.findOne({ visaType }).lean();
    response.visaRules = visaRule;
  }

  if (country) {
    const countryInfo = await CountryInfo.findOne({}).lean();
    const lowerCountry = country.toLowerCase();

    const isVisaFree = countryInfo.visaFreeCountries.map(c => c.toLowerCase()).includes(lowerCountry);
    const isVisaRequired = countryInfo.visaRequiredCountries.map(c => c.toLowerCase()).includes(lowerCountry);
    const needsTBTest = countryInfo.tbTestCountries.map(c => c.toLowerCase()).includes(lowerCountry);

    const visaRequirement = isVisaFree
      ? 'visa-free'
      : isVisaRequired
        ? 'visa-required'
        : 'unknown';

    response.countrySummary = {
      country,
      visaRequirement,
      needsTBTest,
      tbTestExplanation: countryInfo.tbTestExplanation
    };
  }

  if (!visaType && !country) {
    const allVisaRules = await VisaRule.find({}).lean();
    const fullCountryInfo = await CountryInfo.findOne({}).lean();
    return {
      visaRules: allVisaRules,
      countryInfo: fullCountryInfo
    };
  }

  return response;
}

module.exports = { getVisaRules };
