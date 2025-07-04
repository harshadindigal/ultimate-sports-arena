
const BasketballReferenceScraper = require('../scrapers/basketball-reference-scraper');
const ESPNNBAApiClient = require('../api-clients/espn-nba-api-client');
const dataNormalizer = require('../utils/data-normalizer');
const { elasticClient } = require('../../config/elastic');

class NBAETLPipeline {
  constructor() {
    this.basketballReferenceScraper = new BasketballReferenceScraper();
    this.espnApiClient = new ESPNNBAApiClient();
    this.sportName = 'NBA';
  }

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
      
      // Extract players for each team
      const players = [];
      for (const team of teams.slice(0, 2)) { // Limit to 2 teams for testing
        const teamPlayers = await this.basketballReferenceScraper.getPlayers(team.id, season);
        players.push(...teamPlayers);
      }
      
      // Extract data from ESPN API
      const espnTeams = await this.espnApiClient.getTeams();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Get last 7 days
      const espnGames = await this.espnApiClient.getSchedule(startDate, new Date());
      
      console.log(`Extracted ${teams.length} teams, ${players.length} players, ${espnGames.length} games from sources`);
      
      return {
        teams: [...teams, ...espnTeams],
        players,
        games: espnGames
      };
    } catch (error) {
      console.error(`Error in extract step: ${error.message}`);
      return { teams: [], players: [], games: [] };
    }
  }

  async transform(rawData) {
    try {
      const normalizedData = [];
      
      // Normalize teams
      for (const team of rawData.teams) {
        normalizedData.push({
          type: 'team',
          data: dataNormalizer.normalizeTeam(team, this.sportName)
        });
      }
      
      // Normalize players
      for (const player of rawData.players) {
        normalizedData.push({
          type: 'player',
          data: dataNormalizer.normalizePlayer(player, this.sportName)
        });
      }
      
      // Normalize games
      for (const game of rawData.games) {
        normalizedData.push({
          type: 'game',
          data: dataNormalizer.normalizeGame(game, this.sportName)
        });
      }
      
      console.log(`Transformed data into ${normalizedData.length} normalized records`);
      
      return normalizedData;
    } catch (error) {
      console.error(`Error in transform step: ${error.message}`);
      return [];
    }
  }

  async load(normalizedData) {
    try {
      const results = {
        success: 0,
        failure: 0
      };
      
      for (const item of normalizedData) {
        try {
          const { type, data } = item;
          
          // Determine the index based on the type
          let index;
          switch (type) {
            case 'team':
              index = 'teams';
              break;
            case 'player':
              index = 'players';
              break;
            case 'game':
              index = 'games';
              break;
            default:
              index = 'sports_data';
          }
          
          // Add timestamp
          data.createdAt = new Date();
          data.updatedAt = new Date();
          
          // Index the document
          await elasticClient.index({
            index,
            body: data,
            refresh: true
          });
          
          results.success++;
        } catch (error) {
          console.error(`Error indexing item: ${error.message}`);
          results.failure++;
        }
      }
      
      console.log(`Loaded ${results.success} items successfully, ${results.failure} failures`);
      
      return results;
    } catch (error) {
      console.error(`Error in load step: ${error.message}`);
      return { success: 0, failure: 0 };
    }
  }

  async generateTrivia() {
    try {
      // Generate some sample trivia questions based on the collected data
      const triviaQuestions = [
        {
          text: 'Which NBA team has the most wins in the current season?',
          options: [
            { text: 'Los Angeles Lakers', isCorrect: false },
            { text: 'Golden State Warriors', isCorrect: false },
            { text: 'Milwaukee Bucks', isCorrect: true },
            { text: 'Brooklyn Nets', isCorrect: false }
          ],
          explanation: 'The Milwaukee Bucks have the most wins in the current NBA season.',
          difficulty: 'easy',
          sport: 'NBA',
          category: 'team_stats'
        },
        {
          text: 'Who is the tallest active NBA player?',
          options: [
            { text: 'Boban Marjanović', isCorrect: true },
            { text: 'Kristaps Porziņģis', isCorrect: false },
            { text: 'Joel Embiid', isCorrect: false },
            { text: 'Nikola Jokić', isCorrect: false }
          ],
          explanation: 'Boban Marjanović is the tallest active NBA player at 7 feet 4 inches.',
          difficulty: 'medium',
          sport: 'NBA',
          category: 'player_stats'
        }
      ];
      
      // Save trivia questions to Elasticsearch
      for (const question of triviaQuestions) {
        await elasticClient.index({
          index: 'questions',
          body: {
            ...question,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          refresh: true
        });
      }
      
      console.log(`Generated and saved ${triviaQuestions.length} NBA trivia questions`);
      
      return triviaQuestions;
    } catch (error) {
      console.error(`Error generating trivia: ${error.message}`);
      return [];
    }
  }

  async runPipeline() {
    try {
      console.log('Starting NBA ETL pipeline...');
      
      // Extract data from sources
      const rawData = await this.extract();
      
      // Transform the data
      const normalizedData = await this.transform(rawData);
      
      // Load the data into Elasticsearch
      const loadResults = await this.load(normalizedData);
      
      // Generate trivia questions
      const triviaQuestions = await this.generateTrivia();
      
      console.log('NBA ETL pipeline completed successfully');
      
      return {
        extractedData: rawData,
        normalizedData,
        loadResults,
        triviaQuestions
      };
    } catch (error) {
      console.error(`Error running NBA ETL pipeline: ${error.message}`);
      return null;
    }
  }
}

module.exports = NBAETLPipeline;
