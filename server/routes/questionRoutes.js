const express = require('express');
const router = express.Router();
const { 
  getQuestions, 
  getQuestionById, 
  getQuestionsBySport, 
  getQuestionsByGameMode 
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getQuestions);
router.route('/:id').get(getQuestionById);
router.route('/sport/:sportId').get(getQuestionsBySport);
router.route('/gamemode/:gameModeId').get(getQuestionsByGameMode);

module.exports = router;
