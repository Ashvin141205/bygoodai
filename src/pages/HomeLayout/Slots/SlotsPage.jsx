import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Trophy, Zap, Star, Gift } from 'lucide-react';
import Hero from '../../../components/Hero';
import SlotsBg from '../../../assets/image/blogBg.png';
import { useDispatch, useSelector } from 'react-redux';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { updateGame } from '../../../redux/slice/gamesSlice';
import Loading from '../../../components/Common/Loading';

const SlotsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);
  
  const games = useSelector((state) => state.games.games);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchPlatforms = useCallback(async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.GAME.LIST, 'POST', { gameID: "", filter: "platform" }, undefined, dispatch, navigate);
      if (response.data.status.code === "1") {
        const data = response.data.data;

        const sortedData = [...data].sort((a, b) => {
          const trendingA = a.trending === "1" ? 1 : 0;
          const trendingB = b.trending === "1" ? 1 : 0;
          if (trendingA !== trendingB) {
            return trendingB - trendingA;
          }
          const idA = parseInt(a.platforms_id) || -Infinity;
          const idB = parseInt(b.platforms_id) || -Infinity;
          return idA - idB;
        });

        sortedData.forEach((game) => {
          const updatedGame = {
            ...game,
            is_game_add: game.is_game_add ? game.is_game_add : false,
            quantity: 10,
            platforms_id: game.platforms_id ? game.platforms_id : 0,
            status: game.online_status || 'offline',
          };
          dispatch(updateGame(updatedGame));
        });
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const categories = [
    { id: 'all', name: 'All Slots', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'popular', name: 'Popular', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'jackpot', name: 'Jackpot', icon: <Trophy className="w-5 h-5" /> },
    { id: 'new', name: 'New Releases', icon: <Zap className="w-5 h-5" /> }
  ];

  const slotGames = [
    {
      name: "Buffalo Gold",
      platform: "Orion Stars",
      category: "popular",
      jackpot: "$50,000+",
      description: "Classic buffalo-themed slot with massive multipliers"
    },
    {
      name: "Golden Dragon",
      platform: "Juwa",
      category: "jackpot",
      jackpot: "$100,000+",
      description: "Asian-inspired slot with progressive jackpot"
    },
    {
      name: "Fire Link",
      platform: "Milky Way",
      category: "popular",
      jackpot: "$25,000+",
      description: "Hot fire-themed slot with free spins bonus"
    },
    {
      name: "Lucky 7s",
      platform: "GameVault",
      category: "new",
      jackpot: "$15,000+",
      description: "Classic 777 slot machine with modern features"
    },
    {
      name: "Mega Moolah",
      platform: "Orion Stars",
      category: "jackpot",
      jackpot: "$75,000+",
      description: "Progressive jackpot slot with huge payouts"
    },
    {
      name: "Cleopatra Gold",
      platform: "Juwa",
      category: "popular",
      jackpot: "$30,000+",
      description: "Egyptian adventure with free spins and wilds"
    },
    {
      name: "Diamond Strike",
      platform: "Milky Way",
      category: "new",
      jackpot: "$20,000+",
      description: "Sparkly gems and big wins await"
    },
    {
      name: "Wild West Gold",
      platform: "GameVault",
      category: "popular",
      jackpot: "$35,000+",
      description: "Western-themed slot with sticky wilds"
    }
  ];

  const features = [
    {
      icon: <Gift className="w-8 h-8 text-yellow-400" />,
      title: "Free Spins Bonus",
      description: "Get 50 free spins on your first deposit"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Progressive Jackpots",
      description: "Win life-changing amounts on jackpot slots"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Instant Payouts",
      description: "Withdraw your winnings in minutes"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      title: "New Games Weekly",
      description: "Fresh slots added every week"
    }
  ];

  const platformGames = games.filter(game => game.game_name && game.game_image);
  
  // Filter by category based on API response fields
  const getFilteredGamesByCategory = (category) => {
    switch(category) {
      case 'all':
        return platformGames;
      case 'popular':
        return platformGames.filter(game => game.popular_today === "1");
      case 'jackpot':
        return platformGames.filter(game => game.high_win_rate === "1");
      case 'new':
        return platformGames.filter(game => game.new_and_hot === "1");
      default:
        return platformGames;
    }
  };

  const categoryGames = getFilteredGamesByCategory(activeCategory);
  const filteredGames = categoryGames.slice(0, displayCount);

  const hasMoreGames = displayCount < categoryGames.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(8);
  }, [activeCategory]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Lucky Charms Slots - Play 3000+ Online Slot Games | Real Money Wins</title>
        <meta name="description" content="Play the best online slots at Lucky Charms Casino! 3000+ slot games across 30+ platforms. Progressive jackpots, free spins & instant payouts. Sign up for $2 free!" />
        <link rel="canonical" href="https://www.luckycharmsweep.com/slots" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.luckycharmsweep.com/slots" />
        <meta property="og:title" content="Lucky Charms Slots - 3000+ Online Slot Games with Real Money Jackpots" />
        <meta property="og:description" content="Play top slot games across 30+ platforms. Get $2 Free + $10 Bonus on Your First Order! Progressive jackpots & instant withdrawals!" />
        <meta property="og:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lucky Charms Slots - 3000+ Online Slot Games" />
        <meta name="twitter:description" content="Play top slots with $2 free bonus + 50 free spins. Progressive jackpots & instant payouts!" />
        <meta name="twitter:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        <meta name="keywords" content="lucky charm slots, lucky charms slots, online slots real money, slot machines, lucky charm slots real money, progressive jackpot slots, free spins slots, casino slot games" />
        
        {/* Structured Data - Product/Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Lucky Charms Slots - Online Casino Games",
            "image": [
              "https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg",
              "https://www.luckycharmsweep.com/static/media/blogBg.png"
            ],
            "description": "Play 3000+ online slot games across 30+ premium platforms. Progressive jackpots, instant payouts, and real money wins. Get $2 Free + $10 Bonus on Your First Order!",
            "brand": {
              "@type": "Brand",
              "name": "Lucky Charms Sweepstakes"
            },
            "offers": {
              "@type": "Offer",
              "url": "https://www.luckycharmsweep.com/slots",
              "priceCurrency": "USD",
              "price": "0",
              "priceValidUntil": "2026-12-31",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Lucky Charms Sweepstakes"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2500"
            }
          })}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Lucky Charms Sweepstakes",
            "url": "https://www.luckycharmsweep.com",
            "logo": "https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg",
            "sameAs": [
              "https://www.facebook.com/luckycharmsweep",
              "https://twitter.com/luckycharmsweep"
            ]
          })}
        </script>
      </Helmet>

      <div style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }} className="min-h-screen text-white">
        <Hero 
          bgImg={SlotsBg} 
          title={"SLOTS"} 
          tagline="Play the Best Online Slot Games & Win Real Money!"
          backgroundColor='#290A47'
        />

        {/* CTA Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto text-center">
            <p className="text-lg text-gray-400 mb-6">
              Progressive jackpots, free spins, and instant payouts. Get $2 Free + $10 Bonus on Your First Order!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/sign-up" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-2xl"
              >
                Play Now - Get $2 Free
              </Link>
              <Link 
                to="/deposit" 
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all border border-gray-600"
              >
                View All Games
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-gray-900/50">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400">
              Why Play Slots at Lucky Charms?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-yellow-500 transition-all text-center"
                >
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-400">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-Platform Benefits */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-y border-yellow-500/20">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-yellow-400">
                Stop Playing on Just ONE Platform
              </h2>
              <p className="text-2xl text-white font-semibold mb-6">
                You're Leaving Money on the Table 💰
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30 mb-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">30+</div>
                  <div className="text-gray-300">Premium Platforms</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">3,000+</div>
                  <div className="text-gray-300">Unique Games</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">∞</div>
                  <div className="text-gray-300">Winning Opportunities</div>
                </div>
              </div>
              
              <div className="space-y-4 text-lg">
                <p className="text-gray-200 leading-relaxed">
                  <span className="text-yellow-400 font-bold">Here's the truth:</span> Different platforms = different games, different RTPs, different jackpots. 
                  While other sites lock you into ONE platform, we give you <span className="text-yellow-400 font-semibold">access to ALL of them</span>.
                </p>
                
                <p className="text-gray-200 leading-relaxed">
                  <span className="text-yellow-400 font-bold">What does this mean for you?</span> When Platform A is cold, Platform B might be paying out big. 
                  When you're tired of slots, switch to fish games, table games, or arcade classics. 
                  <span className="text-white font-semibold"> You're never stuck with limited options</span>.
                </p>
                
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-yellow-100 font-medium italic">
                    💡 <span className="font-bold">Pro Player Secret:</span> Every platform has hot and cold streaks. 
                    Smart players don't stay loyal to one platform—they spread their action across multiple platforms to catch the best moments and maximize wins.
                  </p>
                </div>
                
                <p className="text-white text-xl font-bold text-center pt-4">
                  Our users don't pick favorites. They play them all. And they win MORE. 🎯
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                to="/sign-up" 
                className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl"
              >
                Get Access to All 30+ Platforms Now
              </Link>
              <p className="text-gray-400 mt-4 text-sm">
                ⚡ Instant access • No restrictions • All games unlocked
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    activeCategory === category.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-yellow-500 transition-all hover:transform hover:scale-105 cursor-pointer"
                >
                  <div className="h-48 flex items-center justify-center overflow-hidden">
                    <img 
                      src={game.game_image} 
                      alt={game.game_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-yellow-400">{game.game_name}</h3>
                      {game.trending === "1" && (
                        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{game.platform_name || 'Premium Slots'}</p>
                    <button 
                      onClick={() => navigate('/deposit', { state: { selectedGame: game } })}
                      className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition-all"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMoreGames && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <span>Load More Games</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Slot Types Info */}
        <section className="py-16 px-4 bg-gray-900/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400">
              Types of Slots Available
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-3 text-yellow-400">Progressive Jackpot Slots</h3>
                <p className="text-gray-300 mb-2">
                  These slots feature ever-growing jackpots that can reach life-changing amounts. Every bet contributes to the jackpot pool until someone wins big!
                </p>
                <p className="text-sm text-gray-400">
                  Popular platforms: Orion Star, Milky Way, Juwa 1.0
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-3 text-yellow-400">Video Slots</h3>
                <p className="text-gray-300 mb-2">
                  Modern 5-reel slots with stunning graphics, multiple paylines, and exciting bonus features like free spins, multipliers, and interactive mini-games.
                </p>
                <p className="text-sm text-gray-400">
                  Popular platforms: Cash Frenzy, Sin City, Thunder7
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-3 text-yellow-400">Classic Slots</h3>
                <p className="text-gray-300 mb-2">
                  Traditional 3-reel slot machines with simple gameplay and nostalgic symbols like cherries, bars, and lucky 7s. Perfect for slot purists!
                </p>
                <p className="text-sm text-gray-400">
                  Popular platforms: Fire Kirin, Game Vault, River Sweep
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Win Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400">
              How to Win at Lucky Charms Slots
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Choose Your Slot</h3>
                  <p className="text-gray-400">Browse our 3000+ games across 30+ platforms and pick one that matches your style and budget.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Set Your Bet</h3>
                  <p className="text-gray-400">Adjust your bet size and number of paylines. Start small and increase as you win!</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Spin to Win</h3>
                  <p className="text-gray-400">Hit spin and watch the reels. Match symbols for instant wins and trigger bonus features!</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Cash Out</h3>
                  <p className="text-gray-400">Withdraw your winnings anytime with our fast, secure payout system.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Spin & Win?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get $2 Free + $10 Bonus on Your First Order!
            </p>
            <Link 
              to="/sign-up" 
              className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-5 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl"
            >
              Start Playing Slots Now
            </Link>
            <p className="text-white/80 mt-6 text-sm">
              🎰 3000+ Games • 🎁 Daily Bonuses • ⚡ Instant Payouts
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default SlotsPage;