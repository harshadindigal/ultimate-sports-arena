import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';
import QuizGame from '../components/games/QuizGame';

const GameModePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [gameMode, setGameMode] = useState(null);
  const [sport, setSport] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  useEffect(() => {
    const fetchGameModeData = async () => {
      try {
        const gameModeResponse = await axios.get(`/api/games/${id}`);
        setGameMode(gameModeResponse.data);
        
        // Get sport data
        const sportResponse = await axios.get(`/api/sports/${gameModeResponse.data.sport}`);
        setSport(sportResponse.data);
        
        // Get questions for this game mode
        const questionsResponse = await axios.get(`/api/questions/gamemode/${id}`);
        setQuestions(questionsResponse.data);
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchGameModeData();
  }, [id]);

  const startGame = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setGameStarted(true);
  };

  const handleGameComplete = async (results) => {
    setGameCompleted(true);
    setGameResults(results);
    
    try {
      // Submit game results to the server
      await axios.post('/api/games/submit', {
        sport: sport._id,
        gameMode: gameMode._id,
        score: results.score,
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        timeSpent: results.timeSpent,
        completed: true,
        answers: results.answers,
      });
    } catch (error) {
      console.error('Error submitting game results:', error);
    }
  };

  const playAgain = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setGameResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : gameMode ? (
        <>
          {!gameStarted ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-2">{gameMode.name}</h1>
                <p className="text-gray-500 mb-4">Sport: {sport?.name}</p>
                <p className="text-gray-700 mb-6">{gameMode.description}</p>
                
                <div className="bg-gray-100 p-4 rounded-md mb-6">
                  <h2 className="text-xl font-semibold mb-2">Rules</h2>
                  <p>{gameMode.rules}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-md">
                    <h3 className="font-medium">Time Limit</h3>
                    <p>{gameMode.timeLimit > 0 ? `${gameMode.timeLimit} seconds` : 'None'}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-md">
                    <h3 className="font-medium">Points</h3>
                    <p>{gameMode.pointsPerCorrectAnswer} per correct answer</p>
                  </div>
                </div>
                
                <button
                  onClick={startGame}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : gameCompleted ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Game Results</h1>
                
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-blue-600">{gameResults.score}</p>
                    <p className="text-gray-600">Total Score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{gameResults.correctAnswers}</p>
                      <p className="text-gray-600">Correct Answers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{gameResults.totalQuestions - gameResults.correctAnswers}</p>
                      <p className="text-gray-600">Incorrect Answers</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xl font-bold">{Math.round((gameResults.correctAnswers / gameResults.totalQuestions) * 100)}%</p>
                    <p className="text-gray-600">Accuracy</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={playAgain}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <QuizGame
              gameMode={gameMode}
              questions={questions}
              onComplete={handleGameComplete}
            />
          )}
        </>
      ) : (
        <Message variant="error">Game mode not found</Message>
      )}
    </div>
  );
};

export default GameModePage;
