const Sport = require('../models/sportModel');
const GameMode = require('../models/gameModeModel');

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
const getSports = async (req, res) => {
  try {
    const sports = await Sport.find({});
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
    const sport = await Sport.findById(req.params.id).populate('gameModes');

    if (sport) {
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
    const gameModes = await GameMode.find({ sport: req.params.id });
    
    if (gameModes) {
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
