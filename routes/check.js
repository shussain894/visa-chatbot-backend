const express = require('express');
const router = express.Router();
const { getVisaRules } = require('../models/visaService');
const VisaRule = require('../models/VisaRules');
const askLlama = require('../helpers/askLlama3');

router.get('/', async (req, res) => {
  try {
    const results = await getVisaRules(req.query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching visa rules' });
  }
});

router.get('/visa-types', async (req, res) => {
  try {
    const visaTypes = await VisaRule.find({}, 'visaType -_id').lean();
    res.json(visaTypes.map(v => v.visaType));
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch visa types' });
  }
});



module.exports = router;
