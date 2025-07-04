
const { elasticClient, testConnection } = require('../config/elastic');
const { initializeIndices } = require('../models/elastic');
const NBAETLPipeline = require('./etl/nba-etl-pipeline');
// Import other ETL pipelines as they are implemented

// Initialize Elasticsearch connection and indices
async function initialize() {
  try {
    // Test Elasticsearch connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to Elasticsearch');
      process.exit(1);
    }
    
    // Initialize indices
    await initializeIndices();
    
    console.log('Initialization complete');
    return true;
  } catch (error) {
    console.error(`Initialization error: ${error.message}`);
    return false;
  }
}

// Run ETL pipelines for all sports
async function runAllETLPipelines() {
  try {
    console.log('Starting all ETL pipelines...');
    
    // Run NBA ETL pipeline
    const nbaETL = new NBAETLPipeline();
    const nbaResults = await nbaETL.runPipeline();
    console.log('NBA ETL pipeline completed:', nbaResults);
    
    // Add other sports ETL pipelines here as they are implemented
    
    console.log('All ETL pipelines completed');
    return true;
  } catch (error) {
    console.error(`ETL pipeline error: ${error.message}`);
    return false;
  }
}

// Schedule data collection jobs
function scheduleJobs() {
  // Daily update job
  const dailyUpdateInterval = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(async () => {
    console.log('Running daily update job...');
    await runAllETLPipelines();
  }, dailyUpdateInterval);
  
  console.log('Data collection jobs scheduled');
}

// Main function
async function main() {
  // Initialize Elasticsearch
  const initialized = await initialize();
  if (!initialized) {
    return;
  }
  
  // Run ETL pipelines
  await runAllETLPipelines();
  
  // Schedule jobs
  scheduleJobs();
}

// Run main function
main().catch(error => {
  console.error(`Main error: ${error.message}`);
  process.exit(1);
});
