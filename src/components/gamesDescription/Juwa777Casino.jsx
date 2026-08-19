import React from "react";
import { useNavigate } from "react-router-dom";

const Juwa777Casino = () => {
  const navigate = useNavigate();

  const gameDetails = {
    game_name: "JUWA 777 CASINO",
    game_image:
      "https://d1txq81lrc562k.cloudfront.net/How-to-Play-Juwa-777-The-Ultimate-Guide-to-Winning-Big.webp",
    game_description: `Looking for a trusted and secure platform to enjoy the thrill of online casino games? Look no further than Juwa 777 Casino on Lucky Charm Sweep! We are a trusted distributor, providing a seamless and secure environment for you to experience the best of Juwa 777. With instant payouts, 24/7 support, and a wide variety of games, your satisfaction is our priority. Start your winning journey today with Juwa 777 Casino on Lucky Charm Sweep!`,
    game_related_platform: [
      {
        id: 1,
        game_name: "WHAT IS JUWA 777 CASINO?",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/juwa_777_2_(1).webp",
        game_description: `Juwa 777 Casino is a premier online gaming platform renowned for its extensive collection of high-quality games and user-friendly interface. As a leading destination for online casino enthusiasts, Juwa 777 offers a diverse range of games, including:

**Key Features and Benefits:**`,
        features: [
          "Fish Games: Immerse yourself in the exciting world of fish table games and test your skills.",
          "Slot Games: Spin the reels and try your luck on a variety of slot machines with captivating themes and bonus features.",
          "Seamless Gameplay: Enjoy smooth and uninterrupted gaming on any device.",
          "Play Anytime, Anywhere: Whether you're at home or on the go, Juwa 777 Casino is always accessible.",
          "Fast and Secure Withdrawals: We value your convenience, offering instant and secure payment options.",
        ],
      },
      {
        id: 2,
        game_name: "Why Choose Lucky Charm Sweep for Juwa 777 Games?",
        game_image: "", // No image needed for this section
        game_description: `At Lucky Charm Sweep, we're dedicated to providing an unparalleled gaming experience. Here's why you'll love playing Juwa 777 with us:`,
        features: [
          "Trusted Distributor: Our reputation for reliability and excellence sets us apart.",
          "Multiple Payment Options: From Bitcoin and Litecoin to PayPal and credit cards, we make transactions simple and secure.",
          "Play, Win, Withdraw Instantly: Get your winnings instantly with our hassle-free withdrawals.",
        ],
      },
      {
        id: 3,
        game_name: "JUWA 777 CASINO'S OUTSTANDING BONUSES",
        game_image: "https://d1txq81lrc562k.cloudfront.net/juwa_casino_4.webp", // Example of a missing image
        game_description: `Juwa 777 Casino offers a range of exciting bonuses and promotions to enhance your gaming experience. These bonuses can boost your bankroll and give you more chances to win big.

**Here are some of the bonuses you can expect:**`,
        features: [
          "Welcome Bonus: Get a generous bonus on your first deposit.",
          "Daily Bonuses: Enjoy daily rewards and free spins.",
          "Loyalty Program: Earn points for your gameplay and redeem them for exclusive rewards.",
          "VIP Program: Become a VIP member and unlock special benefits and privileges.",
        ],
      },
      {
        id: 4,
        game_name: "JUWA 777 CASINO'S UNIQUE PLAYING STYLE",
        game_image:
          "https://d1txq81lrc562k.cloudfront.net/juwa_online.webp",
        game_description: `Juwa 777 Casino offers a unique and immersive gaming experience with its innovative features and captivating themes.`,
        features: [
          "High-Quality Graphics: Enjoy stunning visuals and immersive sound effects.",
          "Mobile-Friendly Interface: Play seamlessly on your smartphone or tablet.",
          "User-Friendly Platform: Easily navigate the platform and find your favorite games.",
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
            index % 2 === 0? "lg:flex-row-reverse border-l-[3px]": "border-r-[3px]"
          }`}
        >
          {relatedGame.game_image? (
            <div className="w-full lg:w-[35%] lg:ml-6">
              <img
                src={relatedGame.game_image}
                alt={relatedGame.game_name}
                className="rounded-lg w-full h-auto"
              />
            </div>
          ): null}
          <div
            className={`flex flex-col gap-2 ${
              relatedGame.game_image? "w-full lg:w-[60%]": "w-full"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {relatedGame.game_name}
            </h2>
            <p className="text-[#CACACA] text-sm sm:text-base">
              {relatedGame.game_description}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#CACACA] text-sm sm:text-base">
              {relatedGame.features.map((feature, index) => (
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

export default Juwa777Casino;