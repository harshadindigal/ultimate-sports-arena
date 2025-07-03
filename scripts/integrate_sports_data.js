// Data integration script for Ultimate Sports Arena
const fs = require('fs');
const path = require('path');

// Function to load JSON data from a file
function loadJsonData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return null;
  }
}

// Function to transform NBA teams data into our format
function transformNbaData(nbaData) {
  if (!nbaData || !nbaData.data) return [];
  
  return nbaData.data.map(team => ({
    name: team.full_name,
    abbreviation: team.abbreviation,
    city: team.city,
    conference: team.conference,
    division: team.division
  }));
}

// Function to transform soccer leagues data into our format
function transformSoccerData(soccerData) {
  if (!soccerData || !soccerData.competitions) return [];
  
  return soccerData.competitions.map(league => ({
    name: league.name,
    code: league.code,
    type: league.type,
    emblem: league.emblem
  }));
}

// Function to transform F1 constructors data into our format
function transformF1Data(f1Data) {
  if (!f1Data || !f1Data.MRData || !f1Data.MRData.ConstructorTable || !f1Data.MRData.ConstructorTable.Constructors) return [];
  
  return f1Data.MRData.ConstructorTable.Constructors.map(constructor => ({
    name: constructor.name,
    nationality: constructor.nationality,
    wikiUrl: constructor.url
  }));
}

// Main function to integrate data
async function integrateData() {
  console.log('Starting data integration...');
  
  // Define paths to data files
  const dataDir = path.join(__dirname, 'data', 'real_data');
  const nbaFilePath = path.join(dataDir, 'nba_teams.json');
  const soccerFilePath = path.join(dataDir, 'soccer_leagues.json');
  const f1FilePath = path.join(dataDir, 'f1_constructors.json');
  
  // Load data
  const nbaData = loadJsonData(nbaFilePath);
  const soccerData = loadJsonData(soccerFilePath);
  const f1Data = loadJsonData(f1FilePath);
  
  // Transform data
  const transformedNbaData = transformNbaData(nbaData);
  const transformedSoccerData = transformSoccerData(soccerData);
  const transformedF1Data = transformF1Data(f1Data);
  
  // Create integrated data object
  const integratedData = {
    basketball: {
      teams: transformedNbaData
    },
    soccer: {
      leagues: transformedSoccerData
    },
    formula1: {
      constructors: transformedF1Data
    }
  };
  
  // Save integrated data
  const outputPath = path.join(__dirname, 'data', 'integrated_sports_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(integratedData, null, 2));
  
  console.log(`Data integration complete. Output saved to ${outputPath}`);
}

// Run the integration
integrateData().catch(console.error);
