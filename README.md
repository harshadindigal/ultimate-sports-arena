
# Ultimate Sports Arena

A trivia-focused Sports Arena App using historical sports data stored in Elasticsearch.

## Overview

Ultimate Sports Arena is a sports trivia application that allows users to test their knowledge about various sports. The application uses Elasticsearch as its backend database and implements a comprehensive data collection strategy to gather historical sports data from various sources.

## Data Collection Strategy

### Data Sources

| Sport | Source | Method |
|-------|--------|--------|
| NFL, NCAA | Pro-Football-Reference, ESPN | Scraping + ESPN API |
| NBA, WNBA, NCAA | Basketball-Reference, ESPN | Scraping + APIs |
| MLB | Baseball-Reference | Scraping |
| Soccer | FBref, Transfermarkt, FIFA APIs, ESPN | Scraping + Public APIs |
| Tennis | ATP/WTA, TennisAbstract | Scraping |
| Golf | PGA Tour Stats, Official World Golf Ranking | Scraping |
| F1 | Ergast API, Formula1.com | Ergast API + Scraping |
| Cricket | Cricinfo, HowSTAT | Scraping |
| UFC | UFC Stats, Tapology | Scraping |
| Boxing | BoxRec, The Ring Magazine | Scraping |
| NHL | Hockey-Reference | Scraping |
| Olympics | Olympedia.org, Wikipedia | Scraping |

### Normalized Schema

To allow cross-sport trivia generation, we normalize key entities:

- Player (name, DOB, nationality, teams)
- Team (name, sport, league, season stats)
- Match/Game (date, score, participants, stats)
- Event/Tournament (e.g., "Wimbledon 2019", "Super Bowl LV")
- Season (year, league, top stats)
- StatLine (player_id, match_id, stat_type, value)

### ETL Pipelines

- Extract: Scrapers or API clients per data source
- Transform: Normalize and clean raw data into the standardized schema
- Load: Push JSON documents to Elasticsearch

### Elasticsearch Indexing Strategy

Indices:
- trivia_matches_{sport}
- players
- teams
- events

Fields to Index for Trivia:
- stat_keywords (e.g., "most points", "fastest lap")
- date, sport, league, event
- players_involved (for faster player trivia queries)

### Update & Sync Strategy

- Initial load: Backfill all historical data
- Daily jobs: Update live stats/events
- Webhooks: Auto-trigger ingestion jobs if APIs support them
- Versioning: Track data source changes to prevent corruption

### Rate Limiting & Legal

- Respect robots.txt when scraping
- Implement caching, user-agents, and backoff policies for scrapers

### Semantic Trivia (Optional)

- Use OpenAI embeddings or Hugging Face models to embed trivia questions
- Store vectors in Elasticsearch + kNN plugin or Weaviate

## Setup

### Prerequisites

- Node.js
- Elasticsearch

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in .env file:
   - ELASTICSEARCH_URI=your_elasticsearch_uri
   - ELASTICSEARCH_API_KEY=your_elasticsearch_api_key
   - JWT_SECRET=your_jwt_secret
   - JWT_EXPIRE=30d
4. Initialize Elasticsearch: `npm run init-elastic`
5. Start the server: `npm start`
6. Start data collection: `npm run collect-data`

## API Endpoints

- `/api/users` - User registration and authentication
- `/api/sports` - Sports information
- `/api/questions` - Trivia questions
- `/api/games` - Game modes and game history
- `/api/leaderboard` - Leaderboard information
