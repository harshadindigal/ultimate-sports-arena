
const { elasticClient } = require('../../config/elastic');
const bcrypt = require('bcryptjs');

// Index name
const INDEX = 'users';

// Create index if it doesn't exist
const createIndex = async () => {
  const exists = await elasticClient.indices.exists({ index: INDEX });
  
  if (!exists) {
    await elasticClient.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            email: { type: 'keyword' },
            password: { type: 'keyword' },
            isAdmin: { type: 'boolean' },
            favoritesSports: { type: 'keyword' },
            achievements: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Find user by email
const findByEmail = async (email) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          email: email
        }
      }
    }
  });
  
  if (result.hits.total.value === 0) {
    return null;
  }
  
  const user = {
    _id: result.hits.hits[0]._id,
    ...result.hits.hits[0]._source
  };
  
  // Add matchPassword method
  user.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  return user;
};

// Find user by ID
const findById = async (id) => {
  try {
    const result = await elasticClient.get({
      index: INDEX,
      id
    });
    
    const user = {
      _id: result._id,
      ...result._source
    };
    
    // Add matchPassword method
    user.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
    
    return user;
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return null;
    }
    throw error;
  }
};

// Create user
const createUser = async (userData) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);
  
  userData.createdAt = new Date();
  userData.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: userData,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...userData
  };
};

// Update user
const updateUser = async (id, userData) => {
  // Hash password if it's being updated
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }
  
  userData.updatedAt = new Date();
  
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: userData
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...userData
  };
};

module.exports = {
  createIndex,
  findByEmail,
  findById,
  createUser,
  updateUser
};
