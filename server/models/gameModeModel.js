const mongoose = require('mongoose');

const gameModeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: true,
    },
    isUniversal: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
      required: true,
    },
    timeLimit: {
      type: Number, // in seconds
      default: 0, // 0 means no time limit
    },
    pointsPerCorrectAnswer: {
      type: Number,
      default: 10,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const GameMode = mongoose.model('GameMode', gameModeSchema);

module.exports = GameMode;
