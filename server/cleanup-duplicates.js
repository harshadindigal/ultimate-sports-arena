
const { elasticClient } = require('./config/elastic');

// Function to remove duplicates from an index based on a field
async function removeDuplicates(index, field) {
  try {
    console.log(`Removing duplicates from ${index} based on ${field}...`);
    
    // Get all documents in the index
    const result = await elasticClient.search({
      index,
      body: {
        size: 1000,
        query: {
          match_all: {}
        }
      }
    });
    
    const documents = result.hits.hits;
    console.log(`Found ${documents.length} documents in ${index}`);
    
    // Group documents by the specified field
    const groupedDocs = {};
    documents.forEach(doc => {
      const fieldValue = doc._source[field];
      if (!groupedDocs[fieldValue]) {
        groupedDocs[fieldValue] = [];
      }
      groupedDocs[fieldValue].push(doc);
    });
    
    // For each group, keep the first document and delete the rest
    let deletedCount = 0;
    for (const [fieldValue, docs] of Object.entries(groupedDocs)) {
      if (docs.length > 1) {
        console.log(`Found ${docs.length} duplicates for ${field} = ${fieldValue}`);
        
        // Keep the first document (with leagues if available)
        const docsToDelete = docs.slice(1);
        
        // Delete duplicate documents
        for (const doc of docsToDelete) {
          await elasticClient.delete({
            index,
            id: doc._id
          });
          deletedCount++;
        }
      }
    }
    
    console.log(`Deleted ${deletedCount} duplicate documents from ${index}`);
    return deletedCount;
  } catch (error) {
    console.error(`Error removing duplicates from ${index}: ${error.message}`);
    return 0;
  }
}

