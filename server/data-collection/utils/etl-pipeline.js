
const { elasticClient } = require('../../config/elastic');
const DataNormalizer = require('../utils/data-normalizer');

class ETLPipeline {
  constructor(sport) {
    this.sport = sport;
    this.normalizer = new DataNormalizer();
  }

  // Extract data from source
  async extract(source) {
    throw new Error('Extract method must be implemented by subclass');
  }

  // Transform raw data to normalized format
  async transform(rawData) {
    throw new Error('Transform method must be implemented by subclass');
  }

  // Load normalized data into Elasticsearch
  async load(normalizedData) {
    try {
      // Group data by type
      const dataByType = {};
      
      for (const item of normalizedData) {
        if (!dataByType[item.type]) {
          dataByType[item.type] = [];
        }
        dataByType[item.type].push(item.data);
      }
      
      // Save each type of data
      const results = {};
      
      for (const type in dataByType) {
        const bulkBody = dataByType[type].flatMap(doc => [
          { index: { _index: this.getIndexForType(type) } },
          this.normalizer[`normalize${type.charAt(0).toUpperCase() + type.slice(1)}`](doc, this.sport)
        ]);
        
        const result = await elasticClient.bulk({
          refresh: true,
          body: bulkBody
        });
        
        results[type] = result;
      }
      
      return results;
    } catch (error) {
      console.error(`Error in ETL load phase: ${error.message}`);
      return null;
    }
  }

  // Run the full ETL pipeline
  async run(source) {
    try {
      const rawData = await this.extract(source);
      const normalizedData = await this.transform(rawData);
      return await this.load(normalizedData);
    } catch (error) {
      console.error(`Error running ETL pipeline: ${error.message}`);
      return null;
    }
  }

  // Get the appropriate index for a data type
  getIndexForType(type) {
    switch (type) {
      case 'player':
        return 'players';
      case 'team':
        return 'teams';
      case 'match':
        return 'matches';
      case 'event':
        return 'events';
      case 'season':
        return 'seasons';
      case 'statLine':
        return 'stat_lines';
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }
}

module.exports = ETLPipeline;
