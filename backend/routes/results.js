const express = require('express');
const Result = require('../models/Result');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/results
// Save a test result
router.post('/', protect, async (req, res) => {
  try {
    const resultData = { ...req.body, student: req.user._id };
    const result = await Result.create(resultData);
    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/results
// Get all results for logged-in student
router.get('/', protect, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .select('-attempts')
      .sort({ completedAt: -1 })
      .limit(20);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/results/:id
// Get a specific result with full attempts
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await Result.findOne({ _id: req.params.id, student: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
