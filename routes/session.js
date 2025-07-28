const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.post('/', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json({ message: 'Session logged' });
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ error: 'Could not log session' });
  }
});

router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({}).sort({ timestamp: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
