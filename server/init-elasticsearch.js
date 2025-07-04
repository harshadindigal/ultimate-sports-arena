
const { elasticClient, testConnection } = require('./config/elastic');
const { initializeIndices } = require('./models/elastic');
const { SportModel, GameModeModel, QuestionModel } = require('./models/elastic');

// Sample data
const sampleSports = [
  {
    name: 'NBA',
    description: 'National Basketball Association',
    imageUrl: 'https://cdn.nba.com/logos/nba/nba-logoman-75-word_white.svg',
    leagues: [
      {
        name: 'Eastern Conference',
        description: 'Eastern Conference of the NBA',
        imageUrl: 'https://cdn.nba.com/logos/leagues/east-logo.png'
      },
      {
        name: 'Western Conference',
        description: 'Western Conference of the NBA',
        imageUrl: 'https://cdn.nba.com/logos/leagues/west-logo.png'
      }
    ]
  },
  {
    name: 'NFL',
    description: 'National Football League',
    imageUrl: 'https://static.www.nfl.com/image/upload/v1554321393/league/nvfr7ogywskqrfaiu38m.svg',
    leagues: [
      {
        name: 'AFC',
        description: 'American Football Conference',
        imageUrl: 'https://static.www.nfl.com/image/upload/v1554321393/league/afc-logo.png'
      },
      {
        name: 'NFC',
        description: 'National Football Conference',
        imageUrl: 'https://static.www.nfl.com/image/upload/v1554321393/league/nfc-logo.png'
      }
    ]
  },
  {
    name: 'MLB',
    description: 'Major League Baseball',
    imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg',
    leagues: [
      {
        name: 'American League',
        description: 'American League of MLB',
        imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/103.svg'
      },
      {
        name: 'National League',
        description: 'National League of MLB',
        imageUrl: 'https://www.mlbstatic.com/team-logos/league-on-dark/104.svg'
      }
    ]
  }
];

const sampleGameModes = [
  {
    name: 'Quick Trivia',
    description: 'Answer 10 quick trivia questions in 60 seconds',
    sport: null, // Will be set after sport is created
    isUniversal: true,
    rules: 'Answer 10 questions in 60 seconds. Each correct answer gives 10 points.',
    timeLimit: 60,
    pointsPerCorrectAnswer: 10,
    imageUrl: 'https://example.com/quick-trivia.jpg'
  },
  {
    name: 'Championship Challenge',
    description: 'Test your knowledge about championships',
    sport: null, // Will be set after sport is created
    isUniversal: false,
    rules: 'Answer questions about championships. No time limit. Each correct answer gives 15 points.',
    timeLimit: 0,
    pointsPerCorrectAnswer: 15,
    imageUrl: 'https://example.com/championship-challenge.jpg'
  },
  {
    name: 'Stats Master',
    description: 'Test your knowledge about player statistics',
    sport: null, // Will be set after sport is created
    isUniversal: false,
    rules: 'Answer questions about player statistics. 120 seconds time limit. Each correct answer gives 20 points.',
    timeLimit: 120,
    pointsPerCorrectAnswer: 20,
    imageUrl: 'https://example.com/stats-master.jpg'
  }
];

const sampleQuestions = [
  {
    text: 'Who won the NBA Finals in 2016?',
    options: [
      { text: 'Cleveland Cavaliers', isCorrect: true },
      { text: 'Golden State Warriors', isCorrect: false },
      { text: 'Toronto Raptors', isCorrect: false },
      { text: 'Miami Heat', isCorrect: false }
    ],
    explanation: 'The Cleveland Cavaliers won the 2016 NBA Finals, coming back from a 3-1 deficit against the Golden State Warriors.',
    difficulty: 'medium',
    sport: null, // Will be set after sport is created
    gameMode: null, // Will be set after game mode is created
    category: 'championships',
    year: 2016
  },
  {
    text: 'Which NFL team won Super Bowl LV (55)?',
    options: [
      { text: 'Kansas City Chiefs', isCorrect: false },
      { text: 'Tampa Bay Buccaneers', isCorrect: true },
      { text: 'New England Patriots', isCorrect: false },
      { text: 'Los Angeles Rams', isCorrect: false }
    ],
    explanation: 'The Tampa Bay Buccaneers won Super Bowl LV, defeating the Kansas City Chiefs 31-9.',
    difficulty: 'medium',
    sport: null, // Will be set after sport is created
    gameMode: null, // Will be set after game mode is created
    category: 'championships',
    year: 2021
  },
  {
    text: 'Which MLB team won the 2020 World Series?',
    options: [
      { text: 'Los Angeles Dodgers', isCorrect: true },
      { text: 'Tampa Bay Rays', isCorrect: false },
      { text: 'Houston Astros', isCorrect: false },
      { text: 'Atlanta Braves', isCorrect: false }
    ],
    explanation: 'The Los Angeles Dodgers won the 2020 World Series, defeating the Tampa Bay Rays 4-2.',
    difficulty: 'medium',
    sport: null, // Will be set after sport is created
    gameMode: null, // Will be set after game mode is created
    category: 'championships',
    year: 2020
  }
];

// Initialize Elasticsearch and add sample data
async function initialize() {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to Elasticsearch');
      process.exit(1);
    }
    
    console.log('Connected to Elasticsearch');
    
    // Initialize indices
    await initializeIndices();
    console.log('Indices initialized');
    
    // Add sample sports
    const sports = [];
    for (const sportData of sampleSports) {
      const sport = await SportModel.createSport(sportData);
      sports.push(sport);
      console.log(`Added sport: ${sport.name}`);
    }
    
    // Add sample game modes
    const gameModes = [];
    for (let i = 0; i < sampleGameModes.length; i++) {
      const gameModeData = { ...sampleGameModes[i] };
      
      // Assign sport to game mode
      if (i > 0 && sports.length > 0) {
        gameModeData.sport = sports[i % sports.length]._id;
      }
      
      const gameMode = await GameModeModel.createGameMode(gameModeData);
      gameModes.push(gameMode);
      console.log(`Added game mode: ${gameMode.name}`);
    }
    
    // Add sample questions
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = { ...sampleQuestions[i] };
      
      // Assign sport and game mode to question
      questionData.sport = sports[i % sports.length]._id;
      questionData.gameMode = gameModes[1]._id; // Use Championship Challenge game mode for all
      
      const question = await QuestionModel.createQuestion(questionData);
      console.log(`Added question: ${question.text}`);
    }
    
    console.log('Sample data added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

// Run initialization
initialize();
