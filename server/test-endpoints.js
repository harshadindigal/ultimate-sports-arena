
const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('Testing /api/sports endpoint...');
    const sportsResponse = await axios.get('http://localhost:5000/api/sports');
    console.log('Sports response:', sportsResponse.data);
    
    console.log('\nTesting /api/questions endpoint...');
    const questionsResponse = await axios.get('http://localhost:5000/api/questions');
    console.log('Questions response:', questionsResponse.data);
    
    console.log('\nTesting /api/games endpoint...');
    const gamesResponse = await axios.get('http://localhost:5000/api/games');
    console.log('Games response:', gamesResponse.data);
    
    console.log('\nTesting /api/leaderboard endpoint...');
    const leaderboardResponse = await axios.get('http://localhost:5000/api/leaderboard');
    console.log('Leaderboard response:', leaderboardResponse.data);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints();
