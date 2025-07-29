const express = require('express');
const router = express.Router();
const VisaRule = require('../models/VisaRules');
const CountryInfo = require('../models/CountryInfo');
const Session = require('../models/Session');

router.post('/', async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ message: 'Missing userMessage in request body' });
    }

    let matchedVisaType = null;
    let matchedCountry = null;
    let needsTBTest = false;
    let responseParts = [];

    const lowerMessage = userMessage.toLowerCase();
    const visaTypeKeywords = {
      'standard_visitor_visa': ['tourist', 'tourism', 'visit'],
      'skilled_worker_visa': ['skilled', 'work', 'worker'],
    };

    const visaTypes = await VisaRule.find({}).lean();
    for (const visa of visaTypes) {
      const visaWords = visa.visaType.replace(/_/g, ' ').split(/\s+/);
      const synonyms = visaTypeKeywords[visa.visaType] || [];
      const allKeywords = [...visaWords, ...synonyms].map(w => w.toLowerCase());

      const matched = allKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      );

      if (matched) {
        matchedVisaType = visa;
        responseParts.push(`Visa Type: **${visa.visaType.replace(/_/g, ' ')}**`);
        if (visa.eligibility) {
          responseParts.push(
            `Eligibility: ${Object.entries(visa.eligibility)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}`
          );
        }
        break;
      }
    }

    const countryInfo = await CountryInfo.findOne({});
    if (countryInfo) {
      const {
        visaFreeCountries = [],
        visaRequiredCountries = [],
        tbTestCountries = [],
        tbTestExplanation = ''
      } = countryInfo;

      const allCountries = [...visaFreeCountries, ...visaRequiredCountries];

      let bestMatch = null;

      for (const country of allCountries) {
        const countryWords = country.toLowerCase().split(/\s+/);
        const matched = countryWords.some(word => lowerMessage.includes(word));
        if (matched) {
          bestMatch = country;
          break;
        }
      }

      matchedCountry = bestMatch;

      if (matchedCountry) {
        const visaReq = visaRequiredCountries.includes(matchedCountry)
          ? 'visa-required'
          : 'visa-free';
        needsTBTest = tbTestCountries.includes(matchedCountry);

        responseParts.push(`Country: **${matchedCountry}**`);
        responseParts.push(`Visa requirement: ${visaReq}`);
        responseParts.push(`TB test required: ${needsTBTest ? 'Yes' : 'No'}`);

        if (needsTBTest) {
          responseParts.push(`Reason: ${tbTestExplanation}`);
        }
      }

    }

    if (!matchedVisaType && !matchedCountry) {
      return res.json({
        message:
          "Sorry, I couldn't match your query to a visa or country. A human-like AI model may be needed."
      });
    }

    await Session.create({
      userMessage,
      matchedVisaType: matchedVisaType?.visaType || null,
      matchedCountry,
      usedLLMFallback: false,
      llmResponse: responseParts.join('\n'),
      finalDecision: null
    });

    res.json({
      message: responseParts.join('\n')
    });
  } catch (error) {
    console.error('Error in POST /check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
