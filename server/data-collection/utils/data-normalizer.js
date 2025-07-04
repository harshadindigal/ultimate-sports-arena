
const { indices } = require('../config');
const { elasticClient } = require('../../config/elastic');

class DataNormalizer {
  constructor() {
    this.indices = indices;
  }

  // Normalize player data
  normalizePlayer(rawData, sport) {
    return {
      name: rawData.name,
      dob: rawData.dob || null,
      nationality: rawData.nationality || null,
      teams: rawData.teams || [],
      sport: sport,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Normalize team data
  normalizeTeam(rawData, sport) {
    return {
      name: rawData.name,
      sport: sport,
      league: rawData.league || null,
      seasonStats: rawData.seasonStats || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Normalize match data
  normalizeMatch(rawData, sport) {
    return {
      date: rawData.date,
      score: rawData.score,
      participants: rawData.participants || [],
      stats: rawData.stats || {},
      sport: sport,
      event: rawData.event || null,
      season: rawData.season || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Normalize event data
  normalizeEvent(rawData, sport) {
    return {
      name: rawData.name,
      date: rawData.date,
      location: rawData.location || null,
      participants: rawData.participants || [],
      sport: sport,
      season: rawData.season || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Normalize season data
  normalizeSeason(rawData, sport) {
    return {
      year: rawData.year,
      league: rawData.league,
      topStats: rawData.topStats || {},
      sport: sport,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Normalize stat line data
  normalizeStatLine(rawData, sport) {
    return {
      player_id: rawData.player_id,
      match_id: rawData.match_id,
      stat_type: rawData.stat_type,
      value: rawData.value,
      sport: sport,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Generate trivia from normalized data
  generateTrivia(data, sport) {
    // This is a placeholder for trivia generation logic
    // In a real implementation, this would analyze the data and create trivia questions
    return {
      sport: sport,
      question: `Who scored the most points in the ${data.season || 'recent'} ${sport} season?`,
      options: [
        { text: 'Player 1', isCorrect: false },
        { text: 'Player 2', isCorrect: true },
        { text: 'Player 3', isCorrect: false },
        { text: 'Player 4', isCorrect: false }
      ],
      difficulty: 'medium',
      category: 'statistics',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Save normalized data to appropriate indices
  async saveNormalizedData(data, type, sport) {
    let index;
    let normalizedData;

    switch (type) {
      case 'player':
        index = this.indices.players;
        normalizedData = this.normalizePlayer(data, sport);
        break;
      case 'team':
        index = this.indices.teams;
        normalizedData = this.normalizeTeam(data, sport);
        break;
      case 'match':
        index = this.indices.matches;
        normalizedData = this.normalizeMatch(data, sport);
        break;
      case 'event':
        index = this.indices.events;
        normalizedData = this.normalizeEvent(data, sport);
        break;
      case 'season':
        index = this.indices.seasons;
        normalizedData = this.normalizeSeason(data, sport);
        break;
      case 'statLine':
        index = this.indices.statLines;
        normalizedData = this.normalizeStatLine(data, sport);
        break;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }

    try {
      const result = await elasticClient.index({
        index,
        body: normalizedData,
        refresh: true
      });
      
      // Generate and save trivia if it's match or event data
      if (type === 'match' || type === 'event') {
        const trivia = this.generateTrivia(normalizedData, sport);
        await elasticClient.index({
          index: `trivia_matches_${sport.toLowerCase().replace(/\s+/g, '_')}`,
          body: trivia,
          refresh: true
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Error saving normalized data to Elasticsearch: ${error.message}`);
      return null;
    }
  }
}

module.exports = DataNormalizer;
