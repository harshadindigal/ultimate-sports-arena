const Question = require('../models/questionModel');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      res.json(question);
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get questions by sport
// @route   GET /api/questions/sport/:sportId
// @access  Public
const getQuestionsBySport = async (req, res) => {
  try {
    const questions = await Question.find({ sport: req.params.sportId });
    
    if (questions && questions.length > 0) {
      res.json(questions);
    } else {
      res.status(404);
      throw new Error('No questions found for this sport');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get questions by game mode
// @route   GET /api/questions/gamemode/:gameModeId
// @access  Public
const getQuestionsByGameMode = async (req, res) => {
  try {
    const questions = await Question.find({ gameMode: req.params.gameModeId });
    
    if (questions && questions.length > 0) {
      res.json(questions);
    } else {
      res.status(404);
      throw new Error('No questions found for this game mode');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  getQuestionsBySport,
  getQuestionsByGameMode,
};
