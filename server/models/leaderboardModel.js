const mongoose = require('mongoose');

const leaderboardSchema = mongoose.Schema(
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
    },
    rank: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;
