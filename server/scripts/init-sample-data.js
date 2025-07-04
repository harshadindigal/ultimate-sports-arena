
const { elasticClient } = require('../config/elastic');
const { initializeIndices } = require('../models/elastic');

// Sample sports data
const sportsData = [
  {
    name: 'NBA',
    description: 'National Basketball Association',
    imageUrl: 'https://cdn.nba.com/logos/nba/nba-logoman-75-word_white.svg'
  },
  {
    name: 'NFL',
    description: 'National Football League',
    imageUrl: 'https://static.www.nfl.com/image/upload/v1554321393/league/nvfr7ogywskqrfaiu38m.svg'
  },
  {
    name: 'MLB',
    description: 'Major League Baseball',
    imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg'
  }
];

// Sample questions data
const questionsData = [
  {
    text: 'Which NBA team has won the most championships?',
    options: [
      { text: 'Los Angeles Lakers', isCorrect: false },
      { text: 'Boston Celtics', isCorrect: true },
      { text: 'Chicago Bulls', isCorrect: false },
      { text: 'Golden State Warriors', isCorrect: false }
    ],
    explanation: 'The Boston Celtics have won 17 NBA championships.',
    difficulty: 'easy',
    sport: 'NBA',
    category: 'history'
  },
  {
    text: 'Which NFL team has won the most Super Bowls?',
    options: [
      { text: 'Dallas Cowboys', isCorrect: false },
      { text: 'San Francisco 49ers', isCorrect: false },
      { text: 'New England Patriots', isCorrect: true },
      { text: 'Pittsburgh Steelers', isCorrect: false }
    ],
    explanation: 'The New England Patriots have won 6 Super Bowls.',
    difficulty: 'easy',
    sport: 'NFL',
    category: 'history'
  },
  {
    text: 'Which MLB team has won the most World Series?',
    options: [
      { text: 'New York Yankees', isCorrect: true },
      { text: 'St. Louis Cardinals', isCorrect: false },
      { text: 'Boston Red Sox', isCorrect: false },
      { text: 'Los Angeles Dodgers', isCorrect: false }
    ],
    explanation: 'The New York Yankees have won 27 World Series championships.',
    difficulty: 'easy',
    sport: 'MLB',
    category: 'history'
  }
];

// Initialize sample data
async function initSampleData() {
  try {
    console.log('Initializing indices...');
    await initializeIndices();
    
    console.log('Adding sample sports data...');
    for (const sport of sportsData) {
      await elasticClient.index({
        index: 'sports',
        body: {
          ...sport,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        refresh: true
      });
    }
    
    console.log('Adding sample questions data...');
    for (const question of questionsData) {
      await elasticClient.index({
        index: 'questions',
        body: {
          ...question,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        refresh: true
      });
    }
    
    console.log('Sample data initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing sample data:', err);
    process.exit(1);
  }
}

// Run the initialization
initSampleData();
