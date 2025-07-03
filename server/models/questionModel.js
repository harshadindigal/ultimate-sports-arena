const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    options: [{
      text: String,
      isCorrect: Boolean,
    }],
    explanation: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: true,
    },
    gameMode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameMode',
      required: true,
    },
    category: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    year: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
