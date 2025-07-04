
const axios = require('axios');

// Function to test the endpoints
async function testEndpoints() {
  const baseUrl = 'http://localhost:5001';  // Use port 5001
  const endpoints = [
    '/api/sports',
    '/api/questions',
    '/api/games',
    '/api/leaderboard'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint} endpoint...`);
      const response = await axios.get(`${baseUrl}${endpoint}`);
      results[endpoint] = {
        status: response.status,
        success: true,
        data: response.data
      };
      console.log(`✅ ${endpoint} endpoint returned status ${response.status}`);
      console.log(`Response data: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error) {
      results[endpoint] = {
        status: error.response ? error.response.status : 'unknown',
        success: false,
        error: error.message
      };
      console.error(`❌ ${endpoint} endpoint failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  
  // Output the results
  console.log('\n--- TEST RESULTS ---');
  for (const [endpoint, result] of Object.entries(results)) {
    console.log(`${endpoint}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'} (Status: ${result.status})`);
  }
}

// Export the test function
module.exports = { testEndpoints };
