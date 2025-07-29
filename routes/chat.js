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
        needsTBTest = tbTestCountries.includes(matchedCountry);
      }
    }

    if (!matchedVisaType && !matchedCountry) {
      return res.json({
        message:
          "Sorry, I couldn't match your query to a visa or country. A human-like AI model may be needed."
      });
    }

    let messageParts = [];

    if (matchedVisaType) {
      messageParts.push(`You're applying for a **${matchedVisaType.visaType.replace(/_/g, ' ')}**.`);
      if (matchedVisaType.eligibility) {
        const eligibilityDetails = Object.entries(matchedVisaType.eligibility)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        messageParts.push(`Eligibility details include: ${eligibilityDetails}.`);
      }
    }

    if (matchedCountry && countryInfo) {
      const isVisaRequired = countryInfo.visaRequiredCountries.includes(matchedCountry);
      const visaStatus = isVisaRequired ? 'visa-required' : 'visa-free';

      messageParts.push(`${matchedCountry} is a **${visaStatus}** country.`);

      if (needsTBTest) {
        messageParts.push(`You **need a TB test**. Reason: ${countryInfo.tbTestExplanation}`);
      } else {
        messageParts.push(`You **do not need a TB test**.`);
      }
    }

    const finalMessage = messageParts.join(' ');

    await Session.create({
      userMessage,
      matchedVisaType: matchedVisaType?.visaType || null,
      matchedCountry,
      usedLLMFallback: false,
      llmResponse: finalMessage,
      finalDecision: null
    });

    res.json({
      message: finalMessage
    });

  } catch (error) {
    console.error('Error in POST /check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
