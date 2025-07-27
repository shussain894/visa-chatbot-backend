const express = require('express');
const router = express.Router();
const { getVisaRules } = require('../models/visaService');

router.get('/', async (req, res) => {
  try {
    const results = await getVisaRules(req.query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching visa rules' });
  }
});

module.exports = router;
