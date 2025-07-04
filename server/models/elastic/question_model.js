
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'questions';

// Create index if it doesn't exist
const createIndex = async () => {
  const exists = await elasticClient.indices.exists({ index: INDEX });
  
  if (!exists) {
    await elasticClient.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            text: { type: 'text' },
            options: {
              type: 'nested',
              properties: {
                text: { type: 'text' },
                isCorrect: { type: 'boolean' }
              }
            },
            explanation: { type: 'text' },
            difficulty: { type: 'keyword' },
            sport: { type: 'keyword' },
            gameMode: { type: 'keyword' },
            category: { type: 'keyword' },
            imageUrl: { type: 'keyword' },
            year: { type: 'integer' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get all questions
const getQuestions = async () => {
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

// Get question by ID
const getQuestionById = async (id) => {
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

// Get questions by sport
const getQuestionsBySport = async (sportId) => {
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

// Get questions by game mode
const getQuestionsByGameMode = async (gameModeId) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          gameMode: gameModeId
        }
      }
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Create question
const createQuestion = async (question) => {
  question.createdAt = new Date();
  question.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: question,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...question
  };
};

// Update question
const updateQuestion = async (id, question) => {
  question.updatedAt = new Date();
  
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: question
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...question
  };
};

// Delete question
const deleteQuestion = async (id) => {
  await elasticClient.delete({
    index: INDEX,
    id,
    refresh: true
  });
};

module.exports = {
  createIndex,
  getQuestions,
  getQuestionById,
  getQuestionsBySport,
  getQuestionsByGameMode,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
