import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiHandler } from '../helper/ApiHandler'; // Helper for API calls
import { EXTRA_ENDPOINTS } from '../config/apiEndpoints';

const RecentWinnerPopup = () => {
  const [currentWinner, setCurrentWinner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fakeTimeAgo, setFakeTimeAgo] = useState('');
  const { token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Generate random time between 5 seconds and 5 minutes
  const generateRandomTimeAgo = () => {
    const seconds = Math.floor(Math.random() * (300 - 5 + 1)) + 5; // 5s to 300s

    if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await ApiHandler(EXTRA_ENDPOINTS.GET_RECENT_WINNER, 'GET', undefined, token, dispatch, navigate);

        if (response.data?.status?.code === 1 && response.data.data.length > 0) {
          const winners = response.data.data;
          let winnerIndex = 0;

          const cycleWinners = setInterval(() => {
            const winner = winners[winnerIndex];
            setCurrentWinner(winner);
            setFakeTimeAgo(generateRandomTimeAgo()); // 👈 Generate new time on each popup
            setIsVisible(true);

            // Hide popup after 5 seconds
            setTimeout(() => {
              setIsVisible(false);
            }, 5000);

            winnerIndex = (winnerIndex + 1) % winners.length;
          }, 15000);

          // Clear interval when component unmounts
          return () => clearInterval(cycleWinners);
        }
      } catch (error) {
        console.error("Could not fetch recent winners:", error);
      }
    };

    fetchWinners();
  }, [token, dispatch, navigate]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!currentWinner || !isVisible) {
    return null;
  }

  return (
    <div 
      onClick={handleDismiss}
      className="fixed bottom-4 left-4 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-out w-72 sm:w-80 border border-yellow-500 cursor-pointer transition duration-300 hover:scale-105"
    >
      <div className="flex items-start gap-3">
        {/* Game Image */}
        <img
          src={currentWinner.game_image}
          alt={currentWinner.game_name}
          className="w-12 h-12 rounded-md object-cover border border-gray-700"
        />

        <div className="flex flex-col">
          {/* User Email */}
          <p className="font-semibold text-yellow-400 text-sm truncate">{currentWinner.email}</p>

          {/* Amount + Game */}
          <p className="text-xs text-gray-300 mt-1">
            Won <span className="text-green-400 font-bold">${parseFloat(currentWinner.amount).toFixed(2)}</span> on{' '}
            <span className="italic text-white">{currentWinner.game_name}</span>
          </p>

          {/* Fake Time Ago */}
          <p className="text-xs text-gray-500 mt-1">{fakeTimeAgo}</p>
        </div>
      </div>
    </div>
  );
};

export default RecentWinnerPopup;
