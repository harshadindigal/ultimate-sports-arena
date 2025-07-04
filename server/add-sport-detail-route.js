
const fs = require('fs');
const path = require('path');

// Function to add sport detail route handler
async function addSportDetailRoute() {
  try {
    console.log('Adding sport detail route handler...');
    
    const sportDetailRouteFile = path.join(__dirname, 'routes', 'api', 'sports.js');
    
    if (!fs.existsSync(sportDetailRouteFile)) {
      console.log('Sport detail route file does not exist!');
      return false;
    }
    
    // Read the file content
    let content = fs.readFileSync(sportDetailRouteFile, 'utf8');
    
    // Check if the route handler includes the sport detail route
    if (!content.includes('router.get('/:id'')) {
      console.log('Sport detail route handler not found. Adding it...');
      
      // Add the route handler
      const routeHandler = `
// @route   GET api/sports/:id
// @desc    Get sport by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log(\`GET /api/sports/\${req.params.id} endpoint called\`);
    const result = await elasticClient.get({
      index: 'sports',
      id: req.params.id
    });
    
    if (!result._source) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    
    res.json({
      id: result._id,
      ...result._source
    });
  } catch (err) {
    console.error(\`Error in GET /api/sports/\${req.params.id}: \${err.message}\`);
    if (err.statusCode === 404) {
      return res.status(404).json({ msg: 'Sport not found' });
    }
    res.status(500).send('Server Error');
  }
});`;
      
      // Insert the route handler before the module.exports line
      content = content.replace('module.exports = router;', `${routeHandler}\n\nmodule.exports = router;`);
      
      // Write the updated content back to the file
      fs.writeFileSync(sportDetailRouteFile, content);
      console.log('Added sport detail route handler');
      return true;
    } else {
      console.log('Sport detail route handler already exists');
      return true;
    }
  } catch (error) {
    console.error(`Error adding sport detail route: ${error.message}`);
    return false;
  }
}

// Run the function
addSportDetailRoute().then(result => {
  if (result) {
    console.log('Sport detail route added successfully');
  } else {
    console.log('Failed to add sport detail route');
  }
});
