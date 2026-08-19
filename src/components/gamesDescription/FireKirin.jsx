import React from "react";
import { useNavigate } from "react-router-dom";

const FireKirinCasino = () => {
  const navigate = useNavigate();

  const gameDetails = {
    game_name: "FIRE KIRIN ONLINE SWEEPSTAKES",
    game_image:
      "https://d1txq81lrc562k.cloudfront.net/com.firekirin.kirinoffire.fishing.firefishing.sc0.2024-07-11-09-36-09.jpg",
    game_description: `Want to try a fun online game where you can win? Check out Fire Kirin on Lucky Charm Sweep! It's a really popular fish shooting game that people all over the world enjoy. It mixes skill and luck, so it's always exciting. Come join the fun underwater right from your phone or computer. Click 'Deposit Now' to start playing and winning!`,
    game_related_platform: [
      {
        id: 1,
        game_name: "WHAT'S FIRE KIRIN ABOUT?",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/3f41b9c105054010ae407cd306b55f891706936009.webp",
        game_description: `Fire Kirin offers exciting online sweepstakes games with top-tier fish hunting and slot experiences. Designed by gaming experts, it’s perfect for both seasoned players and beginners. Sign up to unlock exclusive perks and enjoy the latest games and features. Dive in and start your underwater adventure today! Join us at Kire Kirin and see how great gaming can be. Your underwater adventure starts now!`,
        features: [],
      },
      {
        id: 2,
        game_name: "COOL FISH GAMES AND SLOTS",
        game_image:
          "https://megasweeps777.com/wp-content/uploads/2023/04/fire-kirinnew2.webp", // Image of gameplay
        game_description: `Fire Kirin has become super popular with people who like online games, especially if they enjoy arcade-style fish games where you can win real prizes. It lets you go into a beautiful underwater world to test your skills and see if you can get lucky.`,
        features: [],
      },
      {
        id: 3,
        game_name: "WHAT MAKES FIRE KIRIN SPECIAL?",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/screen-0.webp",
        game_description: `Here are some things that make Fire Kirin a game you should definitely try:`,
        features: [
          "Easy to Play: The game is simple to use, so anyone can pick it up and start having fun.",
          "Lots of Fish: There are all sorts of colorful sea creatures, and each one is worth different points.",
          "Play with Others: You can play with your friends or other people online at the same time, which makes it even more exciting.",
          "Special Powers and Bonuses: You can get power-ups and bonuses that help you win more and make the game more interesting.",
        ],
      },
      {
        id: 4,
        game_name: "TIPS FOR WINNING",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/Tips-And-Tricks-To-Success-in-Online-Casino-Games.webp",
        game_description: `Want to get better at Fire Kirin and win more? Here are some tips:`,
        features: [
          "Know Your Fish: Some fish are worth more than others, so try to catch the valuable ones.",
          "Pick the Right Gun: Different guns work better for different fish. Try them out to see what you like.",
          "Shoot at the Right Time: Watch how the fish move and shoot when it's the best moment.",
          "Team Up: If you're playing with others, work together to catch the big fish.",
          "Use Bonuses Wisely: When you get a bonus, use it at the best time to help you win.",
        ],
      },
      {
        id: 5,
        game_name: "WHY PLAY FIRE KIRIN?",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/screen-3.webp",
        game_description: `Here's why a lot of people choose to play Fire Kirin:`,
        features: [
          "Good Chance of Winning: This game gives you a pretty good chance to win prizes.",
          "Always Getting Better: The people who made the game keep updating it with new things to keep it fun.",
          "Friendly Community: There are lots of other players you can connect with and share your wins with.",
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto my-10 px-4">
      {/* First section with responsive image */}
      <div className="flex flex-col-reverse md:flex-row gap-5">
        <div className="text-white flex flex-col gap-3 w-full md:w-[65%]">
          <h1 className="font-bold text-3xl uppercase">
            {gameDetails.game_name}
          </h1>
          <p className="text-[#CACACA]">{gameDetails.game_description}</p>
          <div className="mt-3">
            <button
              className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base"
              onClick={() => navigate("/deposit")}
            >
              DEPOSIT NOW
            </button>
          </div>
        </div>
        <div
          className="w-full md:w-[30%] flex items-center justify-center"
          style={{
            background: "linear-gradient(90deg, #222C63 0%, #5B168A 100%)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <img
            src={gameDetails.game_image}
            alt={gameDetails.game_name}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Additional sections */}
      {gameDetails.game_related_platform.map((relatedGame, index) => (
        <div
          key={relatedGame.id}
          className={`bg-[#290A47] border-b-[3px] border-[#EC29FC] p-6 rounded-lg flex flex-col lg:flex-row justify-between items-center text-white mt-20 gap-5 ${
            index % 2 === 0 ? "lg:flex-row-reverse border-l-[3px]" : "border-r-[3px]"
          }`}
        >
          {relatedGame.game_image ? (
            <div className="w-full lg:w-[35%] lg:ml-6">
              <img
                src={relatedGame.game_image}
                alt={relatedGame.game_name}
                className="rounded-lg w-full h-auto"
              />
            </div>
          ) : null}
          <div
            className={`flex flex-col gap-2 ${
              relatedGame.game_image ? "w-full lg:w-[60%]" : "w-full"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {relatedGame.game_name}
            </h2>
            <p className="text-[#CACACA] text-sm sm:text-base">
              {relatedGame.game_description}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#CACACA] text-sm sm:text-base">
              {relatedGame.features && relatedGame.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-yellow-400">➤</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button
                className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base"
                onClick={() => navigate("/deposit")}
              >
                DEPOSIT NOW
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FireKirinCasino;