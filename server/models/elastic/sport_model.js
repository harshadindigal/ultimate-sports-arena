
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'sports';

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
            leagues: {
              type: 'nested',
              properties: {
                name: { type: 'keyword' },
                description: { type: 'text' },
                imageUrl: { type: 'keyword' }
              }
            },
            gameModes: { type: 'keyword' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get all sports
const getSports = async () => {
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

// Get sport by ID
const getSportById = async (id) => {
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

// Create sport
const createSport = async (sport) => {
  const result = await elasticClient.index({
    index: INDEX,
    body: sport,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...sport
  };
};

// Update sport
const updateSport = async (id, sport) => {
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: sport
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...sport
  };
};

// Delete sport
const deleteSport = async (id) => {
  await elasticClient.delete({
    index: INDEX,
    id,
    refresh: true
  });
};

module.exports = {
  createIndex,
  getSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport
};
