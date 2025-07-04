
const dataSources = {
  nfl: {
    name: 'NFL',
    sources: [
      {
        name: 'Pro-Football-Reference',
        url: 'https://www.pro-football-reference.com',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/nfl',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
      }
    ]
  },
  ncaaFootball: {
    name: 'NCAA Football',
    sources: [
      {
        name: 'Pro-Football-Reference',
        url: 'https://www.sports-reference.com/cfb',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/college-football',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football'
      }
    ]
  },
  nba: {
    name: 'NBA',
    sources: [
      {
        name: 'Basketball-Reference',
        url: 'https://www.basketball-reference.com',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/nba',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba'
      }
    ]
  },
  wnba: {
    name: 'WNBA',
    sources: [
      {
        name: 'Basketball-Reference',
        url: 'https://www.basketball-reference.com/wnba',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/wnba',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba'
      }
    ]
  },
  ncaaBasketball: {
    name: 'NCAA Basketball',
    sources: [
      {
        name: 'Basketball-Reference',
        url: 'https://www.sports-reference.com/cbb',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/mens-college-basketball',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball'
      }
    ]
  },
  mlb: {
    name: 'MLB',
    sources: [
      {
        name: 'Baseball-Reference',
        url: 'https://www.baseball-reference.com',
        method: 'scraping'
      }
    ]
  },
  soccer: {
    name: 'Soccer',
    sources: [
      {
        name: 'FBref',
        url: 'https://fbref.com',
        method: 'scraping'
      },
      {
        name: 'Transfermarkt',
        url: 'https://www.transfermarkt.com',
        method: 'scraping'
      },
      {
        name: 'ESPN',
        url: 'https://www.espn.com/soccer',
        method: 'api',
        apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/soccer'
      }
    ]
  },
  tennis: {
    name: 'Tennis',
    sources: [
      {
        name: 'ATP/WTA',
        url: 'https://www.atptour.com',
        method: 'scraping'
      },
      {
        name: 'TennisAbstract',
        url: 'http://www.tennisabstract.com',
        method: 'scraping'
      }
    ]
  },
  golf: {
    name: 'Golf',
    sources: [
      {
        name: 'PGA Tour Stats',
        url: 'https://www.pgatour.com/stats',
        method: 'scraping'
      },
      {
        name: 'Official World Golf Ranking',
        url: 'https://www.owgr.com',
        method: 'scraping'
      }
    ]
  },
  f1: {
    name: 'Formula 1',
    sources: [
      {
        name: 'Ergast API',
        url: 'http://ergast.com/mrd',
        method: 'api',
        apiEndpoint: 'http://ergast.com/api/f1'
      },
      {
        name: 'Formula1.com',
        url: 'https://www.formula1.com',
        method: 'scraping'
      }
    ]
  },
  cricket: {
    name: 'Cricket',
    sources: [
      {
        name: 'Cricinfo',
        url: 'https://www.espncricinfo.com',
        method: 'scraping'
      },
      {
        name: 'HowSTAT',
        url: 'http://www.howstat.com',
        method: 'scraping'
      }
    ]
  },
  ufc: {
    name: 'UFC',
    sources: [
      {
        name: 'UFC Stats',
        url: 'http://www.ufcstats.com',
        method: 'scraping'
      },
      {
        name: 'Tapology',
        url: 'https://www.tapology.com',
        method: 'scraping'
      }
    ]
  },
  boxing: {
    name: 'Boxing',
    sources: [
      {
        name: 'BoxRec',
        url: 'https://boxrec.com',
        method: 'scraping'
      },
      {
        name: 'The Ring Magazine',
        url: 'https://www.ringtv.com',
        method: 'scraping'
      }
    ]
  },
  nhl: {
    name: 'NHL',
    sources: [
      {
        name: 'Hockey-Reference',
        url: 'https://www.hockey-reference.com',
        method: 'scraping'
      }
    ]
  },
  olympics: {
    name: 'Olympics',
    sources: [
      {
        name: 'Olympedia.org',
        url: 'https://www.olympedia.org',
        method: 'scraping'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Olympic_Games',
        method: 'scraping'
      }
    ]
  }
};

// Schema definitions for normalized data
const schemas = {
  player: {
    name: String,
    dob: Date,
    nationality: String,
    teams: Array
  },
  team: {
    name: String,
    sport: String,
    league: String,
    seasonStats: Object
  },
  match: {
    date: Date,
    score: String,
    participants: Array,
    stats: Object
  },
  event: {
    name: String,
    date: Date,
    location: String,
    participants: Array
  },
  season: {
    year: String,
    league: String,
    topStats: Object
  },
  statLine: {
    player_id: String,
    match_id: String,
    stat_type: String,
    value: Number
  }
};

// Elasticsearch indices
const indices = {
  players: 'players',
  teams: 'teams',
  matches: 'matches',
  events: 'events',
  seasons: 'seasons',
  statLines: 'stat_lines',
  trivia_matches: 'trivia_matches'
};

module.exports = {
  dataSources,
  schemas,
  indices
};
