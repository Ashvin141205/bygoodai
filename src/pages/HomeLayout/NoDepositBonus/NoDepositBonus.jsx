import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Gift, Zap, Shield, DollarSign, Star } from 'lucide-react';
import Hero from '../../../components/Hero';
import BonusBg from '../../../assets/image/blogBg.png';

const NoDepositBonus = () => {
  const bonusFeatures = [
    {
      icon: <Gift className="w-8 h-8 text-yellow-400" />,
      title: "$2 Free Play",
      description: "Get $2 instantly just for signing up - no deposit required!"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-yellow-400" />,
      title: "$10 Deposit Bonus",
      description: "Get $10 bonus added on your first order!"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Instant Access",
      description: "Play immediately after registration on all platforms"
    },
    {
      icon: <Shield className="w-8 h-8 text-yellow-400" />,
      title: "100% Safe & Secure",
      description: "Licensed and regulated sweepstakes casino"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up Free",
      description: "Create your account in under 2 minutes"
    },
    {
      step: "2",
      title: "Get Your Bonus",
      description: "Receive $2 free play instantly"
    },
    {
      step: "3",
      title: "Start Playing",
      description: "Choose from Orion Stars, Juwa, Milky Way & more"
    },
    {
      step: "4",
      title: "Win Real Prizes",
      description: "Cash out your winnings anytime"
    }
  ];

  const popularGames = [
    "Orion Stars",
    "Juwa",
    "Milky Way",
    "GameVault",
    "Fire Kirin",
    "Panda Master"
  ];

  return (
    <>
      <Helmet>
        <title>No Deposit Bonus - Get $2 Free at Lucky Charms Sweepstakes Casino</title>
        <meta name="description" content="Claim your $2 no deposit bonus at Lucky Charms Sweepstakes Casino! Plus get $10 on your first deposit. No credit card required. Play Orion Stars, Juwa & more instantly!" />
        <link rel="canonical" href="https://www.luckycharmsweep.com/deposit-bonus" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.luckycharmsweep.com/deposit-bonus" />
        <meta property="og:title" content="$2 No Deposit Bonus - Lucky Charms Sweepstakes Casino" />
        <meta property="og:description" content="Get $2 free play + $10 deposit match! No credit card needed. Join thousands of winners at the most trusted sweepstakes casino." />
        <meta property="og:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="$2 No Deposit Bonus - Lucky Charms Casino" />
        <meta name="twitter:description" content="Get $2 free + $10 deposit bonus! No credit card required." />
        <meta name="twitter:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        <meta name="keywords" content="no deposit bonus, lucky charms casino no deposit bonus, free casino bonus, sweepstakes casino bonus, $2 free play, no deposit sweepstakes, lucky charms sweepstakes casino no deposit bonus" />
      </Helmet>

      <div style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }} className="min-h-screen">
        <Hero 
          bgImg={BonusBg} 
          title={"DEPOSIT BONUS"} 
          tagline="Get $2 Free + $10 Bonus on Your First Order!"
          backgroundColor='#290A47'
        />
        <div className="text-white">

        {/* How It Works */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400">
              How to Claim Your No Deposit Bonus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-yellow-500 text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link 
                to="/sign-up" 
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all"
              >
                Start Playing Now - Get $2 Free
              </Link>
            </div>
          </div>
        </section>

        {/* Available Games */}
        <section className="py-16 px-4 bg-gray-900/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-yellow-400">
              Play These Popular Games with Your Bonus
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {popularGames.map((game, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/30 rounded-lg p-4 text-center font-semibold hover:border-yellow-500 transition-all"
                >
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  {game}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/games" className="text-yellow-400 hover:text-yellow-300 font-semibold underline">
                View All Games →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-400">
              No Deposit Bonus FAQ
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">Is the $2 bonus really free?</h3>
                <p className="text-gray-300">
                  Yes! You get $2 instantly just for signing up. No deposit or credit card required.
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">Can I withdraw my winnings from the no deposit bonus?</h3>
                <p className="text-gray-300">
                  Yes! Any winnings from your $2 free play can be withdrawn after you make your first deposit and meet the minimum withdrawal requirements.
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">What is the $10 deposit bonus?</h3>
                <p className="text-gray-300">
                  When you make your first deposit order, you get a $10 bonus added to your account!
                </p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">Is this legal in the USA?</h3>
                <p className="text-gray-300">
                  Yes! Lucky Charms Sweepstakes Casino operates legally in most US states. We're a licensed sweepstakes casino platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-600 to-yellow-500">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
              Ready to Claim Your Free $2 Bonus?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join thousands of players winning real cash prizes every day!
            </p>
            <Link 
              to="/sign-up" 
              className="inline-block bg-black hover:bg-gray-900 text-yellow-400 font-bold py-5 px-12 rounded-full text-xl transition-all transform hover:scale-105 shadow-2xl"
            >
              Sign Up & Get $2 Free Now
            </Link>
            <p className="text-black/70 mt-6 text-sm">
              No credit card • Instant bonus • Safe & secure
            </p>
          </div>
        </section>
        </div>
      </div>
    </>
  );
};

export default NoDepositBonus;