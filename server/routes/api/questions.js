
const express = require('express');
const router = express.Router();
const { elasticClient } = require('../../config/elastic');

// @route   GET api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await elasticClient.search({
      index: 'questions',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    const questions = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/questions/sport/:sportId
// @desc    Get questions by sport ID
// @access  Public
router.get('/sport/:sportId', async (req, res) => {
  try {
    const result = await elasticClient.search({
      index: 'questions',
      body: {
        query: {
          match: {
            sport: req.params.sportId
          }
        }
      }
    });
    
    const questions = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
