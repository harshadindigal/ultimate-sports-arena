
class DataNormalizer {
  normalizeTeam(rawTeam, sport) {
    return {
      name: rawTeam.name,
      sport: sport,
      description: rawTeam.description || '',
      imageUrl: rawTeam.imageUrl || '',
      leagues: rawTeam.leagues || []
    };
  }

  normalizePlayer(rawPlayer, sport) {
    return {
      name: rawPlayer.name,
      sport: sport,
      team: rawPlayer.team,
      position: rawPlayer.position || '',
      stats: rawPlayer.stats || {}
    };
  }

  normalizeGame(rawGame, sport) {
    return {
      date: rawGame.date,
      sport: sport,
      teams: rawGame.teams || rawGame.participants,
      score: rawGame.score || '',
      winner: rawGame.winner || ''
    };
  }
}

module.exports = new DataNormalizer();
