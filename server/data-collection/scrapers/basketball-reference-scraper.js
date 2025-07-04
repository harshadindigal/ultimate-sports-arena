
const BaseScraper = require('../utils/base-scraper');
const DataNormalizer = require('../utils/data-normalizer');
const { indices } = require('../config');

class BasketballReferenceScraper extends BaseScraper {
  constructor() {
    super('https://www.basketball-reference.com');
    this.normalizer = new DataNormalizer();
  }

  // Get team data for a specific season
  async getTeams(season = '2023') {
    try {
      const url = `${this.baseUrl}/leagues/NBA_${season}.html`;
      const $ = await this.scrape(url);
      
      if (!$) return [];
      
      const teams = [];
      
      // Extract Eastern Conference teams
      $('#divs_standings_E tbody tr').each((i, elem) => {
        const teamName = $(elem).find('th a').text().trim();
        const teamLink = $(elem).find('th a').attr('href');
        const teamId = teamLink ? teamLink.split('/')[2] : null;
        
        if (teamName && teamId) {
          teams.push({
            name: teamName,
            id: teamId,
            league: 'NBA',
            conference: 'Eastern',
            seasonStats: {
              season,
              wins: parseInt($(elem).find('td[data-stat="wins"]').text().trim(), 10) || 0,
              losses: parseInt($(elem).find('td[data-stat="losses"]').text().trim(), 10) || 0,
            }
          });
        }
      });
      
      // Extract Western Conference teams
      $('#divs_standings_W tbody tr').each((i, elem) => {
        const teamName = $(elem).find('th a').text().trim();
        const teamLink = $(elem).find('th a').attr('href');
        const teamId = teamLink ? teamLink.split('/')[2] : null;
        
        if (teamName && teamId) {
          teams.push({
            name: teamName,
            id: teamId,
            league: 'NBA',
            conference: 'Western',
            seasonStats: {
              season,
              wins: parseInt($(elem).find('td[data-stat="wins"]').text().trim(), 10) || 0,
              losses: parseInt($(elem).find('td[data-stat="losses"]').text().trim(), 10) || 0,
            }
          });
        }
      });
      
      return teams;
    } catch (error) {
      console.error(`Error getting NBA teams: ${error.message}`);
      return [];
    }
  }

  // Get player data for a specific team and season
  async getPlayers(teamId, season = '2023') {
    try {
      const url = `${this.baseUrl}/teams/${teamId}/${season}.html`;
      const $ = await this.scrape(url);
      
      if (!$) return [];
      
      const players = [];
      
      $('#roster tbody tr').each((i, elem) => {
        const playerName = $(elem).find('td[data-stat="player"] a').text().trim();
        const playerLink = $(elem).find('td[data-stat="player"] a').attr('href');
        const playerId = playerLink ? playerLink.split('/')[3].replace('.html', '') : null;
        
        if (playerName && playerId) {
          players.push({
            name: playerName,
            id: playerId,
            number: $(elem).find('th[data-stat="number"]').text().trim(),
            position: $(elem).find('td[data-stat="pos"]').text().trim(),
            height: $(elem).find('td[data-stat="height"]').text().trim(),
            weight: $(elem).find('td[data-stat="weight"]').text().trim(),
            birthDate: $(elem).find('td[data-stat="birth_date"]').text().trim(),
            nationality: null, // Not available on this page
            teams: [teamId]
          });
        }
      });
      
      return players;
    } catch (error) {
      console.error(`Error getting NBA players: ${error.message}`);
      return [];
    }
  }

