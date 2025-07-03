const express = require('express');
const router = express.Router();
const { 
  getLeaderboard, 
  getLeaderboardBySport, 
  getLeaderboardByGameMode 
} = require('../controllers/leaderboardController');

router.route('/').get(getLeaderboard);
router.route('/sport/:sportId').get(getLeaderboardBySport);
router.route('/gamemode/:gameModeId').get(getLeaderboardByGameMode);

module.exports = router;
