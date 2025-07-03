import React, { useState, useEffect } from 'react';
import Loader from '../ui/Loader';
import Message from '../ui/Message';

const QuizGame = ({ gameMode, questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameMode.timeLimit);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = Math.min(10, questions.length); // Limit to 10 questions per game

  useEffect(() => {
    // Reset timer when starting a new question
    setTimeLeft(gameMode.timeLimit);
    
    // Set up timer
    if (gameMode.timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            if (!showExplanation) {
              handleTimeout();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, gameMode.timeLimit, showExplanation]);

  const handleTimeout = () => {
    // Record the answer as timed out
    const answer = {
      question: currentQuestion._id,
      userAnswer: null,
      isCorrect: false,
      timeToAnswer: gameMode.timeLimit,
    };
    
    setAnswers([...answers, answer]);
    setShowExplanation(true);
  };

  const handleOptionSelect = (option) => {
    if (showExplanation) return;
    
    setSelectedOption(option);
    
    const isCorrect = option.isCorrect;
    if (isCorrect) {
      setScore(score + gameMode.pointsPerCorrectAnswer);
    }
    
    // Record the answer
    const answer = {
      question: currentQuestion._id,
      userAnswer: option.text,
      isCorrect,
      timeToAnswer: gameMode.timeLimit - timeLeft,
    };
    
    setAnswers([...answers, answer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Game completed
      const results = {
        score,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalQuestions,
        timeSpent: answers.reduce((total, a) => total + a.timeToAnswer, 0),
        answers,
      };
      
      onComplete(results);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="error">{error}</Message>;
  if (!currentQuestion) return <Message variant="error">No questions available</Message>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-500">Question</span>
            <h2 className="text-xl font-bold">{currentQuestionIndex + 1} of {totalQuestions}</h2>
          </div>
          
          <div>
            <span className="text-gray-500">Score</span>
            <h2 className="text-xl font-bold text-blue-600">{score}</h2>
          </div>
          
          {gameMode.timeLimit > 0 && (
            <div>
              <span className="text-gray-500">Time Left</span>
              <h2 className={`text-xl font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                {timeLeft}s
              </h2>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">{currentQuestion.text}</h3>
          
          {currentQuestion.imageUrl && (
            <div className="mb-4">
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-md border transition-colors ${
                  selectedOption === option
                    ? option.isCorrect
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : showExplanation && option.isCorrect
                    ? 'bg-green-100 border-green-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {showExplanation && currentQuestion.explanation && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h4 className="font-semibold text-blue-800 mb-1">Explanation</h4>
            <p className="text-gray-700">{currentQuestion.explanation}</p>
          </div>
        )}
        
        {showExplanation && (
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
