import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';

const SportPage = () => {
  const { id } = useParams();
  const [sport, setSport] = useState(null);
  const [gameModes, setGameModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSportData = async () => {
      try {
        const sportResponse = await axios.get(`/api/sports/${id}`);
        setSport(sportResponse.data);
        
        const gameModesResponse = await axios.get(`/api/sports/${id}/gamemodes`);
        setGameModes(gameModesResponse.data);
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchSportData();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : sport ? (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-64 overflow-hidden">
              <img
                src={sport.imageUrl}
                alt={sport.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{sport.name}</h1>
              <p className="text-gray-700 mb-6">{sport.description}</p>
              
              {sport.leagues && sport.leagues.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Leagues</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sport.leagues.map((league, index) => (
                      <div key={index} className="bg-gray-100 p-3 rounded-md">
                        <h3 className="font-medium">{league.name}</h3>
                        <p className="text-sm text-gray-600">{league.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((gameMode) => (
              <Link
                to={`/game-modes/${gameMode._id}`}
                key={gameMode._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{gameMode.name}</h3>
                  <p className="text-gray-600 mb-3">{gameMode.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Time Limit: {gameMode.timeLimit > 0 ? `${gameMode.timeLimit} seconds` : 'None'}</span>
                    <span>Points: {gameMode.pointsPerCorrectAnswer} per correct answer</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Message variant="error">Sport not found</Message>
      )}
    </div>
  );
};

export default SportPage;
