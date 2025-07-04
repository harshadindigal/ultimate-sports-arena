
const { LeaderboardModel } = require('../models/elastic');
const { UserModel } = require('../models/elastic');
const { SportModel } = require('../models/elastic');
const { GameModeModel } = require('../models/elastic');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await LeaderboardModel.getLeaderboard();
    
    // Populate user, sport, and gameMode information
    const populatedLeaderboard = await Promise.all(leaderboard.map(async (entry) => {
      const [user, sport, gameMode] = await Promise.all([
        UserModel.findById(entry.user),
        SportModel.getSportById(entry.sport),
        GameModeModel.getGameModeById(entry.gameMode)
      ]);
      
      return {
        ...entry,
        user: user ? { _id: user._id, name: user.name } : null,
        sport: sport ? { _id: sport._id, name: sport.name } : null,
        gameMode: gameMode ? { _id: gameMode._id, name: gameMode.name } : null
      };
    }));
    
    res.json(populatedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard by sport
// @route   GET /api/leaderboard/sport/:sportId
// @access  Public
const getLeaderboardBySport = async (req, res) => {
  try {
    const leaderboard = await LeaderboardModel.getLeaderboardBySport(req.params.sportId);
    
    if (leaderboard && leaderboard.length > 0) {
      // Populate user and gameMode information
      const populatedLeaderboard = await Promise.all(leaderboard.map(async (entry) => {
        const [user, gameMode] = await Promise.all([
          UserModel.findById(entry.user),
          GameModeModel.getGameModeById(entry.gameMode)
        ]);
        
        return {
          ...entry,
          user: user ? { _id: user._id, name: user.name } : null,
          gameMode: gameMode ? { _id: gameMode._id, name: gameMode.name } : null
        };
      }));
      
      res.json(populatedLeaderboard);
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
    const leaderboard = await LeaderboardModel.getLeaderboardByGameMode(req.params.gameModeId);
    
    if (leaderboard && leaderboard.length > 0) {
      // Populate user and sport information
      const populatedLeaderboard = await Promise.all(leaderboard.map(async (entry) => {
        const [user, sport] = await Promise.all([
          UserModel.findById(entry.user),
          SportModel.getSportById(entry.sport)
        ]);
        
        return {
          ...entry,
          user: user ? { _id: user._id, name: user.name } : null,
          sport: sport ? { _id: sport._id, name: sport.name } : null
        };
      }));
      
      res.json(populatedLeaderboard);
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
