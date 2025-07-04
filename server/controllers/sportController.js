
const { SportModel } = require('../models/elastic');
const { GameModeModel } = require('../models/elastic');

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
const getSports = async (req, res) => {
  try {
    const sports = await SportModel.getSports();
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sport by ID
// @route   GET /api/sports/:id
// @access  Public
const getSportById = async (req, res) => {
  try {
    const sport = await SportModel.getSportById(req.params.id);

    if (sport) {
      // Get game modes for this sport
      const gameModes = await GameModeModel.getGameModesBySport(req.params.id);
      sport.gameModes = gameModes;
      
      res.json(sport);
    } else {
      res.status(404);
      throw new Error('Sport not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get game modes for a sport
// @route   GET /api/sports/:id/gamemodes
// @access  Public
const getSportGameModes = async (req, res) => {
  try {
    const gameModes = await GameModeModel.getGameModesBySport(req.params.id);
    
    if (gameModes && gameModes.length > 0) {
      res.json(gameModes);
    } else {
      res.status(404);
      throw new Error('No game modes found for this sport');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getSports,
  getSportById,
  getSportGameModes,
};
