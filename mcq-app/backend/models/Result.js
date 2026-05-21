const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  mcqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MCQ',
    required: true
  },
  question: String,
  options: Object,
  correctAnswer: String,
  selectedAnswer: String,
  isCorrect: Boolean,
  timeTaken: Number // seconds
});

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  chapterNo: {
    type: Number,
    required: true
  },
  chapterName: {
    type: String,
    required: true
  },
  totalQuestions: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  skipped: Number,
  score: Number, // percentage
  timeTaken: Number, // total seconds
  attempts: [attemptSchema],
  completedAt: {
    type: Date,
    default: Date.now
  }
});

resultSchema.index({ student: 1, completedAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