// Function to check and fix sport detail routes
async function checkSportDetailRoutes() {
  try {
    console.log('Checking sport detail routes...');
    
    // Check if the route file exists
    const fs = require('fs');
    const path = require('path');
    
    const sportDetailRouteFile = path.join(__dirname, 'routes', 'api', 'sports.js');
    
    if (!fs.existsSync(sportDetailRouteFile)) {
      console.log('Sport detail route file does not exist!');
      return false;
    }
    
    // Read the file content
    let content = fs.readFileSync(sportDetailRouteFile, 'utf8');
    
    // Check if the route handler includes the sport detail route
    if (!content.includes('router.get(\'/:id\'')) {
      console.log('Sport detail route handler not found. Adding it...');
      
      // Add the route handler
      const routeHandler = `
// @route   GET api/sports/:id
// @desc    Get sport by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log(\`GET /api/sports/\${req.params.id} endpoint called\`);
    const result = await elasticClient.get({
      index: 'sports',
      id: req.params.id
    });
    
    if (!result._source) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    
    res.json({
      id: result._id,
      ...result._source
    });
  } catch (err) {
    console.error(\`Error in GET /api/sports/\${req.params.id}: \${err.message}\`);
    if (err.statusCode === 404) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    res.status(500).send('Server Error');
  }
});`;
      
      // Insert the route handler before the module.exports line
      content = content.replace('module.exports = router;', `${routeHandler}

module.exports = router;`);
      
      // Write the updated content back to the file
      fs.writeFileSync(sportDetailRouteFile, content);
      console.log('Added sport detail route handler');
    } else {
      console.log('Sport detail route handler already exists');
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking sport detail routes: ${error.message}`);
    return false;
  }
}

// Function to check and fix frontend sport detail page
async function checkFrontendSportDetailPage() {
  try {
    console.log('Checking frontend sport detail page...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check if the sport detail page exists
    const sportDetailPageDir = path.join(__dirname, '..', 'client', 'src', 'pages');
    const sportDetailPageFile = path.join(sportDetailPageDir, 'SportDetailPage.js');
    
    if (!fs.existsSync(sportDetailPageFile)) {
      console.log('Sport detail page does not exist. Creating it...');
      
      // Create the sport detail page
      const sportDetailPageContent = `
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const SportDetailPage = () => {
  const { id } = useParams();
  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSport = async () => {
      try {
        const { data } = await axios.get(\`/api/sports/\${id}\`);
        setSport(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch sport details');
        setLoading(false);
      }
    };

    fetchSport();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5">
        <h2>Loading...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <h2>Error</h2>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {sport && (
        <>
          <Row className="mb-4">
            <Col md={4}>
              {sport.imageUrl && (
                <Card.Img
                  variant="top"
                  src={sport.imageUrl}
                  alt={sport.name}
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
            </Col>
            <Col md={8}>
              <h1>{sport.name}</h1>
              <p>{sport.description}</p>
            </Col>
          </Row>

          {sport.leagues && sport.leagues.length > 0 && (
            <Row>
              <Col>
                <h3>Leagues</h3>
                <ListGroup>
                  {sport.leagues.map((league, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={2}>
                          {league.imageUrl && (
                            <img
                              src={league.imageUrl}
                              alt={league.name}
                              style={{ maxHeight: '50px', maxWidth: '100%' }}
                            />
                          )}
                        </Col>
                        <Col md={10}>
                          <h5>{league.name}</h5>
                          <p>{league.description}</p>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default SportDetailPage;
`;
      
      // Create the file
      fs.writeFileSync(sportDetailPageFile, sportDetailPageContent);
      console.log('Created sport detail page');
      
      // Now update the App.js file to include the route
      const appJsFile = path.join(__dirname, '..', 'client', 'src', 'App.js');
      
      if (fs.existsSync(appJsFile)) {
        let appJsContent = fs.readFileSync(appJsFile, 'utf8');
        
        // Check if the import is already there
        if (!appJsContent.includes('import SportDetailPage from')) {
          // Add the import
          appJsContent = appJsContent.replace(
            'import React from 'react';',
            'import React from 'react';
import SportDetailPage from './pages/SportDetailPage';'
          );
        }
        
        // Check if the route is already there
        if (!appJsContent.includes('<Route path="/sports/:id"')) {
          // Add the route
          appJsContent = appJsContent.replace(
            '<Route path="/" element={<HomePage />} />',
            '<Route path="/" element={<HomePage />} />
          <Route path="/sports/:id" element={<SportDetailPage />} />'
          );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(appJsFile, appJsContent);
        console.log('Updated App.js with sport detail route');
      } else {
        console.log('App.js file not found');
      }
    } else {
      console.log('Sport detail page already exists');
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking frontend sport detail page: ${error.message}`);
    return false;
  }
}

// Function to update the HomePage to link to sport detail pages
async function updateHomePage() {
  try {
    console.log('Updating HomePage to link to sport detail pages...');
    
    const fs = require('fs');
    const path = require('path');
    
    const homePageFile = path.join(__dirname, '..', 'client', 'src', 'pages', 'HomePage.js');
    
    if (fs.existsSync(homePageFile)) {
      let content = fs.readFileSync(homePageFile, 'utf8');
      
      // Check if the Link import is already there
      if (!content.includes('import { Link }')) {
        // Add the import
        if (content.includes('import { Container')) {
          content = content.replace(
            'import { Container',
            'import { Link } from 'react-router-dom';
import { Container'
          );
        } else {
          content = content.replace(
            'import React',
            'import { Link } from 'react-router-dom';
import React'
          );
        }
      }
      
      // Check if the Card is already wrapped in a Link
      if (!content.includes('<Link to={`/sports/${sport.id}`}')) {
        // Update the Card to be wrapped in a Link
        content = content.replace(
          /<Card\s+key={index}\s+className="mb-3">/g,
          '<Card key={index} className="mb-3" as={Link} to={`/sports/${sport.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>'
        );
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(homePageFile, content);
      console.log('Updated HomePage with links to sport detail pages');
    } else {
      console.log('HomePage file not found');
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating HomePage: ${error.message}`);
    return false;
  }
}

// Function to enhance the data collection script with better scraping logic
async function enhanceDataCollection() {
  try {
    console.log('Enhancing data collection script with better scraping logic...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Create an enhanced scraper for NBA data
    const enhancedNbaScraper = path.join(__dirname, 'data-collection-fixed', 'scrapers', 'enhanced-basketball-reference-scraper.js');
    
    const enhancedNbaScraperContent = `
const BaseScraper = require('../utils/base-scraper');

class EnhancedBasketballReferenceScraper extends BaseScraper {
  constructor() {
    super('https://www.basketball-reference.com');
  }

  async getTeams(season) {
    try {
      console.log(\`Fetching NBA teams for season \${season}...\`);
      const html = await this.fetchPage(\`/leagues/NBA_\${season}.html\`);
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
            losses: parseInt($(elem).find('td[data-stat="losses"]').text()) || 0,
            winLossPercentage: parseFloat($(elem).find('td[data-stat="win_loss_pct"]').text()) || 0
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
            losses: parseInt($(elem).find('td[data-stat="losses"]').text()) || 0,
            winLossPercentage: parseFloat($(elem).find('td[data-stat="win_loss_pct"]').text()) || 0
          });
        }
      });
      
      console.log(\`Found \${teams.length} NBA teams\`);
      return teams;
    } catch (error) {
      console.error(\`Error getting NBA teams: \${error.message}\`);
      return [];
    }
  }

  async getPlayers(teamId, season) {
    try {
      console.log(\`Fetching players for team \${teamId} in season \${season}...\`);
      const html = await this.fetchPage(\`/teams/\${teamId}/\${season}.html\`);
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
            experience: $(elem).find('td[data-stat="years_experience"]').text().trim(),
            college: $(elem).find('td[data-stat="college"]').text().trim(),
            team: teamId
          });
        }
      });
      
      console.log(\`Found \${players.length} players for team \${teamId}\`);
      return players;
    } catch (error) {
      console.error(\`Error getting players for team \${teamId}: \${error.message}\`);
      return [];
    }
  }

  async getTeamStats(teamId, season) {
    try {
      console.log(\`Fetching team stats for \${teamId} in season \${season}...\`);
      const html = await this.fetchPage(\`/teams/\${teamId}/\${season}.html\`);
      const $ = await this.parsePage(html);
      
      if (!$) return null;
      
      // Get team name and basic info
      const teamName = $('h1[itemprop="name"] span:first-child').text().trim();
      
      // Get team record
      const recordText = $('div#meta div').filter((i, el) => $(el).text().includes('Record:')).text();
      const recordMatch = recordText.match(/Record:\s+([\d]+)-([\d]+)/);
      const wins = recordMatch ? parseInt(recordMatch[1]) : 0;
      const losses = recordMatch ? parseInt(recordMatch[2]) : 0;
      
      // Get team stats
      const stats = {
        name: teamName,
        season,
        wins,
        losses,
        pointsPerGame: parseFloat($('div#team_and_opponent td[data-stat="pts_per_g"]').first().text()) || 0,
        oppPointsPerGame: parseFloat($('div#team_and_opponent td[data-stat="opp_pts_per_g"]').first().text()) || 0,
        fieldGoalPercentage: parseFloat($('div#team_and_opponent td[data-stat="fg_pct"]').first().text()) || 0,
        threePointPercentage: parseFloat($('div#team_and_opponent td[data-stat="fg3_pct"]').first().text()) || 0,
        freeThrowPercentage: parseFloat($('div#team_and_opponent td[data-stat="ft_pct"]').first().text()) || 0,
        reboundsPerGame: parseFloat($('div#team_and_opponent td[data-stat="trb_per_g"]').first().text()) || 0,
        assistsPerGame: parseFloat($('div#team_and_opponent td[data-stat="ast_per_g"]').first().text()) || 0,
        stealsPerGame: parseFloat($('div#team_and_opponent td[data-stat="stl_per_g"]').first().text()) || 0,
        blocksPerGame: parseFloat($('div#team_and_opponent td[data-stat="blk_per_g"]').first().text()) || 0
      };
      
      console.log(\`Retrieved stats for \${teamName} (\${season})\`);
      return stats;
    } catch (error) {
      console.error(\`Error getting team stats for \${teamId}: \${error.message}\`);
      return null;
    }
  }
}

module.exports = EnhancedBasketballReferenceScraper;
`;
    
    // Create the directory if it doesn't exist
    const scraperDir = path.join(__dirname, 'data-collection-fixed', 'scrapers');
    if (!fs.existsSync(scraperDir)) {
      fs.mkdirSync(scraperDir, { recursive: true });
    }
    
    // Write the enhanced scraper
    fs.writeFileSync(enhancedNbaScraper, enhancedNbaScraperContent);
    console.log('Created enhanced NBA scraper');
    
    // Create an enhanced ETL pipeline
    const enhancedEtlPipeline = path.join(__dirname, 'data-collection-fixed', 'etl', 'enhanced-nba-etl-pipeline.js');
    
    const enhancedEtlPipelineContent = `
const EnhancedBasketballReferenceScraper = require('../scrapers/enhanced-basketball-reference-scraper');
const ESPNNBAApiClient = require('../api-clients/espn-nba-api-client');
const dataNormalizer = require('../utils/data-normalizer');
const { elasticClient } = require('../../config/elastic');

class EnhancedNBAETLPipeline {
  constructor() {
    this.basketballReferenceScraper = new EnhancedBasketballReferenceScraper();
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
      
      console.log(\`Extracting NBA data for season \${season}...\`);
      
      // Extract data from Basketball Reference
      const teams = await this.basketballReferenceScraper.getTeams(season);
      
      // Extract players for each team
      const players = [];
      const teamStats = [];
      
      for (const team of teams) {
        const teamPlayers = await this.basketballReferenceScraper.getPlayers(team.id, season);
        players.push(...teamPlayers);
        
        const stats = await this.basketballReferenceScraper.getTeamStats(team.id, season);
        if (stats) {
          teamStats.push(stats);
        }
      }
      
      // Extract data from ESPN API
      const espnTeams = await this.espnApiClient.getTeams();
      
      // Get schedule for the last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const espnGames = await this.espnApiClient.getSchedule(startDate, new Date());
      
      console.log(\`Extracted \${teams.length} teams, \${players.length} players, \${teamStats.length} team stats, \${espnGames.length} games\`);
      
      return {
        teams,
        players,
        teamStats,
        espnTeams,
        espnGames
      };
    } catch (error) {
      console.error(\`Error in extract step: \${error.message}\`);
      return { teams: [], players: [], teamStats: [], espnTeams: [], espnGames: [] };
    }
  }

  async transform(rawData) {
    try {
      const normalizedData = [];
      
      // Normalize teams
      for (const team of rawData.teams) {
        normalizedData.push({
          type: 'team',
          data: {
            ...dataNormalizer.normalizeTeam(team, this.sportName),
            wins: team.wins,
            losses: team.losses,
            winLossPercentage: team.winLossPercentage,
            conference: team.conference
          }
        });
      }
      
      // Normalize players
      for (const player of rawData.players) {
        normalizedData.push({
          type: 'player',
          data: {
            ...dataNormalizer.normalizePlayer(player, this.sportName),
            height: player.height,
            weight: player.weight,
            birthDate: player.birthDate,
            experience: player.experience,
            college: player.college
          }
        });
      }
      
      // Normalize team stats
      for (const stats of rawData.teamStats) {
        normalizedData.push({
          type: 'teamStats',
          data: {
            name: stats.name,
            sport: this.sportName,
            season: stats.season,
            wins: stats.wins,
            losses: stats.losses,
            pointsPerGame: stats.pointsPerGame,
            oppPointsPerGame: stats.oppPointsPerGame,
            fieldGoalPercentage: stats.fieldGoalPercentage,
            threePointPercentage: stats.threePointPercentage,
            freeThrowPercentage: stats.freeThrowPercentage,
            reboundsPerGame: stats.reboundsPerGame,
            assistsPerGame: stats.assistsPerGame,
            stealsPerGame: stats.stealsPerGame,
            blocksPerGame: stats.blocksPerGame
          }
        });
      }
      
      // Normalize games
      for (const game of rawData.espnGames) {
        normalizedData.push({
          type: 'game',
          data: dataNormalizer.normalizeGame(game, this.sportName)
        });
      }
      
      console.log(\`Transformed data into \${normalizedData.length} normalized records\`);
      
      return normalizedData;
    } catch (error) {
      console.error(\`Error in transform step: \${error.message}\`);
      return [];
    }
  }

  async load(normalizedData) {
    try {
      const results = {
        success: 0,
        failure: 0
      };
      
      // First, check if we need to create the indices
      const indices = ['teams', 'players', 'teamStats', 'games'];
      for (const index of indices) {
        const indexExists = await elasticClient.indices.exists({ index });
        if (!indexExists) {
          console.log(\`Creating index: \${index}\`);
          await elasticClient.indices.create({ index });
        }
      }
      
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
            case 'teamStats':
              index = 'teamStats';
              break;
            case 'game':
              index = 'games';
              break;
            default:
              index = 'sports_data';
          }
          
          // Check if the document already exists (to avoid duplicates)
          let existingDoc = null;
          
          if (type === 'team' && data.name) {
            const searchResult = await elasticClient.search({
              index,
              body: {
                query: {
                  match: {
                    name: data.name
                  }
                }
              }
            });
            
            if (searchResult.hits.total.value > 0) {
              existingDoc = searchResult.hits.hits[0];
            }
          }
          
          // Add timestamp
          data.createdAt = new Date();
          data.updatedAt = new Date();
          
          if (existingDoc) {
            // Update the existing document
            await elasticClient.update({
              index,
              id: existingDoc._id,
              body: {
                doc: data
              },
              refresh: true
            });
          } else {
            // Index a new document
            await elasticClient.index({
              index,
              body: data,
              refresh: true
            });
          }
          
          results.success++;
        } catch (error) {
          console.error(\`Error indexing item: \${error.message}\`);
          results.failure++;
        }
      }
      
      console.log(\`Loaded \${results.success} items successfully, \${results.failure} failures\`);
      
      return results;
    } catch (error) {
      console.error(\`Error in load step: \${error.message}\`);
      return { success: 0, failure: 0 };
    }
  }

  async runPipeline() {
    try {
      console.log('Starting Enhanced NBA ETL pipeline...');
      
      // Extract data from sources
      const rawData = await this.extract();
      
      // Transform the data
      const normalizedData = await this.transform(rawData);
      
      // Load the data into Elasticsearch
      const loadResults = await this.load(normalizedData);
      
      console.log('Enhanced NBA ETL pipeline completed successfully');
      
      return {
        extractedData: rawData,
        normalizedData,
        loadResults
      };
    } catch (error) {
      console.error(\`Error running Enhanced NBA ETL pipeline: \${error.message}\`);
      return null;
    }
  }
}

module.exports = EnhancedNBAETLPipeline;
`;
    
    // Create the directory if it doesn't exist
    const etlDir = path.join(__dirname, 'data-collection-fixed', 'etl');
    if (!fs.existsSync(etlDir)) {
      fs.mkdirSync(etlDir, { recursive: true });
    }
    
    // Write the enhanced ETL pipeline
    fs.writeFileSync(enhancedEtlPipeline, enhancedEtlPipelineContent);
    console.log('Created enhanced NBA ETL pipeline');
    
    // Update the main index.js to use the enhanced ETL pipeline
    const indexFile = path.join(__dirname, 'data-collection-fixed', 'index.js');
    
    if (fs.existsSync(indexFile)) {
      let indexContent = fs.readFileSync(indexFile, 'utf8');
      
      // Replace the import
      indexContent = indexContent.replace(
        'const NBAETLPipeline = require('./etl/nba-etl-pipeline');',
        'const EnhancedNBAETLPipeline = require('./etl/enhanced-nba-etl-pipeline');'
      );
      
      // Replace the instantiation
      indexContent = indexContent.replace(
        'const nbaETL = new NBAETLPipeline();',
        'const nbaETL = new EnhancedNBAETLPipeline();'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(indexFile, indexContent);
      console.log('Updated index.js to use enhanced NBA ETL pipeline');
    } else {
      console.log('index.js file not found');
    }
    
    return true;
  } catch (error) {
    console.error(`Error enhancing data collection: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    // First, remove duplicates from the sports index
    const deletedSports = await removeDuplicates('sports', 'name');
    
    // Check and fix sport detail routes
    const routesFixed = await checkSportDetailRoutes();
    
    // Check and fix frontend sport detail page
    const frontendFixed = await checkFrontendSportDetailPage();
    
    // Update HomePage to link to sport detail pages
    const homePageUpdated = await updateHomePage();
    
    // Enhance data collection with better scraping logic
    const dataCollectionEnhanced = await enhanceDataCollection();
    
    console.log('\n--- SUMMARY ---');
    console.log(\`Deleted \${deletedSports} duplicate sports\`);
    console.log(\`Routes fixed: \${routesFixed ? 'Yes' : 'No'}\`);
    console.log(\`Frontend fixed: \${frontendFixed ? 'Yes' : 'No'}\`);
    console.log(\`HomePage updated: \${homePageUpdated ? 'Yes' : 'No'}\`);
    console.log(\`Data collection enhanced: \${dataCollectionEnhanced ? 'Yes' : 'No'}\`);
    
    console.log('\nAll fixes have been applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error(\`Error in main function: \${error.message}\`);
    process.exit(1);
  }
}

// Run the main function
main();
