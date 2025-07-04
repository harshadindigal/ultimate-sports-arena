
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

// Function to create a directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy a file
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
}

// Function to update the server.js file
function updateServerJs() {
  const serverJsPath = path.join(__dirname, 'server.js');
  let content = fs.readFileSync(serverJsPath, 'utf8');
  
  // Replace the routes
  content = content.replace(
    "app.use('/api/sports', require('./routes/sportRoutes'));",
    "app.use('/api/sports', require('./routes/api/sports'));"
  );
  content = content.replace(
    "app.use('/api/questions', require('./routes/questionRoutes'));",
    "app.use('/api/questions', require('./routes/api/questions'));"
  );
  content = content.replace(
    "app.use('/api/games', require('./routes/gameRoutes'));",
    "app.use('/api/games', require('./routes/api/games'));"
  );
  content = content.replace(
    "app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));",
    "app.use('/api/leaderboard', require('./routes/api/leaderboard'));"
  );
  
  // Write the updated content
  fs.writeFileSync(serverJsPath, content);
  console.log('✅ Updated server.js');
}

// Function to copy route files to the api directory
function copyRouteFiles() {
  const routesDir = path.join(__dirname, 'routes');
  const apiDir = path.join(routesDir, 'api');
  
  // Ensure the api directory exists
  ensureDirectoryExists(apiDir);
  
  // Copy route files if they don't exist in the api directory
  const routeFiles = {
    'sportRoutes.js': 'sports.js',
    'questionRoutes.js': 'questions.js',
    'gameRoutes.js': 'games.js',
    'leaderboardRoutes.js': 'leaderboard.js'
  };
  
  for (const [sourceFile, destFile] of Object.entries(routeFiles)) {
    const sourcePath = path.join(routesDir, sourceFile);
    const destPath = path.join(apiDir, destFile);
    
    if (fileExists(sourcePath) && !fileExists(destPath)) {
      copyFile(sourcePath, destPath);
      console.log(`✅ Copied ${sourceFile} to ${destFile}`);
    } else if (!fileExists(sourcePath)) {
      console.log(`❌ Source file does not exist: ${sourceFile}`);
    } else {
      console.log(`ℹ️ Destination file already exists: ${destFile}`);
    }
  }
}

// Main function
function main() {
  console.log('Fixing API routes...');
  updateServerJs();
  copyRouteFiles();
  console.log('Done!');
}

// Run the main function
main();
