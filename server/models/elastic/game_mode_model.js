
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'game_modes';

// Create index if it doesn't exist
const createIndex = async () => {
  const exists = await elasticClient.indices.exists({ index: INDEX });
  
  if (!exists) {
    await elasticClient.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            name: { type: 'keyword' },
            description: { type: 'text' },
            sport: { type: 'keyword' },
            isUniversal: { type: 'boolean' },
            rules: { type: 'text' },
            timeLimit: { type: 'integer' },
            pointsPerCorrectAnswer: { type: 'integer' },
            imageUrl: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get all game modes
const getGameModes = async () => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        match_all: {}
      }
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Get game mode by ID
const getGameModeById = async (id) => {
  try {
    const result = await elasticClient.get({
      index: INDEX,
      id
    });
    
    return {
      _id: result._id,
      ...result._source
    };
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return null;
    }
    throw error;
  }
};

// Get game modes by sport
const getGameModesBySport = async (sportId) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          sport: sportId
        }
      }
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Create game mode
const createGameMode = async (gameMode) => {
  gameMode.createdAt = new Date();
  gameMode.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: gameMode,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...gameMode
  };
};

// Update game mode
const updateGameMode = async (id, gameMode) => {
  gameMode.updatedAt = new Date();
  
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: gameMode
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...gameMode
  };
};

// Delete game mode
const deleteGameMode = async (id) => {
  await elasticClient.delete({
    index: INDEX,
    id,
    refresh: true
  });
};

module.exports = {
  createIndex,
  getGameModes,
  getGameModeById,
  getGameModesBySport,
  createGameMode,
  updateGameMode,
  deleteGameMode
};
