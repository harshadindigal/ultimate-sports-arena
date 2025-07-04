const { Client } = require('@elastic/elasticsearch');

// Create Elasticsearch client
const elasticClient = new Client({
  node: 'https://my-elasticsearch-project-e8bfe3.es.us-east-1.aws.elastic.cloud:443',
  auth: {
    apiKey: 'MUs5RHpKY0I2RHpaekNzTTlBWnU6eGdVRFpDRXBiN3NhMm9ZZXRxTG5uQQ=='
  },
  tls: {
    rejectUnauthorized: false // Only for development, remove in production
  }
});

// Test connection
const testConnection = async () => {
  try {
    const info = await elasticClient.info();
    console.log(`Elasticsearch Connected: ${info.name}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

module.exports = {
  elasticClient,
  testConnection
};
