import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
// Corrected import path for Hero component
import Hero from '../../components/Hero'; // Adjusted from ../../../components/Hero
import GenericPageBg from '../../assets/image/blogBg.png'; // Assuming this path is correct from within src
import Leaderboard from './Leaderboard';

const ReferralProgram = () => {
    const canonicalUrl = "https://www.luckycharmsweep.com/referral/program"; // Replace with your actual domain
    const pageTitle = "Refer a Friend & Earn Rewards | Lucky Charm Sweep";
    const pageDescription = "Invite friends to Lucky Charm Sweep and earn $5 plus 10% of their deposit bonuses forever! Learn how our referral program works and start earning today.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/3565_Refer_a_Friend_2024_Hero_Article_Banner_Overlay_600x600px_5203edd9a2.png?updatedAt=1731174403680";

    return (
        <>
            <Helmet>
                {/* --- Primary Meta Tags --- */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* --- Open Graph / Facebook --- */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />

                {/* --- Twitter --- */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                {/* --- Optional: Additional Meta Tags --- */}
                <meta name="keywords" content="referral program, refer a friend, earn rewards, lucky charm sweep bonus, affiliate program, gaming referrals" />
                <meta name="author" content="Lucky Charm Sweep" />
            </Helmet>

            <Hero
                title={"REFER & EARN BIG"}
                bgImg={GenericPageBg}
                backgroundColor='#131A2A'
            />

            <div className="flex flex-col min-h-screen bg-[#131A2A] p-4 md:p-8 md:pt-10 md:pb-20">
                <div className="flex flex-col md:flex-row items-center md:space-x-8 bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10 shadow-lg">

                    {/* Image */}
                    <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                        <img
                            src="https://d1txq81lrc562k.cloudfront.net/3565_Refer_a_Friend_2024_Hero_Article_Banner_Overlay_600x600px_5203edd9a2.png?updatedAt=1731174403680"
                            alt="Lucky Charm Sweep Referral Program - Invite Friends and Earn"
                            className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg rounded-md"
                        />
                    </div>

                    {/* Text */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-[#FFD700] leading-tight">
                            Refer a Friend & Earn $5 + 10% Bonus Forever!
                        </h1>

                        <div className="text-[#CACACA] text-sm sm:text-base leading-relaxed space-y-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">How It Works</h2>
                                <p>
                                    Invite your friends who are not yet on the platform. You’ll receive <span className="font-semibold text-white">$5</span> and earn <span className="font-semibold text-white">10% of their deposit bonuses forever</span> for each friend who joins and makes a qualifying deposit.
                                </p>
                                <p className="font-semibold text-white">No invite limit = Unlimited earnings!</p>
                            </div>

                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">How Do I Receive the Money?</h2>
                                <p>
                                    Your referral bonuses go straight into your <span className="font-semibold text-white">Bonus Wallet</span>. You can withdraw through PayPal, CashApp, Chime, or crypto—easy and flexible.
                                </p>
                            </div>

                            <p>
                                Go to your <Link to="/user/referrals" className="font-bold text-white hover:text-[#FFDD15] underline">Referrals Tab</Link>, copy your unique referral code, and share it with your friends!
                            </p>
                        </div>

                        <Link
                            to="/user/referrals"
                            className="inline-block bg-[#FFDD15] text-black font-bold py-3 px-6 rounded-full text-center hover:bg-yellow-400 transition-colors duration-200 text-base sm:text-lg"
                        >
                            Get Your Referral Code Now!
                        </Link>
                        <p className="text-xs text-center text-gray-400 mt-2">
                            You need to be logged in to access your referral code.
                        </p>
                    </div>
                </div>

                {/* --- ADDED LEADERBOARD SECTION --- */}
                <Leaderboard />
                {/* --- END OF LEADERBOARD SECTION --- */}
                
            </div>
        </>
    );
};

export default ReferralProgram;