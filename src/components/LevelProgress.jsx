import React from 'react';

// We need to tell React where to find the level badge images.
// Make sure these paths match your assets folder structure.
const levelImages = {
    BRONZE: require('../assets/levels/BRONZE_1.webp'),
    SILVER: require('../assets/levels/SILVER_1.webp'),
    GOLD: require('../assets/levels/GOLD_1.webp'),
    PLATINUM: require('../assets/levels/PLATINIUM_1.webp'), // Note the spelling "PLATINIUM" from your assets
    DIAMOND: require('../assets/levels/DIAMOND_1.webp'),
};

const LevelProgress = ({ activeLevel, lifetimeDeposit }) => {
    // If the data is not yet loaded, show a simple loading message.
    if (!activeLevel) {
        return (
            <div className="bg-[#1F2937] p-4 rounded-lg text-center text-gray-400">
                Loading Level Progress...
            </div>
        );
    }

    const currentLevelName = activeLevel.level_name || 'BRONZE';
    const nextLevelName = activeLevel.next_level_name || 'Max Level';
    const reward = activeLevel.next_level_bonus ? `${activeLevel.next_level_bonus}% Bonus` : 'All Unlocked!';
    
    const minDeposit = parseFloat(activeLevel.min_deposit_limit) || 0;
    const maxDeposit = parseFloat(activeLevel.max_deposit_limit) || 0;

    // Calculate the user's progress within their current level tier.
    const progressInLevel = lifetimeDeposit - minDeposit;
    const levelDepositRange = maxDeposit - minDeposit;
    
    // Calculate the progress as a percentage.
    let progressPercentage = 0;
    if (levelDepositRange > 0) {
        progressPercentage = Math.min((progressInLevel / levelDepositRange) * 100, 100);
    } else if (lifetimeDeposit >= maxDeposit) {
        // Handle max level case
        progressPercentage = 100;
    }

    const amountNeeded = Math.max(0, maxDeposit - lifetimeDeposit);

    return (
        <div className="bg-gradient-to-b from-[#2a374a] to-[#1F2937] p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Level Badge Image */}
                <img 
                    src={levelImages[currentLevelName.toUpperCase()] || levelImages['BRONZE']} 
                    alt={`${currentLevelName} Level`} 
                    className="w-20 h-20"
                />

                <div className="w-full text-center sm:text-left">
                    {/* Level Titles */}
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="font-bold text-lg text-yellow-400">{currentLevelName}</p>
                        <p className="font-semibold text-sm text-gray-400">Next Level: {nextLevelName}</p>
                    </div>
                    
                    {/* The Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-1 border-2 border-gray-600">
                        <div 
                            className="bg-yellow-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>

                    {/* Text showing how much more is needed to level up */}
                    {progressPercentage < 100 ? (
                         <p className="text-xs text-gray-300">
                            Deposit ${amountNeeded.toFixed(2)} more to unlock <span className="font-bold text-yellow-400">{reward}</span>!
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-green-400">
                           You've reached the highest level! Congratulations!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LevelProgress;