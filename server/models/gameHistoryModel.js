const mongoose = require('mongoose');

const gameHistorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    answers: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
      userAnswer: String,
      isCorrect: Boolean,
      timeToAnswer: Number, // in seconds
    }],
  },
  {
    timestamps: true,
  }
);

const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

module.exports = GameHistory;
