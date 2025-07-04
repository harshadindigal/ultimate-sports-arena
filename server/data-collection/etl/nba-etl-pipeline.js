
const ETLPipeline = require('../utils/etl-pipeline');
const BasketballReferenceScraper = require('../scrapers/basketball-reference-scraper');
const ESPNNBAApiClient = require('../api-clients/espn-nba-api-client');
const { elasticClient } = require('../../config/elastic');

class NBAETLPipeline extends ETLPipeline {
  constructor() {
    super('NBA');
    this.basketballReferenceScraper = new BasketballReferenceScraper();
    this.espnApiClient = new ESPNNBAApiClient();
  }

  // Extract data from sources
  async extract() {
    try {
      // Get current season
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // NBA season typically runs from October to June
      const season = currentMonth >= 10 ? currentYear : currentMonth <= 6 ? currentYear - 1 : currentYear;
      
      // Extract data from Basketball Reference
      const teams = await this.basketballReferenceScraper.getTeams(season);
      const games = await this.basketballReferenceScraper.getGames(season);
      const playerStats = await this.basketballReferenceScraper.getPlayerStats(season);
      
      // Extract players for each team
      const players = [];
      for (const team of teams) {
        const teamPlayers = await this.basketballReferenceScraper.getPlayers(team.id, season);
        players.push(...teamPlayers);
      }
      
      // Extract data from ESPN API
      const espnTeams = await this.espnApiClient.getTeams();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Get last 7 days
      const espnGames = await this.espnApiClient.getSchedule(startDate, new Date());
      
      return {
        teams: [...teams, ...espnTeams],
        players,
        games: [...games, ...espnGames],
        playerStats
      };
    } catch (error) {
      console.error(`Error extracting NBA data: ${error.message}`);
      throw error;
    }
  }

  // Transform extracted data to normalized format
  async transform(rawData) {
    try {
      const normalizedData = [];
      
      // Transform teams
      const uniqueTeams = new Map();
      for (const team of rawData.teams) {
        if (!uniqueTeams.has(team.name)) {
          uniqueTeams.set(team.name, team);
          normalizedData.push({
            type: 'team',
            data: team
          });
        }
      }
      
      // Transform players
      const uniquePlayers = new Map();
      for (const player of rawData.players) {
        if (!uniquePlayers.has(player.id)) {
          uniquePlayers.set(player.id, player);
          normalizedData.push({
            type: 'player',
            data: player
          });
        }
      }
      
      // Transform games
      const uniqueGames = new Map();
      for (const game of rawData.games) {
        // Create a unique key for the game
        const gameKey = `${game.date}-${game.homeTeam || game.participants[0]}-${game.awayTeam || game.participants[1]}`;
        
        if (!uniqueGames.has(gameKey)) {
          uniqueGames.set(gameKey, game);
          normalizedData.push({
            type: 'match',
            data: game
          });
        }
      }
      
      // Transform player stats
      for (const stat of rawData.playerStats) {
        normalizedData.push({
          type: 'statLine',
          data: {
            player_id: stat.player_id,
            match_id: null, // Not tied to a specific match
            stat_type: 'season_average',
            value: stat
          }
        });
      }
      
      return normalizedData;
    } catch (error) {
      console.error(`Error transforming NBA data: ${error.message}`);
      throw error;
    }
  }

  // Run the ETL pipeline for NBA data
  async runPipeline() {
    try {
      console.log('Starting NBA ETL pipeline...');
      
      const rawData = await this.extract();
      console.log(\`Extracted \${rawData.teams.length} teams, \${rawData.players.length} players, \${rawData.games.length} games, \${rawData.playerStats.length} player stats\`);
      
      const normalizedData = await this.transform(rawData);
      console.log(\`Transformed data into \${normalizedData.length} normalized records\`);
      
      const results = await this.load(normalizedData);
      console.log('NBA data loaded into Elasticsearch');
      
      // Generate trivia questions
      await this.generateTrivia();
      
      return {
        extracted: {
          teams: rawData.teams.length,
          players: rawData.players.length,
          games: rawData.games.length,
          playerStats: rawData.playerStats.length
        },
        loaded: results
      };
    } catch (error) {
      console.error(`Error running NBA ETL pipeline: ${error.message}`);
      return null;
    }
  }

  // Generate trivia questions based on the data
  async generateTrivia() {
    try {
      // Get top scorers
      const topScorers = await elasticClient.search({
        index: 'stat_lines',
        body: {
          query: {
            bool: {
              must: [
                { term: { sport: 'NBA' } },
                { term: { 'stat_type': 'season_average' } }
              ]
            }
          },
          sort: [
            { 'value.pointsPerGame': { order: 'desc' } }
          ],
          size: 10
        }
      });
      
      // Generate trivia questions
      const triviaQuestions = [];
      
      if (topScorers.hits.total.value > 0) {
        const topScorer = topScorers.hits.hits[0]._source;
        
        triviaQuestions.push({
          sport: 'NBA',
          question: \`Who led the NBA in points per game for the \${topScorer.value.season} season?\`,
          options: [
            { text: topScorer.value.name, isCorrect: true },
            { text: 'LeBron James', isCorrect: false },
            { text: 'Kevin Durant', isCorrect: false },
            { text: 'Stephen Curry', isCorrect: false }
          ],
          difficulty: 'medium',
          category: 'statistics',
          year: parseInt(topScorer.value.season.split('-')[0], 10),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Save trivia questions to Elasticsearch
      if (triviaQuestions.length > 0) {
        await this.bulkSaveToElasticsearch('trivia_matches_nba', triviaQuestions);
        console.log(\`Generated and saved \${triviaQuestions.length} NBA trivia questions\`);
      }
      
      return triviaQuestions;
    } catch (error) {
      console.error(`Error generating NBA trivia: ${error.message}`);
      return [];
    }
  }
}

module.exports = NBAETLPipeline;
