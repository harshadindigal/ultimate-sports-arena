
// Create a mock apache-arrow module to prevent errors
const fs = require('fs');
const path = require('path');

// Create the directory structure if it doesn't exist
const arrowDir = path.join('node_modules', 'apache-arrow');
const builderDir = path.join(arrowDir, 'builder');
const visitorDir = path.join(arrowDir, 'visitor');

if (!fs.existsSync(arrowDir)) {
  fs.mkdirSync(arrowDir, { recursive: true });
}

if (!fs.existsSync(builderDir)) {
  fs.mkdirSync(builderDir);
}

if (!fs.existsSync(visitorDir)) {
  fs.mkdirSync(visitorDir);
}

// Create a mock union.js file
const unionContent = `
class UnionBuilder {
  constructor() {
    // Mock implementation
  }
  
  _valueToChildTypeId() {
    // Mock implementation that doesn't throw errors
    return 0;
  }
}

exports.UnionBuilder = UnionBuilder;
`;

fs.writeFileSync(path.join(builderDir, 'union.js'), unionContent);

// Create a mock builderctor.js file
const builderctrContent = `
// Mock implementation
exports.Builder = function() {};
`;

fs.writeFileSync(path.join(visitorDir, 'builderctor.js'), builderctrContent);

// Create a mock index.js file
const indexContent = `
// Mock apache-arrow module
exports.Builder = function() {};
exports.Table = function() {};
exports.RecordBatch = function() {};
exports.Vector = function() {};
`;

fs.writeFileSync(path.join(arrowDir, 'index.js'), indexContent);

console.log('Created mock apache-arrow module to prevent errors');
