# Ultimate Sports Arena

A full-stack sports trivia and game hub. Each sport includes themed quizzes and creative mini-games based on real historical information (player stats, game moments, records, etc.).

![Ultimate Sports Arena](https://via.placeholder.com/800x400?text=Ultimate+Sports+Arena)

## 🎯 Overview

Ultimate Sports Arena is a comprehensive web application that offers trivia games and interactive mini-games for various sports. The application is designed to be engaging, educational, and competitive, allowing users to test their knowledge of sports history, statistics, and memorable moments.

### Features

- **Multiple Sports**: Coverage of 13+ sports including American Football, Basketball, Baseball, Soccer, Tennis, and more
- **Various Game Modes**: Each sport includes at least 3 different game modes
- **User Accounts**: Register, login, and track your progress
- **Leaderboards**: Compete with other users and see who has the highest scores
- **Achievements**: Unlock achievements as you play and improve
- **Real Historical Data**: Questions and games based on real sports history and statistics

## 🏟️ Included Sports

The application currently supports the following sports:

1. **American Football** (NFL, NCAA)
2. **Basketball** (NBA, WNBA, NCAA)
3. **Baseball** (MLB)
4. **Soccer/Football** (FIFA World Cup, EPL, La Liga, Champions League)
5. **Tennis** (ATP, WTA, Grand Slams)
6. **Golf** (PGA, LPGA, Majors)
7. **Formula 1**
8. **Cricket** (Test, ODI, T20, IPL)
9. **UFC / MMA**
10. **Boxing**
11. **Ice Hockey** (NHL)
12. **Olympics** (Summer and Winter disciplines)
13. **Esports** (LoL, Dota 2, CS:GO)

## 🎮 Game Modes

### Universal Game Modes (Available for all sports)

- **Quick Play Trivia**: Test your knowledge with 10 timed trivia questions
- **Career Challenge**: Guess the player or team based on career clues
- **True or False Blitz**: Answer as many true/false questions as you can in 30 seconds
- **Stat Master**: Given a stat, guess the correct player or year
- **Year in Review**: Identify events from a specific year in the sport

### Sport-Specific Game Modes

#### American Football
- **QB Ratings Game**: Match the QB to their passer rating in a given season
- **Super Bowl MVP Match**: Match Super Bowl MVPs to their teams and years
- **NFL Draft Trivia**: Guess draft year or round for famous players

#### Basketball
- **Build-A-Team**: Draft a fantasy 5-man squad under a point cap
- **Guess the Stat Line**: Identify who had a specific stat line in a famous playoff game
- **Career Trajectory**: Arrange teams in the order a player played for them

#### Baseball
- **Home Run Derby History**: Trivia on derby winners
- **Perfect Game Predictor**: Determine if a stat line was from a perfect game
- **Era Match**: Identify the decade based on team logos and player photos

#### Soccer
- **World Cup Matchup Memory**: Recall who played who in each stage
- **Golden Boot Timeline**: Rank top scorers by year
- **Club Journey**: Match players to clubs over their careers

#### Tennis
- **Grand Slam Sweep**: Identify who won all 4 Grand Slams in a year
- **Rivalry Tracker**: Determine who won more matches in famous rivalries
- **Score Breakdown**: Match scorelines to Grand Slam finals

## 🔧 Tech Stack

### Frontend
- React
- TailwindCSS
- React Router
- Axios

### Backend
- Node.js
- Express
- JWT Authentication
- MongoDB with Mongoose

## 📂 Project Structure

```
ultimate-sports-arena/
├── client/               # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   └── services/         # API services
├── server/               # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   └── utils/            # Utility functions
├── scripts/              # Data seeding scripts
├── .env.example          # Environment variables template
├── README.md             # Project documentation
└── docker-compose.yml    # Docker configuration (optional)
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ultimate-sports-arena.git
cd ultimate-sports-arena
```

2. Install dependencies
```bash
npm run install-all
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. Seed the database
```bash
npm run seed
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🌐 Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas account and set up a cluster
2. Create a database user and get your connection string
3. Add the connection string to your environment variables

### Frontend (Netlify)

1. Build the frontend
```bash
cd client
npm run build
```

2. Deploy to Netlify
```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli
netlify deploy
```

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to `npm install`
4. Set the start command to `npm start`
5. Add your environment variables

## 🔮 Future Enhancements

- Add more sports (Rugby, Volleyball, etc.)
- Implement more game modes
- Add multiplayer functionality
- Integrate with social media for sharing scores
- Implement a mobile app version

## 📝 License

This project is licensed under the MIT License.

## Verification Results

The Ultimate Sports Arena application has been verified and enhanced with:

1. **Real Sports Data Integration**
   - NBA teams data
   - Soccer leagues data
   - Formula 1 constructors data

2. **Interactive Game Components**
   - Enhanced drag-and-drop functionality for Career Trajectory games
   - Improved timer and scoring mechanisms
   - Visual feedback for game interactions

3. **Improved GitHub Deployment**
   - Robust error handling
   - Multiple branch support
   - Clear deployment instructions

4. **Project Structure Verification**
   - All required directories and files confirmed
   - Proper organization of components and services
   - Modular architecture for future expansion
