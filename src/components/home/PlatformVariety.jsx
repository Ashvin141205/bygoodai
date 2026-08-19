import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';

const PlatformVariety = () => {
    return (
        <div 
            style={{
                backgroundColor: 'rgba(41, 10, 71, 0.41)'
            }}
            className="w-full py-16 px-4"
        >
                {/* Main Section */}
                <div className="text-center mb-12 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-oxanium">
                        ONE ACCOUNT. <span className="text-[#FFDD15]">30+ PLATFORMS.</span> <span className="text-[#FFDD15]">3000+ GAMES.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                        We're your gateway to all the platforms you already love - Orion Stars, Juwa, Fire Kirin, Milky Way, GameVault, Panda Master, and 24 more. One login, endless options.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
                    {/* Left Column - Main Message */}
                    <div className="bg-gradient-to-br from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-6 hover:border-[#FFDD15] transition-all duration-300">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-oxanium">
                            Why settle for one platform?
                        </h3>
                        <div className="space-y-3 text-gray-300 text-sm md:text-base leading-relaxed">
                            <p>
                                Different platforms = different games, different RTPs, different jackpots. Our users don't pick favorites - they play them all.
                            </p>
                            <p>
                                Whether you're into slots, fish games, table games, or arcade classics, having access to <span className="text-[#FFDD15] font-semibold">30+ platforms and 3000+ games</span> means you're never stuck with limited options.
                            </p>
                            <div className="bg-black/40 rounded-lg p-4 mt-4 border-l-4 border-[#FFDD15]">
                                <p className="text-white font-medium">
                                    Real talk: Each platform has its hot and cold streaks. Smart players spread their action across multiple platforms to catch the best moments.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Benefits */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-5 hover:border-[#FFDD15] transition-all duration-300">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#FFDD15] rounded-full p-2.5 flex-shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1.5 text-base font-oxanium">All Your Platforms in One Place</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        No more juggling accounts. Access every major platform from a single dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-5 hover:border-[#FFDD15] transition-all duration-300">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#FFDD15] rounded-full p-2.5 flex-shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1.5 text-base font-oxanium">Instant Platform Switching</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Move between games and platforms seamlessly. Your balance transfers in seconds.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#290A47] to-[#1a0628] border border-[#ffdc156c] rounded-lg p-5 hover:border-[#FFDD15] transition-all duration-300">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#FFDD15] rounded-full p-2.5 flex-shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1.5 text-base font-oxanium">Exclusive Access</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        These platforms aren't sold publicly. We're one of the few authorized distributors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default PlatformVariety;
