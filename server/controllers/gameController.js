
const { GameModeModel, GameHistoryModel, LeaderboardModel } = require('../models/elastic');

// @desc    Get all game modes
// @route   GET /api/games
// @access  Public
const getGameModes = async (req, res) => {
  try {
    const gameModes = await GameModeModel.getGameModes();
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
    const gameMode = await GameModeModel.getGameModeById(req.params.id);

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
    const gameHistory = await GameHistoryModel.createGameHistory({
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
      const existingLeaderboard = await LeaderboardModel.findLeaderboardEntry(
        req.user._id,
        sport,
        gameMode
      );

      if (existingLeaderboard) {
        // Update if new score is higher
        if (score > existingLeaderboard.score) {
          await LeaderboardModel.updateLeaderboardEntry(existingLeaderboard._id, {
            score
          });
        }
      } else {
        // Create new leaderboard entry
        await LeaderboardModel.createLeaderboardEntry({
          user: req.user._id,
          sport,
          gameMode,
          score,
        });
      }

      // Update leaderboard rankings
      await LeaderboardModel.updateLeaderboardRankings(sport, gameMode);

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
