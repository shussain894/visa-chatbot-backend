const express = require('express');
const router = express.Router();
const { getVisaRules } = require('../models/visaService');

router.get('/', async (req, res) => {
  try {
    console.log('Query params:', req.query); // see if any filters passed
    const results = await getVisaRules(req.query);
    console.log('Results from DB:', results); // see what comes back
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching visa rules' });
  }
});

module.exports = router;
