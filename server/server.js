
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { testConnection } = require('./config/elastic');
const { initializeIndices } = require('./models/elastic');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Connect to Elasticsearch
async function connectElasticsearch() {
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('Elasticsearch Connected');
      await initializeIndices();
      console.log('Elasticsearch indices initialized');
    } else {
      console.error('Failed to connect to Elasticsearch');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Elasticsearch connection error: ${error.message}`);
    process.exit(1);
  }
}

// Connect to Elasticsearch
connectElasticsearch();

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sports', require('./routes/sportRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
