const express = require('express');
const router = express.Router();
const VisaRule = require('../models/VisaRules');
const CountryInfo = require('../models/CountryInfo');
const Session = require('../models/Session');
const askLlama = require('../helpers/askLlama3');
const getNextBestQuestion = require('../helpers/nextQuestion');
const getFinalDecision = require('../helpers/finalDecision');

router.post('/', async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ message: 'Missing userMessage in request body' });
    }

    let matchedVisaType = null;
    let matchedCountry = null;
    let needsTBTest = false;
    let finalDecision = null;

    const lowerMessage = userMessage.toLowerCase();
    const visaTypeKeywords = {
      'standard_visitor_visa': ['tourist', 'tourism', 'visit'],
      'skilled_worker_visa': ['skilled', 'work', 'worker'],
      'family_visa_partner_spouse': ['spouse', 'civil partner', 'fiance', 'unmarried partner'],
    };

    const visaTypes = await VisaRule.find({}).lean();
    for (const visa of visaTypes) {
      const visaWords = visa.visaType.replace(/_/g, ' ').split(/\s+/).filter(word => word !== 'visa');
      const synonyms = visaTypeKeywords[visa.visaType] || [];
      const allKeywords = [...visaWords, ...synonyms].map(w => w.toLowerCase());

      const matched = allKeywords.some(keyword => lowerMessage.includes(keyword));

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

        if (visaFreeCountries.includes(matchedCountry)) {
          finalDecision = 'Visa not required';
        } else if (visaRequiredCountries.includes(matchedCountry)) {
          finalDecision = 'Visa required';
        }
      } else {
        finalDecision = 'More information needed';
      }

      if (!finalDecision) {
        finalDecision = await getFinalDecision(userMessage, matchedVisaType?.visaType || null, matchedCountry);
      }
    } else {
      finalDecision = 'More information needed';
    }

    if (!matchedVisaType && !matchedCountry) {
      const llmResponse = await askLlama(`A user says: ${userMessage}. Do they need a visa or TB test for the UK?`);

      await Session.create({
        userMessage,
        matchedVisaType: null,
        matchedCountry: null,
        usedLLMFallback: true,
        llmResponse,
        finalDecision: null
      });

      return res.json({
        message: llmResponse
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
      finalDecision
    });

    const nextQuestion = await getNextBestQuestion(
      userMessage,
      matchedVisaType?.visaType || null,
      matchedCountry
    );

    res.json({
      message: finalMessage,
      nextQuestion: nextQuestion?.trim() || 'Is there anything else I can help you with?',
      finalDecision
    });

  } catch (error) {
    console.error('Error in POST /check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
