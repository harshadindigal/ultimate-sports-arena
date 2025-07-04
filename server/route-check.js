
// This script checks if the API routes are correctly registered in Express
const express = require('express');
const app = express();

// Mock the API routes
app.use('/api/sports', (req, res) => res.json({ message: 'Sports API' }));
app.use('/api/questions', (req, res) => res.json({ message: 'Questions API' }));
app.use('/api/games', (req, res) => res.json({ message: 'Games API' }));
app.use('/api/leaderboard', (req, res) => res.json({ message: 'Leaderboard API' }));

// Get all registered routes
const listRoutes = () => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.toString()
            .replace('\\', '')
            .replace('(?=\\/|$)', '')
            .replace(/^\^\\/, '')
            .replace(/\\\/\\\//g, '/')
            .replace(/\\\//g, '/');
          
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  return routes;
};

// Print all registered routes
console.log('Registered routes:');
console.log(JSON.stringify(listRoutes(), null, 2));
