import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';

const ProfilePage = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [favoritesSports, setFavoritesSports] = useState([]);
  const [sports, setSports] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Get user profile
        const { data } = await axios.get('/api/users/profile');
        setName(data.name);
        setEmail(data.email);
        setFavoritesSports(data.favoritesSports || []);
        
        // Get all sports for selection
        const sportsResponse = await axios.get('/api/sports');
        setSports(sportsResponse.data);
        
        // For a real app, we would also fetch game history and achievements here
        // This is just placeholder data
        setGameHistory([
          { id: 1, sport: 'Basketball', gameMode: 'Quick Play Trivia', score: 80, date: '2023-03-15' },
          { id: 2, sport: 'Football', gameMode: 'True or False Blitz', score: 120, date: '2023-03-10' },
        ]);
        
        setAchievements([
          { id: 1, name: 'Sports Rookie', description: 'Complete your first game', date: '2023-03-10' },
          { id: 2, name: 'Basketball Pro', description: 'Score 100+ in a Basketball game', date: '2023-03-15' },
        ]);
        
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      const { data } = await axios.put('/api/users/profile', {
        name,
        email,
        password: password ? password : undefined,
        favoritesSports,
      });
      
      login(data);
      setSuccessMessage('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
      setUpdateError(null);
    } catch (error) {
      setUpdateError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSportToggle = (sportId) => {
    if (favoritesSports.includes(sportId)) {
      setFavoritesSports(favoritesSports.filter(id => id !== sportId));
    } else {
      setFavoritesSports([...favoritesSports, sportId]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
              
              {updateError && <Message variant="error">{updateError}</Message>}
              {successMessage && <Message variant="success">{successMessage}</Message>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Favorite Sports</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sports.map(sport => (
                      <div key={sport._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`sport-${sport._id}`}
                          checked={favoritesSports.includes(sport._id)}
                          onChange={() => handleSportToggle(sport._id)}
                          className="mr-2"
                        />
                        <label htmlFor={`sport-${sport._id}`}>{sport.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Game History</h2>
              
              {gameHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Mode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gameHistory.map((game) => (
                        <tr key={game.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.sport}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.gameMode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{game.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No game history yet. Start playing to see your results here!</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Achievements</h2>
              
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-semibold text-blue-700">{achievement.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                      <p className="text-gray-500 text-xs">Earned on {achievement.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No achievements yet. Keep playing to unlock achievements!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
