const express = require('express');
const MCQ = require('../models/MCQ');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/classes
// Get all available classes
router.get('/', protect, async (req, res) => {
  try {
    const classes = await MCQ.distinct('class');
    const sorted = classes.sort((a, b) => parseInt(a) - parseInt(b));
    res.json({ success: true, classes: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
