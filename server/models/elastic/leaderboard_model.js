
const { elasticClient } = require('../../config/elastic');

// Index name
const INDEX = 'leaderboard';

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
            rank: { type: 'integer' },
            date: { type: 'date' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
    console.log(`Created index ${INDEX}`);
  }
};

// Get global leaderboard
const getLeaderboard = async (limit = 100) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        match_all: {}
      },
      sort: [
        { score: { order: 'desc' } }
      ],
      size: limit
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Get leaderboard by sport
const getLeaderboardBySport = async (sportId, limit = 100) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          sport: sportId
        }
      },
      sort: [
        { score: { order: 'desc' } }
      ],
      size: limit
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Get leaderboard by game mode
const getLeaderboardByGameMode = async (gameModeId, limit = 100) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        term: {
          gameMode: gameModeId
        }
      },
      sort: [
        { score: { order: 'desc' } }
      ],
      size: limit
    }
  });
  
  return result.hits.hits.map(hit => ({
    _id: hit._id,
    ...hit._source
  }));
};

// Find leaderboard entry by user, sport, and game mode
const findLeaderboardEntry = async (userId, sportId, gameModeId) => {
  const result = await elasticClient.search({
    index: INDEX,
    body: {
      query: {
        bool: {
          must: [
            { term: { user: userId } },
            { term: { sport: sportId } },
            { term: { gameMode: gameModeId } }
          ]
        }
      }
    }
  });
  
  if (result.hits.total.value === 0) {
    return null;
  }
  
  return {
    _id: result.hits.hits[0]._id,
    ...result.hits.hits[0]._source
  };
};

// Create leaderboard entry
const createLeaderboardEntry = async (entry) => {
  entry.date = entry.date || new Date();
  entry.createdAt = new Date();
  entry.updatedAt = new Date();
  
  const result = await elasticClient.index({
    index: INDEX,
    body: entry,
    refresh: true
  });
  
  return {
    _id: result._id,
    ...entry
  };
};

// Update leaderboard entry
const updateLeaderboardEntry = async (id, entry) => {
  entry.updatedAt = new Date();
  
  await elasticClient.update({
    index: INDEX,
    id,
    body: {
      doc: entry
    },
    refresh: true
  });
  
  return {
    _id: id,
    ...entry
  };
};

// Update leaderboard rankings
const updateLeaderboardRankings = async (sportId, gameModeId) => {
  // Get all entries for this sport and game mode
  const entries = await getLeaderboardByGameMode(gameModeId);
  
  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    entry.rank = i + 1;
    await updateLeaderboardEntry(entry._id, { rank: entry.rank });
  }
  
  return entries;
};

module.exports = {
  createIndex,
  getLeaderboard,
  getLeaderboardBySport,
  getLeaderboardByGameMode,
  findLeaderboardEntry,
  createLeaderboardEntry,
  updateLeaderboardEntry,
  updateLeaderboardRankings
};
