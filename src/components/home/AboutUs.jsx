import React from 'react';
import { Link } from 'react-router-dom';

const logo = "/bg.png";

const AboutUs = () => {
    const platforms = [
        { name: "Orion Stars", link: "/orion-stars" },
        { name: "Fire Kirin", link: "/fire-kirin" },
        { name: "Game Vault", link: "/game-vault" },
        { name: "Juwa", link: "/juwa" },
        { name: "Milky Way", link: "/milky-way" },
        { name: "Para Casino", link: "/para-casino" },
        { name: "Riversweeps", link: "/riversweeps" },
        { name: "Mafia", link: "/mafia" },
        { name: "Cash Machine", link: "/cash-machine" },
        { name: "Game Room", link: "/game-room" },
        { name: "Golden Treasure", link: "/golden-treasure" },
        { name: "Blue Dragon", link: "/blue-dragon" },
        { name: "V-blink", link: "/v-blink" },
        { name: "Ulta Panda", link: "/ulta-panda" },
        { name: "Panda Master", link: "/panda-master" },
        { name: "Lucky Star", link: "/lucky-star" },
        { name: "Moolah", link: "/moolah" },
        { name: "E-Games", link: "/e-games" },
        { name: "Cash Frenzy", link: "/cash-frenzy" },
        { name: "Joker", link: "/joker" }
    ];

    const features = [
        {
            icon: "🎰",
            title: "3000+ Slot Games",
            description: "From classic slots to progressive jackpots across 20+ platforms. Each platform offers 40-300 games!",
            link: "/slots",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            icon: "💰",
            title: "$2 Free Bonus",
            description: "Get $2 FREE on signup + $10 deposit bonus on your first order. No strings attached!",
            link: "/deposit-bonus",
            gradient: "from-pink-600 to-rose-600"
        },
        {
            icon: "⚡",
            title: "Quick Sign Up",
            description: "Create your account in under 2 minutes and start playing instantly. Fast, secure, and simple!",
            link: "/sign-up",
            gradient: "from-purple-500 to-purple-700"
        }
    ];

    return (
        <div className="relative bg-gradient-to-br from-[#1a0630] via-[#290A47] to-[#1a0630] rounded-2xl text-white container mx-auto shadow-2xl overflow-hidden"
            style={{
                backgroundImage: 'url(/sectionbg2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
            {/* Background overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0630]/90 via-[#290A47]/85 to-[#1a0630]/90"></div>
            
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse opacity-50"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10 p-8 md:p-12">
                {/* Logo and Main Content Section */}
                <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 w-full lg:w-1/3">
                        <Link to="/deposit" className="block group">
                            <div className="relative overflow-hidden rounded-xl border-2 border-[#EC29FC]/50 group-hover:border-[#EC29FC] transition-all duration-300 shadow-lg group-hover:shadow-pink-500/50">
                                <img
                                    src={logo}
                                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                                    alt="Lucky Charm Sweep Logo"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </Link>
                    </div>

                    {/* Text Content Section */}
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                            <span className="text-white">Lucky Charm Sweep – The Best Online Sweepstakes for </span>
                            <span className="text-[#FFD700]">FUN AND WINS!</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                            Lucky Charm Sweep brings you the best slot games for a truly memorable experience. Enjoy the latest online slots delivered right to your fingertips, with exceptional gameplay anytime, anywhere! 
                            <span className="text-[#FFD700] font-semibold"> Get paid fast and hassle-free with instant, seamless withdrawals!</span>
                        </p>
                    </div>
                </div>

                {/* Premium Content Box */}
                <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-purple-500/50 shadow-xl mb-8">
                    <p className="text-base md:text-lg text-gray-100 mb-4 leading-relaxed">
                        Experience the thrill of premium online casino gaming with <strong className="text-[#FFD700]">Lucky Charms Sweepstakes Casino</strong>. Our platform offers instant access to popular games from top platforms including{' '}
                        <Link to="/platform/description/orion-stars" className="text-[#FFD700] hover:text-yellow-400 underline decoration-2 underline-offset-4 transition-colors font-semibold">Orion Stars</Link>,{' '}
                        <Link to="/platform/description/juwa" className="text-[#FFD700] hover:text-yellow-400 underline decoration-2 underline-offset-4 transition-colors font-semibold">Juwa</Link>,{' '}
                        <Link to="/platform/description/game-vault" className="text-[#FFD700] hover:text-yellow-400 underline decoration-2 underline-offset-4 transition-colors font-semibold">Game Vault</Link>,{' '}
                        <Link to="/platform/description/milky-way" className="text-[#FFD700] hover:text-yellow-400 underline decoration-2 underline-offset-4 transition-colors font-semibold">Milky Way</Link>, and{' '}
                        <Link to="/platform/description/fire-kirin" className="text-[#FFD700] hover:text-yellow-400 underline decoration-2 underline-offset-4 transition-colors font-semibold">Fire Kirin</Link>.
                    </p>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-4"></div>
                    
                    <p className="text-gray-200 text-base md:text-lg leading-relaxed">
                        Join <span className="text-[#FFD700] font-bold">thousands of winners</span> who trust Lucky Charms for secure gaming, lightning-fast payouts, and 24/7 customer support. Whether you're spinning slots or chasing jackpots, <span className="italic text-[#FFD700]">your lucky charm awaits!</span>
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {features.map((feature, index) => (
                        <Link 
                            key={index}
                            to={feature.link} 
                            className="group relative bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/50 hover:border-[#EC29FC] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/30"
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>
                            
                            <div className="relative z-10">
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-[#FFD700] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors leading-relaxed">
                                    {feature.description}
                                </p>
                                
                                {/* Arrow indicator */}
                                <div className="mt-4 flex items-center text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-semibold mr-2">Learn More</span>
                                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Platforms Section */}
                <div className="bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-purple-900/30 rounded-xl p-6 border border-purple-400/30">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
                        <span className="text-white">Explore </span>
                        <span className="text-[#FFD700]">20+ Premium Gaming Platforms</span>
                    </h3>
                    <ul className="flex flex-wrap justify-center gap-3">
                        {platforms.map(platform => (
                            <li key={platform.name}>
                                <Link 
                                    to={`/platform/description${platform.link}`}
                                    className="inline-block px-4 py-2 bg-purple-900/50 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-500 rounded-full text-sm font-medium text-gray-200 hover:text-white border border-purple-500/50 hover:border-[#FFD700] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
                                >
                                    {platform.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;