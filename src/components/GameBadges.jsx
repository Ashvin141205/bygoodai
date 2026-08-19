import React from 'react';

const GameBadges = ({ offers }) => {
  if (!offers) return null;

  const badges = [];

  const badgeClass =
    "flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium text-white mr-2 mb-2";

  // Standard badges
  if (offers.limited_offer === "1") {
    badges.push(
      <span key="limited" className={`${badgeClass} bg-red-500`}>
        🔥 <span>Limited Offer</span>
      </span>
    );
  }

  if (parseInt(offers.bonus_percent) > 0) {
    badges.push(
      <span key="bonus" className={`${badgeClass} bg-green-600`}>
        🎁 <span>+{offers.bonus_percent}% Bonus</span>
      </span>
    );
  }

  if (offers.top_pick === "1") {
    badges.push(
      <span key="top" className={`${badgeClass} bg-purple-600`}>
        👑 <span>Top Pick</span>
      </span>
    );
  }

  if (offers.fan_favorite === "1") {
    badges.push(
      <span key="fav" className={`${badgeClass} bg-pink-500`}>
        ❤️ <span>Fan Favorite</span>
      </span>
    );
  }

  if (offers.new_and_hot === "1") {
    badges.push(
      <span key="new" className={`${badgeClass} bg-yellow-400 text-black`}>
        🆕 <span>Hot</span>
      </span>
    );
  }

  if (offers.high_win_rate === "1") {
    badges.push(
      <span key="win" className={`${badgeClass} bg-teal-600`}>
        💰 <span>High Win Rate</span>
      </span>
    );
  }

  if (offers.mystery_bonus === "1") {
    badges.push(
      <span key="mystery" className={`${badgeClass} bg-indigo-600`}>
        🎲 <span>Mystery Bonus</span>
      </span>
    );
  }

  if (offers.popular_today === "1") {
    badges.push(
      <span key="popular" className={`${badgeClass} bg-rose-500`}>
        🔥 <span>Popular Today</span>
      </span>
    );
  }

  if (offers.trending === "1") {
    badges.push(
      <span key="trending" className={`${badgeClass} bg-orange-500`}>
        📈 <span>Trending</span>
      </span>
    );
  }

  // Total games badge (if platform name and game count available)
  if (offers.platform_name && offers.total_games) {
    badges.push(
      <span key="total_games" className={`${badgeClass} bg-gray-700`}>
        🎮 <span>{offers.total_games} Games</span>
      </span>
    );
  }

  return <div className="flex flex-wrap mt-2">{badges}</div>;
};

export default GameBadges;
