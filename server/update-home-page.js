
const fs = require('fs');
const path = require('path');

// Function to update HomePage
async function updateHomePage() {
  try {
    console.log('Updating HomePage to link to sport detail pages...');
    
    const homePageFile = path.join(__dirname, '..', 'client', 'src', 'pages', 'HomePage.js');
    
    if (!fs.existsSync(homePageFile)) {
      console.log('HomePage file does not exist!');
      return false;
    }
    
    // Read the file content
    let content = fs.readFileSync(homePageFile, 'utf8');
    
    // Add the Link import if it doesn't exist
    if (!content.includes('import { Link }')) {
      if (content.includes('import { Container')) {
        content = content.replace(
          /import { Container/,
          'import { Link } from "react-router-dom";\nimport { Container'
        );
      } else {
        content = content.replace(
          /import React/,
          'import { Link } from "react-router-dom";\nimport React'
        );
      }
    }
    
    // Update the Card to be wrapped in a Link if it's not already
    if (!content.includes('<Link to={`/sports/${sport.id}`}')) {
      content = content.replace(
        /<Card\s+key={index}\s+className="mb-3">/g,
        '<Card key={index} className="mb-3" as={Link} to={`/sports/\${sport.id}`} style={{ textDecoration: "none", color: "inherit" }}>'
      );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(homePageFile, content);
    console.log('Updated HomePage successfully');
    return true;
  } catch (error) {
    console.error(`Error updating HomePage: ${error.message}`);
    return false;
  }
}

// Run the function
updateHomePage().then(result => {
  if (result) {
    console.log('HomePage updated successfully');
  } else {
    console.log('Failed to update HomePage');
  }
});
