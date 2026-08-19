import React from 'react';
import { useNavigate } from 'react-router-dom';

const MilkyWayCasino = () => {
    const navigate = useNavigate();

    const gameDetails = {
        game_name: 'MILKY WAY CASINO',
        game_image: 'https://d1txq81lrc562k.cloudfront.net/8fafec2c-5b14-410a-bc32-c629258d5c6b.webp',
        game_description: `Looking for a trusted and exciting online gaming experience? Milky Way Casino on Lucky Charm Sweep has you covered! As a trusted distributor, we provide a secure, seamless, and thrilling platform for playing award-winning fish games, keno games, and slot games. Enjoy instant payouts, 24/7 support, and an exceptional gaming experience, right from the comfort of your home.`,
        game_related_platform: [
            {
                id: 1,
                game_name: 'WHAT IS MILKY WAY CASINO?',
                game_image: 'https://d1txq81lrc562k.cloudfront.net/milky-way-casino-.webp',
                game_description: `Milky Way Casino is a top-tier online skill gaming app known for its diverse game selection and user-friendly features. Within just days of its launch, it has won the hearts of thousands across the US, quickly becoming a top choice for players. Whether you’re a casual gamer looking for a fun escape or a seasoned enthusiast seeking intense competition, Milky Way Casino has something for everyone.

Key Features and Benefits:`,
                features: [
                    'Award-Winning Games: Play a variety of skill-based games, from fish tables to exciting slot machines.',
                    'Seamless Gameplay: Enjoy smooth, uninterrupted gaming on any device.',
                    'Play Anytime, Anywhere: Whether you’re at home or on the go, Milky Way Casino is always within reach.',
                    'Diverse Game Selection: Choose from fan favorites like Fire Kirin Plus, Ocean King 5, and Dragon Slayer.',
                    'Fast and Secure Withdrawals: We prioritize your convenience, offering instant and safe payment options.',
                ],
            },
            {
                id: 2,
                game_name: 'Why Choose Lucky Charm Sweep for Milky Way Games?',
                game_image: '', // No image needed for this section
                game_description: `At Lucky Charm Sweep, we’re committed to providing an unparalleled gaming experience. Here’s why you’ll love playing with us:`,
                features: [
                    'Trusted Distributor: Our reputation for reliability and excellence sets us apart.',
                    'Multiple Payment Options: From Bitcoin and Litecoin to PayPal and credit cards, we make transactions simple and secure.',
                    'Play, Win, Withdraw Instantly: Why wait when you can get your winnings instantly? Our hassle-free withdrawals are designed with you in mind.',
                ],
            },
            {
                id: 3,
                game_name: 'MILKY WAY CASINO’S OUTSTANDING BONUSES',
                game_image: '', // Example of a missing image
                game_description: `The casino business is one of the key reasons online casinos are preferred over land-based ones. You may get a lot of value from Milky Way Casino APK’s bonus offers and other promotions, just like any gambling site.

That way, you can play the top Milky Way casino games while earning free money from those offers. Furthermore, the platform’s bonus packages come with more user-friendly wagering restrictions.`,
                features: [
                    'User-Friendly Wagering: Start using bonuses immediately and withdraw your money whenever it suits you.',
                    'Exciting Promotions: Take advantage of unique offers available only to app users.',
                ],
            },
            {
                id: 4,
                game_name: "MILKY WAY CASINO'S UNIQUE PLAYING STYLE",
                game_image: 'https://d1txq81lrc562k.cloudfront.net/csfff2.png',
                game_description: `Milky Way is a nice change of pace from the usual gaming platform. Fruit Party, for instance, takes you to a sunny meadow filled with brightly colored fruit emblems.`,
                features: [
                    'High RTP Games: Enjoy games with a 96.50% RTP, like Fruit Party.',
                    'Unique Themes: Experience innovative gameplay in diverse settings, from meadows to underwater worlds.',
                ],
            },
            {
                id: 5,
                game_name: 'Promotions & Security',
                game_image: '', // No image needed for this section
                game_description: `Discover the exclusive promotions and top-notch security features that make Milky Way Casino the best choice for online gaming.`,
                features: [
                    'Welcome Bonuses: Get a generous package on your first deposits.',
                    'Daily Promotions: Enjoy free spins, cashback, and exclusive prizes.',
                    'Loyalty Program: Earn points with every game and redeem them for rewards.',
                    'Safe Payments: Deposit and withdraw using trusted methods like Bitcoin, PayPal, and credit cards.',
                    '24/7 Support: Our dedicated team is available around the clock to assist you.',
                ],
            },
        ],
    };

    return (
        <div className='container mx-auto my-10 px-4'>
            {/* First section with responsive image */}
            <div className='flex flex-col-reverse md:flex-row gap-5'>
                <div className='text-white flex flex-col gap-3 w-full md:w-[65%]'>
                    <h1 className='font-bold text-3xl uppercase'>{gameDetails.game_name}</h1>
                    <p className='text-[#CACACA]'>{gameDetails.game_description}</p>
                    <div className='mt-3'>
                        <button
                            className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base"
                            onClick={() => navigate('/deposit')}
                        >
                            DEPOSIT NOW
                        </button>
                    </div>
                </div>
                <div
                    className='w-full md:w-[30%] flex items-center justify-center'
                    style={{
                        background: 'linear-gradient(90deg, #222C63 0%, #5B168A 100%)',
                        borderRadius: '10px',
                        padding: '20px',
                    }}
                >
                    <img
                        src={gameDetails.game_image}
                        alt={gameDetails.game_name}
                        className='w-full h-auto object-contain rounded-lg'
                    />
                </div>
            </div>

            {/* Additional sections */}
            {gameDetails.game_related_platform.map((relatedGame, index) => (
                <div
                    key={relatedGame.id}
                    className={`bg-[#290A47] border-b-[3px] border-[#EC29FC] p-6 rounded-lg flex flex-col lg:flex-row justify-between items-center text-white mt-20 gap-5 ${
                        index % 2 === 0 ? 'lg:flex-row-reverse border-l-[3px]' : 'border-r-[3px]'
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
                    <div className={`flex flex-col gap-2 ${relatedGame.game_image ? 'w-full lg:w-[60%]' : 'w-full'}`}>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">{relatedGame.game_name}</h2>
                        <p className="text-[#CACACA] text-sm sm:text-base">{relatedGame.game_description}</p>
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
                                onClick={() => navigate('/deposit')}
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

export default MilkyWayCasino;
