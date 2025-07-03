const GameMode = require('../models/gameModeModel');
const GameHistory = require('../models/gameHistoryModel');
const Leaderboard = require('../models/leaderboardModel');

// @desc    Get all game modes
// @route   GET /api/games
// @access  Public
const getGameModes = async (req, res) => {
  try {
    const gameModes = await GameMode.find({}).populate('sport');
    res.json(gameModes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get game mode by ID
// @route   GET /api/games/:id
// @access  Public
const getGameModeById = async (req, res) => {
  try {
    const gameMode = await GameMode.findById(req.params.id).populate('sport');

    if (gameMode) {
      res.json(gameMode);
    } else {
      res.status(404);
      throw new Error('Game mode not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Submit game result
// @route   POST /api/games/submit
// @access  Private
const submitGameResult = async (req, res) => {
  try {
    const { 
      sport, 
      gameMode, 
      score, 
      correctAnswers, 
      totalQuestions, 
      timeSpent, 
      completed, 
      answers 
    } = req.body;

    // Create game history
    const gameHistory = await GameHistory.create({
      user: req.user._id,
      sport,
      gameMode,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      completed,
      answers,
    });

    if (gameHistory) {
      // Check if user already has a leaderboard entry for this sport and game mode
      const existingLeaderboard = await Leaderboard.findOne({
        user: req.user._id,
        sport,
        gameMode,
      });

      if (existingLeaderboard) {
        // Update if new score is higher
        if (score > existingLeaderboard.score) {
          existingLeaderboard.score = score;
          await existingLeaderboard.save();
        }
      } else {
        // Create new leaderboard entry
        await Leaderboard.create({
          user: req.user._id,
          sport,
          gameMode,
          score,
        });
      }

      // Update leaderboard rankings
      const leaderboards = await Leaderboard.find({ sport, gameMode })
        .sort({ score: -1 });
      
      // Update ranks
      for (let i = 0; i < leaderboards.length; i++) {
        leaderboards[i].rank = i + 1;
        await leaderboards[i].save();
      }

      res.status(201).json(gameHistory);
    } else {
      res.status(400);
      throw new Error('Invalid game data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getGameModes,
  getGameModeById,
  submitGameResult,
};
