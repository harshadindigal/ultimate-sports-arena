
const express = require('express');
const router = express.Router();
const { elasticClient } = require('../../config/elastic');

// @route   GET api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await elasticClient.search({
      index: 'leaderboard',
      body: {
        query: {
          match_all: {}
        },
        sort: [
          { score: { order: 'desc' } }
        ]
      }
    });
    
    const leaderboard = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leaderboard/sport/:sportId
// @desc    Get leaderboard by sport
// @access  Public
router.get('/sport/:sportId', async (req, res) => {
  try {
    const result = await elasticClient.search({
      index: 'leaderboard',
      body: {
        query: {
          match: {
            sport: req.params.sportId
          }
        },
        sort: [
          { score: { order: 'desc' } }
        ]
      }
    });
    
    const leaderboard = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
