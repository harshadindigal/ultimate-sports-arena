const express = require('express');
const router = express.Router();
const { 
  getSports, 
  getSportById, 
  getSportGameModes 
} = require('../controllers/sportController');

router.route('/').get(getSports);
router.route('/:id').get(getSportById);
router.route('/:id/gamemodes').get(getSportGameModes);

module.exports = router;
