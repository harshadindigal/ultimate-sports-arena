const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const { Sport, GameMode, Question, User } = require('../models');

// Load environment variables
dotenv.config();

// Import seed data
const sportsData = require('./data/sports.json');
const universalGameModesData = require('./data/universalGameModes.json');
const sportSpecificGameModesData = require('./data/sportSpecificGameModes.json');
const questionsData = require('./data/questions.json');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await Sport.deleteMany();
    await GameMode.deleteMany();
    await Question.deleteMany();
    console.log('Data cleared'.red.inverse);

    // Create admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('Admin user created'.green.inverse);
    }

    // Insert sports
    const createdSports = await Sport.insertMany(sportsData);
    console.log(`${createdSports.length} sports created`.green.inverse);

    // Create sport lookup by name
    const sportLookup = {};
    createdSports.forEach(sport => {
      sportLookup[sport.name] = sport._id;
    });

    // Insert universal game modes
    const universalGameModes = universalGameModesData.map(gameMode => {
      // Assign each universal game mode to all sports
      return createdSports.map(sport => ({
        ...gameMode,
        sport: sport._id,
      }));
    }).flat();

    const createdUniversalGameModes = await GameMode.insertMany(universalGameModes);
    console.log(`${createdUniversalGameModes.length} universal game modes created`.green.inverse);

    // Update sports with universal game modes
    for (const sport of createdSports) {
      const sportGameModes = createdUniversalGameModes.filter(
        gameMode => gameMode.sport.toString() === sport._id.toString()
      );
      sport.gameModes = sportGameModes.map(gameMode => gameMode._id);
      await sport.save();
    }

    // Insert sport-specific game modes
    const sportSpecificGameModes = [];
    
    for (const [sportName, gameModes] of Object.entries(sportSpecificGameModesData)) {
      const sportId = sportLookup[sportName];
      
      if (sportId) {
        const sportGameModes = gameModes.map(gameMode => ({
          ...gameMode,
          sport: sportId,
        }));
        
        sportSpecificGameModes.push(...sportGameModes);
      }
    }

    const createdSportSpecificGameModes = await GameMode.insertMany(sportSpecificGameModes);
    console.log(`${createdSportSpecificGameModes.length} sport-specific game modes created`.green.inverse);

    // Update sports with sport-specific game modes
    for (const gameMode of createdSportSpecificGameModes) {
      const sport = await Sport.findById(gameMode.sport);
      if (sport) {
        sport.gameModes.push(gameMode._id);
        await sport.save();
      }
    }

    // Create game mode lookup
    const gameModeLookup = {};
    const allGameModes = [...createdUniversalGameModes, ...createdSportSpecificGameModes];
    
    for (const gameMode of allGameModes) {
      const sport = await Sport.findById(gameMode.sport);
      if (sport) {
        const key = `${sport.name}-${gameMode.name}`;
        gameModeLookup[key] = gameMode._id;
      }
    }

    // Insert questions
    const formattedQuestions = [];

    // Process American Football questions
    if (sportLookup['American Football']) {
      const footballQuestions = questionsData.americanFootballQuestions.map(question => ({
        ...question,
        sport: sportLookup['American Football'],
        gameMode: gameModeLookup['American Football-Quick Play Trivia'],
      }));
      formattedQuestions.push(...footballQuestions);
    }

    // Process Basketball questions
    if (sportLookup['Basketball']) {
      const basketballQuestions = questionsData.basketballQuestions.map(question => ({
        ...question,
        sport: sportLookup['Basketball'],
        gameMode: gameModeLookup['Basketball-Quick Play Trivia'],
      }));
      formattedQuestions.push(...basketballQuestions);
    }

    const createdQuestions = await Question.insertMany(formattedQuestions);
    console.log(`${createdQuestions.length} questions created`.green.inverse);

    console.log('Data seeded successfully'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Run the seed function
seedData();
