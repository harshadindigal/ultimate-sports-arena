
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'achievements';

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
            imageUrl: { type: 'keyword' },
            criteria: { type: 'text' },
            points: { type: 'integer' },
            isUnlocked: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get all achievements
const getAchievements = async () => {
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

// Get achievement by ID
const getAchievementById = async (id) => {
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

// Create achievement
const createAchievement = async (achievement) => {
  achievement.createdAt = new Date();
  achievement.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: achievement,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...achievement
  };
};

// Update achievement
const updateAchievement = async (id, achievement) => {
  achievement.updatedAt = new Date();
  
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: achievement
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...achievement
  };
};

module.exports = {
  createIndex,
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement
};
