
const fs = require('fs');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add a preinstall script to handle apache-arrow issues
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

packageJson.scripts.preinstall = 'node handle-arrow.js';

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Added preinstall script to package.json');
