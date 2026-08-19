import React from 'react';

const DepositIntro = () => {
    return (
        <div className="bg-gradient-to-b from-[#0e0e0e] to-[#1a0a0a] py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#FFDD15] mb-4 font-oxanium uppercase">
                        🎯 Claim Your Instant $10!
                    </h1>
                    <p className="text-xl md:text-2xl text-white font-semibold mb-2">
                        Join Now and Start Your Winning Journey With Us!
                    </p>
                    <p className="text-lg text-gray-300">
                        One Deposit. Multiple Platforms. Endless Possibilities.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-[#290A47] to-[#1a0628] border-2 border-[#FFDD15] rounded-lg p-8 shadow-2xl">
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-200 text-lg leading-relaxed">
                                Welcome to the ultimate gaming advantage! With Lucky Charm Sweep, you're not just making a deposit - 
                                you're unlocking access to <span className="text-[#FFDD15] font-bold">30+ premium gaming platforms</span> including 
                                highly famous names like <span className="text-white font-semibold">Orion Stars, Juwa, Fire Kirin, Milky Way, GameVault, Panda Master</span> and more, 
                                with over <span className="text-[#FFDD15] font-bold">3000+ exclusive games</span> that most players never even know exist.
                            </p>
                        </div>

                        <hr className="border-[#FFDD15]/30" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#FFDD15] mb-2">3000+</div>
                                <p className="text-white font-semibold">Games to Explore</p>
                                <p className="text-gray-400 text-sm mt-1">Slots, Fish, Table, Keno & More</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#FFDD15] mb-2">30+</div>
                                <p className="text-white font-semibold">Premium Platforms</p>
                                <p className="text-gray-400 text-sm mt-1">Famous brands, unique RTP rates</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#FFDD15] mb-2">24/7</div>
                                <p className="text-white font-semibold">Instant Support</p>
                                <p className="text-gray-400 text-sm mt-1">We're here when you win</p>
                            </div>
                        </div>

                        <hr className="border-[#FFDD15]/30" />

                        <div className="bg-gradient-to-r from-[#1a0628] to-[#290A47] rounded-lg p-6 border border-[#FFDD15]/30">
                            <h3 className="text-xl font-bold text-[#FFDD15] mb-4 text-center">🎮 Explore Every Game Category</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🎯</div>
                                    <p className="text-white font-semibold text-sm">Keno</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🎰</div>
                                    <p className="text-white font-semibold text-sm">Slots</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🐠</div>
                                    <p className="text-white font-semibold text-sm">Fish Games</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🎮</div>
                                    <p className="text-white font-semibold text-sm">Arcade Games</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🎲</div>
                                    <p className="text-white font-semibold text-sm">Table Games</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-3 text-center hover:bg-black/50 transition-all">
                                    <div className="text-2xl mb-1">🎱</div>
                                    <p className="text-white font-semibold text-sm">Bingo</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-center text-sm mt-4">Plus Roulette, Crash Games, and many more exciting options!</p>
                        </div>

                        <hr className="border-[#FFDD15]/30" />

                        {/* The Smart Player's Strategy */
                        <div className="bg-black/40 rounded-lg p-6 border border-[#FFDD15]/20">
                            <h3 className="text-xl font-bold text-[#FFDD15] mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                The Smart Player&apos;s Strategy
                            </h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#FFDD15] font-bold flex-shrink-0">&#10003;</span>
                                    <span><strong className="text-white">Diversify Your Play:</strong> Each platform has different game mechanics and RTP rates. Find the ones that work best for your playing style.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#FFDD15] font-bold flex-shrink-0">&#10003;</span>
                                    <span><strong className="text-white">Maximize Opportunities:</strong> With 3000+ games across 30+ platforms, you have significantly better odds of hitting big wins compared to single-platform players.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#FFDD15] font-bold flex-shrink-0">&#10003;</span>
                                    <span><strong className="text-white">VIP Access:</strong> These are off-market platforms that require a trusted distributor. You can&apos;t access them anywhere else!</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#FFDD15] font-bold flex-shrink-0">&#10003;</span>
                                    <span><strong className="text-white">One Simple Deposit:</strong> Fund your account once and play across ALL platforms seamlessly.</span>
                                </li>
                            </ul>
                        </div>
}
                        {/* Closing Statement */}
                        <div className="text-center pt-4">
                            <p className="text-2xl font-bold text-white mb-2 font-oxanium">
                                Don&apos;t Just Play. Play Smart. Play Everywhere.
                            </p>
                            <p className="text-[#FFDD15] text-lg font-semibold">
                                Lucky Charm Sweep - Your Gateway to Gaming Wealth &#128176;
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bonus Reminder */}
                <div className="mt-6 bg-gradient-to-r from-[#FFDD15] to-[#DAA520] rounded-lg p-4 text-center">
                    <p className="text-black font-bold text-lg">
                        &#127873; Don&apos;t Forget: Get $2 Free + $10 Bonus on Your First Deposit!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepositIntro;
