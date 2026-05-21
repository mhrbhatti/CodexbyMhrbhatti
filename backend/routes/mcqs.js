const express = require('express');
const MCQ = require('../models/MCQ');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/mcqs/:class/:chapterNo
// Get MCQs — locked to student's own class
router.get('/:class/:chapterNo', protect, async (req, res) => {
  try {
    const { class: classNo, chapterNo } = req.params;

    // Class lock: student can only access their own class
    if (req.user.enrolledClass && req.user.enrolledClass !== classNo) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You are enrolled in Class ${req.user.enrolledClass}.`
      });
    }

    const limit = parseInt(req.query.limit) || 0;

    let query = MCQ.find({ class: classNo, chapterNo: parseInt(chapterNo) })
      .select('-correctAnswer -explanation -__v')
      .lean();

    const mcqs = await query;

    if (!mcqs.length) {
      return res.status(404).json({ success: false, message: 'No MCQs found for this class and chapter' });
    }

    // Shuffle
    const shuffled = mcqs.sort(() => Math.random() - 0.5);

    // Apply limit after shuffle so we get random subset
    const result = (limit > 0 && limit < shuffled.length) ? shuffled.slice(0, limit) : shuffled;

    res.json({ success: true, total: result.length, totalAvailable: mcqs.length, mcqs: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/mcqs/submit
// Submit answers — locked to student's own class
router.post('/submit', protect, async (req, res) => {
  try {
    const { class: classNo, chapterNo, answers } = req.body;

    // Class lock
    if (req.user.enrolledClass && req.user.enrolledClass !== classNo) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You are enrolled in Class ${req.user.enrolledClass}.`
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array required' });
    }

    const mcqIds = answers.map(a => a.mcqId);
    const mcqs = await MCQ.find({ _id: { $in: mcqIds } }).lean();

    const mcqMap = {};
    mcqs.forEach(m => { mcqMap[m._id.toString()] = m; });

    let correct = 0, wrong = 0, skipped = 0;
    const attempts = answers.map(answer => {
      const mcq = mcqMap[answer.mcqId];
      if (!mcq) return null;

      const isSkipped = !answer.selectedAnswer;
      const isCorrect = !isSkipped && answer.selectedAnswer === mcq.correctAnswer;

      if (isSkipped) skipped++;
      else if (isCorrect) correct++;
      else wrong++;

      return {
        mcqId: mcq._id,
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        selectedAnswer: answer.selectedAnswer || null,
        isCorrect,
        explanation: mcq.explanation || '',
        timeTaken: answer.timeTaken || 0
      };
    }).filter(Boolean);

    const total = attempts.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    res.json({
      success: true,
      result: {
        class: classNo,
        chapterNo,
        totalQuestions: total,
        correctAnswers: correct,
        wrongAnswers: wrong,
        skipped,
        score,
        attempts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add MCQ
router.post('/', protect, async (req, res) => {
  try {
    const mcq = await MCQ.create(req.body);
    res.status(201).json({ success: true, mcq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
