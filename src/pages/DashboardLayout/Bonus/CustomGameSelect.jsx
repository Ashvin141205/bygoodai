import React, { useState, useRef, useEffect } from 'react';

const CustomGameSelect = ({ games, selectedGame, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // This effect will close the dropdown if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (game) => {
    onSelect(game);
    setIsOpen(false);
  };

  // Find the full game object for the currently selected game ID
  const selectedGameData = games.find(g => g.id === selectedGame);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 mb-2 rounded-md bg-[#0E0E0E] main-border text-base text-white placeholder:text-white focus:outline-none flex items-center justify-between transition-all duration-200"
      >
        {selectedGameData ? (
          <div className="flex items-center">
            <img src={selectedGameData.game_image} alt={selectedGameData.game_name} className="w-8 h-8 rounded-md mr-3 object-cover" />
            <span>{selectedGameData.game_name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select Game</span>
        )}
        {/* Arrow icon that rotates when the dropdown is open */}
        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {/* The dropdown list that appears when the button is clicked */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md bg-[#1c1c1c] shadow-lg max-h-60 overflow-y-auto main-border">
          <ul className="py-1">
            {games.map((game) => (
              <li
                key={game.id}
                onClick={() => handleSelect(game)}
                className="px-4 py-3 text-white hover:bg-[#290A47] cursor-pointer flex items-center transition-colors duration-150"
              >
                <img src={game.game_image} alt={game.game_name} className="w-8 h-8 rounded-md mr-3 object-cover" />
                <span className="font-medium">{game.game_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomGameSelect;