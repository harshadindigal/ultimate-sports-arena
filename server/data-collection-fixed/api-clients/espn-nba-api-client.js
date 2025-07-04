
const BaseApiClient = require('../utils/base-api-client');

class ESPNNBAApiClient extends BaseApiClient {
  constructor() {
    super('https://site.api.espn.com/apis/site/v2/sports/basketball/nba');
  }

  async getTeams() {
    try {
      const data = await this.get('/teams');
      
      if (!data || !data.sports || !data.sports[0] || !data.sports[0].leagues || !data.sports[0].leagues[0] || !data.sports[0].leagues[0].teams) {
        return [];
      }
      
      return data.sports[0].leagues[0].teams.map(team => ({
        id: team.team.id,
        name: team.team.displayName,
        abbreviation: team.team.abbreviation,
        location: team.team.location,
        logo: team.team.logos ? team.team.logos[0].href : null,
        conference: team.team.conferenceId === 1 ? 'Eastern' : 'Western'
      }));
    } catch (error) {
      console.error(`Error getting teams from ESPN: ${error.message}`);
      return [];
    }
  }

  async getSchedule(startDate, endDate) {
    try {
      // Format dates as YYYYMMDD
      const start = startDate.toISOString().split('T')[0].replace(/-/g, '');
      const end = endDate.toISOString().split('T')[0].replace(/-/g, '');
      
      const data = await this.get(`/scoreboard?dates=${start}-${end}`);
      
      if (!data || !data.events) {
        return [];
      }
      
      return data.events.map(event => ({
        id: event.id,
        date: event.date,
        name: event.name,
        shortName: event.shortName,
        status: event.status.type.name,
        homeTeam: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.team.displayName || '',
        awayTeam: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.team.displayName || '',
        homeScore: parseInt(event.competitions[0].competitors.find(c => c.homeAway === 'home')?.score) || 0,
        awayScore: parseInt(event.competitions[0].competitors.find(c => c.homeAway === 'away')?.score) || 0
      }));
    } catch (error) {
      console.error(`Error getting schedule from ESPN: ${error.message}`);
      return [];
    }
  }
}

module.exports = ESPNNBAApiClient;
