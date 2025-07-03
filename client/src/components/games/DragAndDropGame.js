import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * DragAndDropGame - An interactive game component where players drag and drop items
 * Can be used for games like "Career Trajectory" where players arrange teams in order
 */
const DragAndDropGame = ({ items, correctOrder, onComplete }) => {
  const [playerItems, setPlayerItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const timerRef = useRef(null);

  // Initialize the game
  useEffect(() => {
    // Shuffle the items for the player
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setPlayerItems(shuffled);
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          checkAnswer();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items]);

  // Handle drag start
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    // Find the index of the dragged item
    const draggedIndex = playerItems.findIndex(item => item.id === draggedItem.id);
    
    // Make a copy of the items array
    const newItems = [...playerItems];
    
    // Remove the dragged item
    newItems.splice(draggedIndex, 1);
    
    // Insert the dragged item at the drop position
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Update state
    setPlayerItems(newItems);
    setDraggedItem(null);
    setDraggedOverIndex(null);
  };

  // Check if the player's order matches the correct order
  const checkAnswer = () => {
    if (isCompleted) return;
    
    clearInterval(timerRef.current);
    
    // Compare player's order with correct order
    let correctCount = 0;
    for (let i = 0; i < playerItems.length; i++) {
      if (playerItems[i].id === correctOrder[i].id) {
        correctCount++;
      }
    }
    
    // Calculate score (percentage correct)
    const calculatedScore = Math.round((correctCount / playerItems.length) * 100);
    setScore(calculatedScore);
    
    // Set feedback based on score
    if (calculatedScore === 100) {
      setFeedback('Perfect! You got the order exactly right!');
    } else if (calculatedScore >= 75) {
      setFeedback('Great job! You got most of the order correct.');
    } else if (calculatedScore >= 50) {
      setFeedback('Good effort! You got about half the order correct.');
    } else {
      setFeedback('Nice try! Check out the correct order below.');
    }
    
    setIsCompleted(true);
    
    // Call the onComplete callback with the results
    onComplete({
      score: calculatedScore,
      timeSpent: 60 - timeLeft,
      playerOrder: playerItems,
      correctOrder
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Arrange in Correct Order</h2>
        <div className="text-xl font-semibold">
          Time: <span className={timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}>{timeLeft}s</span>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">Drag and drop the items to arrange them in the correct order.</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {playerItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3 rounded-md cursor-move border-2 ${
                draggedOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain" />
                )}
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!isCompleted ? (
        <button
          onClick={checkAnswer}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-6">
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="font-semibold text-xl mb-2">Your Score: {score}%</h3>
            <p className="text-gray-700">{feedback}</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Correct Order:</h3>
            <div className="flex flex-wrap gap-2">
              {correctOrder.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-md border-2 border-green-500 bg-green-50"
                >
                  <div className="flex items-center gap-2">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain" />
                    )}
                    <span>{index + 1}. {item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DragAndDropGame.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string
    })
  ).isRequired,
  correctOrder: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string
    })
  ).isRequired,
  onComplete: PropTypes.func.isRequired
};

export default DragAndDropGame;
