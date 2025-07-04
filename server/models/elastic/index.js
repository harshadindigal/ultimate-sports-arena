
// Import Elasticsearch models
const SportModel = require('./sport_model');
const QuestionModel = require('./question_model');
const UserModel = require('./user_model');
const GameModeModel = require('./game_mode_model');
const GameHistoryModel = require('./game_history_model');
const LeaderboardModel = require('./leaderboard_model');
const AchievementModel = require('./achievement_model');

// Initialize all indices
const initializeIndices = async () => {
  await SportModel.createIndex();
  await QuestionModel.createIndex();
  await UserModel.createIndex();
  await GameModeModel.createIndex();
  await GameHistoryModel.createIndex();
  await LeaderboardModel.createIndex();
  await AchievementModel.createIndex();
  console.log('All Elasticsearch indices initialized');
};

module.exports = {
  SportModel,
  QuestionModel,
  UserModel,
  GameModeModel,
  GameHistoryModel,
  LeaderboardModel,
  AchievementModel,
  initializeIndices
};
