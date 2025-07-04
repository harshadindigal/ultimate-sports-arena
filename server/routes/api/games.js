
const express = require('express');
const router = express.Router();
const { elasticClient } = require('../../config/elastic');

// @route   GET api/games
// @desc    Get all game modes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await elasticClient.search({
      index: 'games',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    const games = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/:id
// @desc    Get game mode by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const result = await elasticClient.get({
      index: 'games',
      id: req.params.id
    });
    
    if (!result._source) {
      return res.status(404).json({ msg: 'Game mode not found' });
    }
    
    res.json({
      id: result._id,
      ...result._source
    });
  } catch (err) {
    console.error(err.message);
    if (err.statusCode === 404) {
      return res.status(404).json({ msg: 'Game mode not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
