
const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Check if all API route files exist
const apiRoutesDir = path.join(__dirname, 'routes', 'api');
const requiredRoutes = ['sports.js', 'questions.js', 'games.js', 'leaderboard.js'];

console.log('Verifying API route files...');
let allRoutesExist = true;

for (const route of requiredRoutes) {
  const routePath = path.join(apiRoutesDir, route);
  if (fileExists(routePath)) {
    console.log(`✅ ${route} exists`);
  } else {
    console.log(`❌ ${route} does not exist`);
    allRoutesExist = false;
  }
}

if (allRoutesExist) {
  console.log('\n✅ All API route files exist');
} else {
  console.log('\n❌ Some API route files are missing');
}

// Check if server.js is using the correct routes
const serverJsPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverJsPath, 'utf8');

console.log('\nVerifying server.js routes...');
const routeChecks = [
  { route: "app.use('/api/sports', require('./routes/api/sports'));", name: 'sports' },
  { route: "app.use('/api/questions', require('./routes/api/questions'));", name: 'questions' },
  { route: "app.use('/api/games', require('./routes/api/games'));", name: 'games' },
  { route: "app.use('/api/leaderboard', require('./routes/api/leaderboard'));", name: 'leaderboard' }
];

let allRoutesCorrect = true;
for (const check of routeChecks) {
  if (serverContent.includes(check.route)) {
    console.log(`✅ ${check.name} route is correctly configured in server.js`);
  } else {
    console.log(`❌ ${check.name} route is not correctly configured in server.js`);
    allRoutesCorrect = false;
  }
}

if (allRoutesCorrect) {
  console.log('\n✅ All routes are correctly configured in server.js');
} else {
  console.log('\n❌ Some routes are not correctly configured in server.js');
}

// Check if server.js is using port 5001
if (serverContent.includes('const PORT = process.env.PORT || 5001;')) {
  console.log('\n✅ Server.js is using port 5001');
} else {
  console.log('\n❌ Server.js is not using port 5001');
}

console.log('\nVerification complete!');
