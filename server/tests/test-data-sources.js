
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logger
const logFile = path.join(logsDir, 'data-source-test.log');
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(message);
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = error ? `${message}: ${error.message}\n${error.stack}` : message;
    const logMessage = `[${timestamp}] ERROR: ${errorMessage}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.error(message, error);
  }
};

// Test data sources
async function testDataSources() {
  logger.log('Starting data sources test...');
  
  const sources = [
    { name: 'Basketball-Reference', url: 'https://www.basketball-reference.com', type: 'scraping' },
    { name: 'ESPN NBA API', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams', type: 'api' },
    { name: 'Pro-Football-Reference', url: 'https://www.pro-football-reference.com', type: 'scraping' },
    { name: 'Baseball-Reference', url: 'https://www.baseball-reference.com', type: 'scraping' },
    { name: 'FBref', url: 'https://fbref.com', type: 'scraping' },
    { name: 'Ergast API', url: 'http://ergast.com/api/f1/current/last.json', type: 'api' }
  ];
  
  const results = {
    success: [],
    failure: []
  };
  
  for (const source of sources) {
    try {
      logger.log(`Testing ${source.name} (${source.url})...`);
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        if (source.type === 'scraping') {
          const $ = cheerio.load(response.data);
          const title = $('title').text();
          logger.log(`Successfully accessed ${source.name}: ${title}`);
        } else {
          logger.log(`Successfully accessed ${source.name} API`);
        }
        results.success.push(source.name);
      } else {
        logger.error(`Failed to access ${source.name}: Status ${response.status}`);
        results.failure.push(source.name);
      }
    } catch (error) {
      logger.error(`Error accessing ${source.name}`, error);
      results.failure.push(source.name);
    }
  }
  
  logger.log('Data sources test completed');
  logger.log(`Successful: ${results.success.join(', ')}`);
  logger.log(`Failed: ${results.failure.join(', ')}`);
  
  return results;
}

// Run the test
testDataSources().catch(error => {
  logger.error('Unhandled error in test script', error);
});
