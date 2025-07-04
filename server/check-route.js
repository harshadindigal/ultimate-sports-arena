
const fs = require('fs');
const path = require('path');

// Check if the sport detail route exists
const sportDetailRouteFile = path.join(__dirname, 'routes', 'api', 'sports.js');

if (fs.existsSync(sportDetailRouteFile)) {
  const content = fs.readFileSync(sportDetailRouteFile, 'utf8');
  
  if (content.includes('router.get('/:id'')) {
    console.log('Sport detail route exists');
  } else {
    console.log('Sport detail route does not exist');
  }
} else {
  console.log('Sports API route file does not exist');
}
