
const { elasticClient, testConnection } = require('../config/elastic');
const { initializeIndices } = require('../models/elastic');
const NBAETLPipeline = require('./etl/nba-etl-pipeline');

async function runDataCollection() {
  try {
    console.log('Starting data collection process...');
    
    // Test Elasticsearch connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to Elasticsearch');
      process.exit(1);
    }
    
    console.log('Connected to Elasticsearch');
    
    // Initialize indices if they don't exist
    await initializeIndices();
    console.log('Indices initialized');
    
    // Run the NBA ETL pipeline
    const nbaETL = new NBAETLPipeline();
    const result = await nbaETL.runPipeline();
    
    if (result) {
      console.log('Data collection completed successfully');
    } else {
      console.error('Data collection failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error in data collection process:', error);
    process.exit(1);
  }
}

// Run the data collection
runDataCollection();
