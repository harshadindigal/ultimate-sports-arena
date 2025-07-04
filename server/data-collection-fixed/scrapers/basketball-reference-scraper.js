
const BaseScraper = require('../utils/base-scraper');

class BasketballReferenceScraper extends BaseScraper {
  constructor() {
    super('https://www.basketball-reference.com');
  }

  async getTeams(season) {
    try {
      const html = await this.fetchPage(`/leagues/NBA_${season}.html`);
      const $ = await this.parsePage(html);
      
      if (!$) return [];
      
      const teams = [];
      
      // Extract Eastern Conference teams
      $('#divs_standings_E table tbody tr').each((i, elem) => {
        const name = $(elem).find('th a').text().trim();
        const id = $(elem).find('th a').attr('href')?.split('/')[2] || '';
        
        if (name) {
          teams.push({
            id,
            name,
            conference: 'Eastern',
            wins: parseInt($(elem).find('td[data-stat="wins"]').text()) || 0,
            losses: parseInt($(elem).find('td[data-stat="losses"]').text()) || 0
          });
        }
      });
      
      // Extract Western Conference teams
      $('#divs_standings_W table tbody tr').each((i, elem) => {
        const name = $(elem).find('th a').text().trim();
        const id = $(elem).find('th a').attr('href')?.split('/')[2] || '';
        
        if (name) {
          teams.push({
            id,
            name,
            conference: 'Western',
            wins: parseInt($(elem).find('td[data-stat="wins"]').text()) || 0,
            losses: parseInt($(elem).find('td[data-stat="losses"]').text()) || 0
          });
        }
      });
      
      return teams;
    } catch (error) {
      console.error(`Error getting teams: ${error.message}`);
      return [];
    }
  }

  async getPlayers(teamId, season) {
    try {
      const html = await this.fetchPage(`/teams/${teamId}/${season}.html`);
      const $ = await this.parsePage(html);
      
      if (!$) return [];
      
      const players = [];
      
      $('#roster tbody tr').each((i, elem) => {
        const name = $(elem).find('td[data-stat="player"] a').text().trim();
        const id = $(elem).find('td[data-stat="player"] a').attr('href')?.split('/')[3]?.replace('.html', '') || '';
        
        if (name) {
          players.push({
            id,
            name,
            position: $(elem).find('td[data-stat="pos"]').text().trim(),
            height: $(elem).find('td[data-stat="height"]').text().trim(),
            weight: $(elem).find('td[data-stat="weight"]').text().trim(),
            birthDate: $(elem).find('td[data-stat="birth_date"]').text().trim(),
            team: teamId
          });
        }
      });
      
      return players;
    } catch (error) {
      console.error(`Error getting players: ${error.message}`);
      return [];
    }
  }
}

module.exports = BasketballReferenceScraper;
