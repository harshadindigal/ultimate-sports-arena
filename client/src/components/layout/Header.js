import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Ultimate Sports Arena</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-blue-300">Home</Link>
            </li>
            <li>
              <Link to="/leaderboard" className="hover:text-blue-300">Leaderboard</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/profile" className="hover:text-blue-300">Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="hover:text-blue-300">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-blue-300">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-300">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
