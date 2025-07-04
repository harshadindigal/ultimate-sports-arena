
const fs = require('fs');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Check if apache-arrow is in the dependencies
if (packageJson.dependencies && packageJson.dependencies['apache-arrow']) {
  console.log('Removing apache-arrow from dependencies...');
  delete packageJson.dependencies['apache-arrow'];
}

// Check if apache-arrow is in the devDependencies
if (packageJson.devDependencies && packageJson.devDependencies['apache-arrow']) {
  console.log('Removing apache-arrow from devDependencies...');
  delete packageJson.devDependencies['apache-arrow'];
}

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('apache-arrow dependency removed from package.json');