  // Get game data for a specific season
  async getGames(season = '2023') {
    try {
      const url = `${this.baseUrl}/leagues/NBA_${season}_games.html`;
      const $ = await this.scrape(url);
      
      if (!$) return [];
      
      const games = [];
      
      $('#schedule tbody tr').each((i, elem) => {
        const date = $(elem).find('th[data-stat="date_game"]').text().trim();
        const visitorTeam = $(elem).find('td[data-stat="visitor_team_name"] a').text().trim();
        const visitorPoints = parseInt($(elem).find('td[data-stat="visitor_pts"]').text().trim(), 10);
        const homeTeam = $(elem).find('td[data-stat="home_team_name"] a').text().trim();
        const homePoints = parseInt($(elem).find('td[data-stat="home_pts"]').text().trim(), 10);
        
        if (date && visitorTeam && homeTeam && !isNaN(visitorPoints) && !isNaN(homePoints)) {
          games.push({
            date: new Date(date),
            season,
            visitorTeam,
            homeTeam,
            visitorPoints,
            homePoints,
            score: `${visitorPoints}-${homePoints}`,
            winner: visitorPoints > homePoints ? visitorTeam : homeTeam,
            participants: [visitorTeam, homeTeam],
            stats: {
              visitorPoints,
              homePoints
            }
          });
        }
      });
      
      return games;
    } catch (error) {
      console.error(`Error getting NBA games: ${error.message}`);
      return [];
    }
  }

  // Get player statistics for a specific season
  async getPlayerStats(season = '2023') {
    try {
      const url = `${this.baseUrl}/leagues/NBA_${season}_per_game.html`;
      const $ = await this.scrape(url);
      
      if (!$) return [];
      
      const playerStats = [];
      
      $('#per_game_stats tbody tr').each((i, elem) => {
        const playerName = $(elem).find('td[data-stat="player"] a').text().trim();
        const playerLink = $(elem).find('td[data-stat="player"] a').attr('href');
        const playerId = playerLink ? playerLink.split('/')[3].replace('.html', '') : null;
        
        if (playerName && playerId) {
          playerStats.push({
            player_id: playerId,
            name: playerName,
            season,
            team: $(elem).find('td[data-stat="team_id"] a').text().trim(),
            position: $(elem).find('td[data-stat="pos"]').text().trim(),
            games: parseInt($(elem).find('td[data-stat="g"]').text().trim(), 10) || 0,
            gamesStarted: parseInt($(elem).find('td[data-stat="gs"]').text().trim(), 10) || 0,
            minutesPerGame: parseFloat($(elem).find('td[data-stat="mp_per_g"]').text().trim()) || 0,
            pointsPerGame: parseFloat($(elem).find('td[data-stat="pts_per_g"]').text().trim()) || 0,
            reboundsPerGame: parseFloat($(elem).find('td[data-stat="trb_per_g"]').text().trim()) || 0,
            assistsPerGame: parseFloat($(elem).find('td[data-stat="ast_per_g"]').text().trim()) || 0,
            stealsPerGame: parseFloat($(elem).find('td[data-stat="stl_per_g"]').text().trim()) || 0,
            blocksPerGame: parseFloat($(elem).find('td[data-stat="blk_per_g"]').text().trim()) || 0
          });
        }
      });
      
      return playerStats;
    } catch (error) {
      console.error(`Error getting NBA player stats: ${error.message}`);
      return [];
    }
  }

  // Save all NBA data for a specific season
  async saveNBAData(season = '2023') {
    try {
      // Get and save teams
      const teams = await this.getTeams(season);
      for (const team of teams) {
        await this.normalizer.saveNormalizedData(team, 'team', 'NBA');
      }
      
      // Get and save players for each team
      for (const team of teams) {
        const players = await this.getPlayers(team.id, season);
        for (const player of players) {
          await this.normalizer.saveNormalizedData(player, 'player', 'NBA');
        }
      }
      
      // Get and save games
      const games = await this.getGames(season);
      for (const game of games) {
        await this.normalizer.saveNormalizedData(game, 'match', 'NBA');
      }
      
      // Get and save player stats
      const playerStats = await this.getPlayerStats(season);
      for (const stat of playerStats) {
        await this.normalizer.saveNormalizedData({
          player_id: stat.player_id,
          match_id: null, // Not tied to a specific match
          stat_type: 'season_average',
          value: stat
        }, 'statLine', 'NBA');
      }
      
      return {
        teams: teams.length,
        players: teams.reduce((acc, team) => acc + team.players?.length || 0, 0),
        games: games.length,
        playerStats: playerStats.length
      };
    } catch (error) {
      console.error(`Error saving NBA data: ${error.message}`);
      return null;
    }
  }
}

module.exports = BasketballReferenceScraper;
