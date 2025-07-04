
const BaseApiClient = require('../utils/base-api-client');
const DataNormalizer = require('../utils/data-normalizer');

class ESPNNBAApiClient extends BaseApiClient {
  constructor() {
    super('https://site.api.espn.com/apis/site/v2/sports/basketball/nba');
    this.normalizer = new DataNormalizer();
  }

  // Get teams data
  async getTeams() {
    try {
      const data = await this.fetchData('/teams');
      
      if (!data || !data.sports || !data.sports[0] || !data.sports[0].leagues || !data.sports[0].leagues[0] || !data.sports[0].leagues[0].teams) {
        return [];
      }
      
      const teams = data.sports[0].leagues[0].teams.map(team => ({
        name: team.team.displayName,
        id: team.team.id,
        abbreviation: team.team.abbreviation,
        location: team.team.location,
        league: 'NBA',
        conference: team.team.conferenceId === '1' ? 'Eastern' : 'Western',
        seasonStats: {}
      }));
      
      return teams;
    } catch (error) {
      console.error(`Error getting NBA teams from ESPN API: ${error.message}`);
      return [];
    }
  }

  // Get schedule data for a specific date range
  async getSchedule(startDate, endDate) {
    try {
      const data = await this.fetchData('/scoreboard', {
        dates: this.formatDateRange(startDate, endDate),
        limit: 100
      });
      
      if (!data || !data.events) {
        return [];
      }
      
      const games = data.events.map(event => {
        const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
        const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
        
        return {
          id: event.id,
          date: new Date(event.date),
          season: this.getSeason(event.date),
          homeTeam: homeTeam ? homeTeam.team.displayName : null,
          awayTeam: awayTeam ? awayTeam.team.displayName : null,
          homeScore: homeTeam && homeTeam.score ? parseInt(homeTeam.score, 10) : null,
          awayScore: awayTeam && awayTeam.score ? parseInt(awayTeam.score, 10) : null,
          status: event.status.type.name,
          venue: event.competitions[0].venue ? event.competitions[0].venue.fullName : null,
          participants: [
            homeTeam ? homeTeam.team.displayName : null,
            awayTeam ? awayTeam.team.displayName : null
          ].filter(Boolean),
          stats: {}
        };
      });
      
      return games;
    } catch (error) {
      console.error(`Error getting NBA schedule from ESPN API: ${error.message}`);
      return [];
    }
  }

  // Get news data
  async getNews() {
    try {
      const data = await this.fetchData('/news');
      
      if (!data || !data.articles) {
        return [];
      }
      
      const news = data.articles.map(article => ({
        headline: article.headline,
        description: article.description,
        published: new Date(article.published),
        url: article.links.web.href,
        images: article.images
      }));
      
      return news;
    } catch (error) {
      console.error(`Error getting NBA news from ESPN API: ${error.message}`);
      return [];
    }
  }

  // Helper method to format date range for API
  formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0].replace(/-/g, ''));
    }
    
    return dates.join(',');
  }

  // Helper method to determine NBA season from date
  getSeason(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    // NBA season spans two years, typically October to June
    if (month >= 10) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  // Save NBA data from ESPN API
  async saveNBAData(startDate = new Date(), days = 7) {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      // Get and save teams
      const teams = await this.getTeams();
      for (const team of teams) {
        await this.normalizer.saveNormalizedData(team, 'team', 'NBA');
      }
      
      // Get and save schedule/games
      const games = await this.getSchedule(startDate, endDate);
      for (const game of games) {
        if (game.status === 'STATUS_FINAL') {
          // Only save completed games
          await this.normalizer.saveNormalizedData({
            date: game.date,
            score: `${game.homeScore}-${game.awayScore}`,
            participants: game.participants,
            stats: {
              homeScore: game.homeScore,
              awayScore: game.awayScore,
              venue: game.venue
            },
            event: 'Regular Season',
            season: game.season
          }, 'match', 'NBA');
        }
      }
      
      return {
        teams: teams.length,
        games: games.filter(g => g.status === 'STATUS_FINAL').length
      };
    } catch (error) {
      console.error(`Error saving NBA data from ESPN API: ${error.message}`);
      return null;
    }
  }
}

module.exports = ESPNNBAApiClient;
