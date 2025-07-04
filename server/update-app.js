
const fs = require('fs');
const path = require('path');

// Function to update App.js
async function updateAppJs() {
  try {
    console.log('Updating App.js to include sport detail route...');
    
    const appJsFile = path.join(__dirname, '..', 'client', 'src', 'App.js');
    
    if (!fs.existsSync(appJsFile)) {
      console.log('App.js file does not exist!');
      return false;
    }
    
    // Read the file content
    let content = fs.readFileSync(appJsFile, 'utf8');
    
    // Add the import if it doesn't exist
    if (!content.includes('import SportDetailPage from')) {
      content = content.replace(
        /import React from ['"]react['"];/,
        'import React from "react";\nimport SportDetailPage from "./pages/SportDetailPage";'
      );
    }
    
    // Add the route if it doesn't exist
    if (!content.includes('<Route path="/sports/:id"')) {
      content = content.replace(
        /<Route path="\/" element={<HomePage \/>} \/>/,
        '<Route path="/" element={<HomePage />} />\n          <Route path="/sports/:id" element={<SportDetailPage />} />'
      );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(appJsFile, content);
    console.log('Updated App.js successfully');
    return true;
  } catch (error) {
    console.error(`Error updating App.js: ${error.message}`);
    return false;
  }
}

// Run the function
updateAppJs().then(result => {
  if (result) {
    console.log('App.js updated successfully');
  } else {
    console.log('Failed to update App.js');
  }
});
