
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'game_history';

// Create index if it doesn't exist
const createIndex = async () => {
  const exists = await elasticClient.indices.exists({ index: INDEX });
  
  if (!exists) {
    await elasticClient.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            user: { type: 'keyword' },
            sport: { type: 'keyword' },
            gameMode: { type: 'keyword' },
            score: { type: 'integer' },
            correctAnswers: { type: 'integer' },
            totalQuestions: { type: 'integer' },
            timeSpent: { type: 'integer' },
            completed: { type: 'boolean' },
            answers: {
              type: 'nested',
              properties: {
                question: { type: 'keyword' },
                userAnswer: { type: 'text' },
                isCorrect: { type: 'boolean' },
                timeToAnswer: { type: 'integer' }
              }
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get game history by user
const getGameHistoryByUser = async (userId) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          user: userId
        }
      },
      sort: [
        { createdAt: { order: 'desc' } }
      ]
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Get game history by sport
const getGameHistoryBySport = async (sportId) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          sport: sportId
        }
      },
      sort: [
        { createdAt: { order: 'desc' } }
      ]
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Create game history
const createGameHistory = async (gameHistory) => {
  gameHistory.createdAt = new Date();
  gameHistory.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: gameHistory,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...gameHistory
  };
};

module.exports = {
  createIndex,
  getGameHistoryByUser,
  getGameHistoryBySport,
  createGameHistory
};
