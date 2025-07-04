
const { elasticClient } = require('./config/elastic');

// Test Elasticsearch indices and queries
async function testElasticsearch() {
  try {
    console.log('Testing Elasticsearch connection...');
    const info = await elasticClient.info();
    console.log(`Connected to Elasticsearch: ${info.name}`);
    
    // Test indices
    console.log('Testing indices...');
    const indices = await elasticClient.indices.get({
      index: '_all'
    });
    console.log('Available indices:', Object.keys(indices));
    
    // Test basic search query
    console.log('Testing search query...');
    const searchResult = await elasticClient.search({
      index: 'sports',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    console.log(`Search returned ${searchResult.hits.total.value} results`);
    
    // Test more complex query
    console.log('Testing complex query...');
    const complexResult = await elasticClient.search({
      index: 'questions',
      body: {
        query: {
          bool: {
            must: [
              { term: { difficulty: 'medium' } }
            ],
            should: [
              { match: { text: 'NBA' } }
            ]
          }
        },
        size: 5
      }
    });
    
    console.log(`Complex query returned ${complexResult.hits.total.value} results`);
    
    console.log('Elasticsearch tests completed successfully');
  } catch (error) {
    console.error('Elasticsearch test failed:', error);
  }
}

// Run the test
testElasticsearch().catch(console.error);
