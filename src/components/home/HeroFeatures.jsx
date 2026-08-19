import React from 'react';
import { getImageUrl } from '../../utils/getImageUrl';

const HeroFeatures = () => {
    return (
        <div 
            style={{
                backgroundImage: `url('/sectionbg2.png')`,
                backgroundColor: '#290a4769',
                backgroundBlendMode: 'overlay'
            }}
            className="w-full py-16 px-4 bg-cover bg-center"
        >
                {/* Main Heading */}
                <div className="text-center mb-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-oxanium">
                        AMERICA'S #1 SOCIAL CASINO <span className="text-[#FFDD15]">EXPERIENCE</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Get ready for some serious fun and let the good times roll across any device
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Feature 1: No Money Down */}
                    <div className="bg-gradient-to-br from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-6 hover:border-[#FFDD15] transition-all duration-300">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-[#FFDD15] rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 text-center font-oxanium">
                            NO MONEY DOWN REQUIRED
                        </h3>
                        <p className="text-gray-300 text-center leading-relaxed">
                            Our games have never cost anything to enter. Thousands of dollars have been given away for free!
                        </p>
                    </div>

                    {/* Feature 2: Casino Games */}
                    <div className="bg-gradient-to-br from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-6 hover:border-[#FFDD15] transition-all duration-300">
                        <div className="mb-3">
                            <div className="w-14 h-14 bg-[#FFDD15] rounded-full flex items-center justify-center mb-3 mx-auto">
                                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 text-center font-oxanium">
                            FANTASTIC CASINO-STYLE GAMES
                        </h3>
                        <p className="text-gray-300 text-center leading-relaxed">
                            We provide a variety of slot games, table games, and fish games, with massive jackpots similar to those found in real casinos.
                        </p>
                    </div>

                    {/* Feature 3: Exclusive Offer */}
                    <div className="bg-gradient-to-br from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-6 hover:border-[#FFDD15] transition-all duration-300">
                        <div className="mb-3">
                            <div className="w-14 h-14 bg-[#FFDD15] rounded-full flex items-center justify-center mb-3 mx-auto">
                                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 text-center font-oxanium">
                            PRESENTING... AN EXCLUSIVE, FIRST-TIME OFFER
                        </h3>
                        <p className="text-gray-300 text-center leading-relaxed">
                            Take advantage of our exclusive $2 and $10 on first deposit bonus to try it before you commit.
                        </p>
                    </div>
                </div>
        </div>
    );
};

export default HeroFeatures;
