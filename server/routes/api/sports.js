
const express = require('express');
const router = express.Router();
const { elasticClient } = require('../../config/elastic');

// @route   GET api/sports
// @desc    Get all sports
// @access  Public
router.get('/', async (req, res) => {
  console.log('GET /api/sports endpoint called');
  try {
    console.log('Searching Elasticsearch for sports...');
    const result = await elasticClient.search({
      index: 'sports',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    console.log('Elasticsearch result:', JSON.stringify(result));
    const sports = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
    
    console.log('Returning sports:', JSON.stringify(sports));
    res.json(sports);
  } catch (err) {
    console.error('Error in GET /api/sports:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sports/:id
// @desc    Get sport by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('Searching Elasticsearch for sports...');
    const result = await elasticClient.get({
      index: 'sports',
      id: req.params.id
    });
    
    if (!result._source) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    
    res.json({
      id: result._id,
      ...result._source
    });
  } catch (err) {
    console.error('Error in GET /api/sports:', err.message);
    if (err.statusCode === 404) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
