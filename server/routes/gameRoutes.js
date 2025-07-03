const express = require('express');
const router = express.Router();
const { 
  getGameModes, 
  getGameModeById, 
  submitGameResult 
} = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getGameModes);
router.route('/:id').get(getGameModeById);
router.route('/submit').post(protect, submitGameResult);

module.exports = router;
