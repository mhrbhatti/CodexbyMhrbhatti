const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12']
  },
  subject: {
    type: String,
    required: true,
    default: 'Computer Science'
  },
  chapterNo: {
    type: Number,
    required: true
  },
  chapterName: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['a', 'b', 'c', 'd']
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mcqSchema.index({ class: 1, chapterNo: 1 });

module.exports = mongoose.model('MCQ', mcqSchema);
