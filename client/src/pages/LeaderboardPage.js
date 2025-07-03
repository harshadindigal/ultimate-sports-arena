import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [sports, setSports] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedGameMode, setSelectedGameMode] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sports
        const sportsResponse = await axios.get('/api/sports');
        setSports(sportsResponse.data);
        
        // Fetch game modes
        const gameModesResponse = await axios.get('/api/games');
        setGameModes(gameModesResponse.data);
        
        // Fetch global leaderboard
        const leaderboardResponse = await axios.get('/api/leaderboard');
        setLeaderboard(leaderboardResponse.data);
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFilteredLeaderboard = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/leaderboard';
        
        if (selectedSport !== 'all' && selectedGameMode === 'all') {
          endpoint = `/api/leaderboard/sport/${selectedSport}`;
        } else if (selectedSport === 'all' && selectedGameMode !== 'all') {
          endpoint = `/api/leaderboard/gamemode/${selectedGameMode}`;
        } else if (selectedSport !== 'all' && selectedGameMode !== 'all') {
          // For simplicity, we'll use the game mode filter which also returns sport info
          endpoint = `/api/leaderboard/gamemode/${selectedGameMode}`;
        }
        
        const response = await axios.get(endpoint);
        setLeaderboard(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchFilteredLeaderboard();
  }, [selectedSport, selectedGameMode]);

  const handleSportChange = (e) => {
    const sportId = e.target.value;
    setSelectedSport(sportId);
    
    // Reset game mode selection when sport changes
    if (sportId !== 'all') {
      setSelectedGameMode('all');
    }
  };

  const filteredGameModes = selectedSport === 'all'
    ? gameModes
    : gameModes.filter(gameMode => gameMode.sport._id === selectedSport);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="sport" className="block text-gray-700 mb-2">Filter by Sport</label>
            <select
              id="sport"
              value={selectedSport}
              onChange={handleSportChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport._id} value={sport._id}>{sport.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="gameMode" className="block text-gray-700 mb-2">Filter by Game Mode</label>
            <select
              id="gameMode"
              value={selectedGameMode}
              onChange={(e) => setSelectedGameMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Game Modes</option>
              {filteredGameModes.map(gameMode => (
                <option key={gameMode._id} value={gameMode._id}>{gameMode.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : leaderboard.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr key={entry._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.rank || index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.user?.name || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.sport?.name || 'Unknown Sport'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.gameMode?.name || 'Unknown Game Mode'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {entry.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.createdAt || entry.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Message variant="info">No leaderboard entries found.</Message>
      )}
    </div>
  );
};

export default LeaderboardPage;
