const express = require('express');
const MCQ = require('../models/MCQ');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/chapters/:class
router.get('/:class', protect, async (req, res) => {
  try {
    const classNo = req.params.class;

    // Class lock
    if (req.user.enrolledClass && req.user.enrolledClass !== classNo) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You are enrolled in Class ${req.user.enrolledClass}.`
      });
    }

    const chapters = await MCQ.aggregate([
      { $match: { class: classNo } },
      {
        $group: {
          _id: { chapterNo: '$chapterNo', chapterName: '$chapterName' },
          totalMCQs: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          chapterNo: '$_id.chapterNo',
          chapterName: '$_id.chapterName',
          totalMCQs: 1
        }
      },
      { $sort: { chapterNo: 1 } }
    ]);

    res.json({ success: true, class: classNo, chapters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
