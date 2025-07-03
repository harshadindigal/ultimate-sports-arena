const Leaderboard = require('../models/leaderboardModel');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({})
      .sort({ score: -1 })
      .limit(100)
      .populate('user', 'name')
      .populate('sport', 'name')
      .populate('gameMode', 'name');
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard by sport
// @route   GET /api/leaderboard/sport/:sportId
// @access  Public
const getLeaderboardBySport = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ sport: req.params.sportId })
      .sort({ score: -1 })
      .limit(100)
      .populate('user', 'name')
      .populate('gameMode', 'name');
    
    if (leaderboard && leaderboard.length > 0) {
      res.json(leaderboard);
    } else {
      res.status(404);
      throw new Error('No leaderboard entries found for this sport');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get leaderboard by game mode
// @route   GET /api/leaderboard/gamemode/:gameModeId
// @access  Public
const getLeaderboardByGameMode = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ gameMode: req.params.gameModeId })
      .sort({ score: -1 })
      .limit(100)
      .populate('user', 'name')
      .populate('sport', 'name');
    
    if (leaderboard && leaderboard.length > 0) {
      res.json(leaderboard);
    } else {
      res.status(404);
      throw new Error('No leaderboard entries found for this game mode');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getLeaderboardBySport,
  getLeaderboardByGameMode,
};
