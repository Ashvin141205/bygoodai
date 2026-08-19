import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import BlogBg from '../assets/image/blogBg.png';
import PaymentIcon from '../assets/image/pay.png';
import SignupIcon from '../assets/image/logo.png';
import DepositIcon from '../assets/image/depositToGame.png';
import WalletIcon from '../assets/image/wallet.png';
import SEOComponent from '../components/Common/SEOComponent';

const HowToBuyGamingCredits = () => {
    const generateHowToSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Buy Gaming Credits Online",
            "description": "Complete step-by-step guide to purchasing gaming credits safely and securely online",
            "image": "https://d1txq81lrc562k.cloudfront.net/how-to-buy-gaming-credits.jpg",
            "totalTime": "PT5M",
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": "10.00"
            },
            "supply": [
                {
                    "@type": "HowToSupply",
                    "name": "Valid Payment Method"
                },
                {
                    "@type": "HowToSupply", 
                    "name": "Gaming Account"
                }
            ],
            "tool": [
                {
                    "@type": "HowToTool",
                    "name": "Computer or Mobile Device"
                }
            ],
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Create Account",
                    "text": "Sign up for a gaming account if you don't have one",
                    "url": "https://luckcharm.com/register"
                },
                {
                    "@type": "HowToStep",
                    "name": "Choose Gaming Platform",
                    "text": "Select your preferred gaming platform from our available options",
                    "url": "https://luckcharm.com/deposit"
                },
                {
                    "@type": "HowToStep",
                    "name": "Select Credit Amount",
                    "text": "Choose the amount of gaming credits you want to purchase"
                },
                {
                    "@type": "HowToStep",
                    "name": "Complete Payment",
                    "text": "Use secure payment methods to complete your purchase"
                },
                {
                    "@type": "HowToStep",
                    "name": "Receive Credits",
                    "text": "Gaming credits are instantly added to your account"
                }
            ]
        };
    };

    return (
        <>
            <SEOComponent
                title="How to Buy Gaming Credits Online - Complete Guide | LuckCharm"
                description="Learn how to buy gaming credits online safely and securely. Step-by-step guide with tips for choosing the best gaming platforms and payment methods."
                keywords="how to buy gaming credits, buy gaming credits online, secure gaming payments, gaming credit guide, online gaming purchases"
                ogType="article"
                structuredData={generateHowToSchema()}
            />
            
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(generateHowToSchema())}
                </script>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://luckcharm.com/how-to-buy-gaming-credits" />
                <meta property="article:published_time" content="2024-01-01T00:00:00Z" />
                <meta property="article:modified_time" content="2024-01-01T00:00:00Z" />
                <meta property="article:author" content="LuckCharm Gaming Team" />
                <meta property="article:section" content="Gaming Guides" />
                <meta property="article:tag" content="Gaming Credits, Online Gaming, Payment Guide" />
            </Helmet>

            <Hero bgImg={BlogBg} title={"How to Buy Gaming Credits Online"} />
            
            <div className="bg-[#0e0e0e] text-white min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-6 text-[#FFDD15]">
                            How to Buy Gaming Credits
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Start playing your favorite games in minutes. Our platform makes purchasing gaming credits 
                            simple, secure, and instant.
                        </p>
                    </div>

                    {/* Step by Step Process */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        <div className="text-center">
                            <div className="bg-[#1a1a1a] border border-[#FFDD15] rounded-xl p-6 mb-4">
                                <img src={SignupIcon} alt="Create Account" className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#FFDD15] mb-2">1. Sign Up</h3>
                                <p className="text-gray-300">Create your account in under 60 seconds</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-[#1a1a1a] border border-[#FFDD15] rounded-xl p-6 mb-4">
                                <img src={DepositIcon} alt="Choose Platform" className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#FFDD15] mb-2">2. Choose Platform</h3>
                                <p className="text-gray-300">Select from Orion Stars, Juwa, Milky Way & more</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-[#1a1a1a] border border-[#FFDD15] rounded-xl p-6 mb-4">
                                <img src={PaymentIcon} alt="Make Payment" className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#FFDD15] mb-2">3. Add Credits</h3>
                                <p className="text-gray-300">Choose amount and complete secure payment</p>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-[#1a1a1a] border border-[#FFDD15] rounded-xl p-6 mb-4">
                                <img src={WalletIcon} alt="Start Playing" className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#FFDD15] mb-2">4. Start Playing</h3>
                                <p className="text-gray-300">Credits added instantly - play right away!</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Steps */}
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#FFDD15]">Step-by-Step Guide</h2>
                        
                        <div className="space-y-8">
                            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 text-[#FFDD15]">Step 1: Create Your Account</h3>
                                <p className="text-gray-300 mb-4">
                                    Getting started is quick and easy. Just click "Sign Up" and provide your basic information. 
                                    We'll verify your account immediately so you can start playing.
                                </p>
                                <ul className="list-disc list-inside text-gray-300 space-y-2">
                                    <li>Valid email address required</li>
                                    <li>Choose a secure password</li>
                                    <li>Verify your phone number</li>
                                    <li>Account ready in under 2 minutes</li>
                                </ul>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 text-[#FFDD15]">Step 2: Browse Gaming Platforms</h3>
                                <p className="text-gray-300 mb-4">
                                    We offer access to the most popular gaming platforms. Each platform has different games 
                                    and features to match your gaming style.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                                    <div>• Orion Stars</div>
                                    <div>• Juwa</div>
                                    <div>• Milky Way</div>
                                    <div>• GameVault</div>
                                    <div>• Fire Kirin</div>
                                    <div>• Panda Master</div>
                                    <div>• River Sweeps</div>
                                    <div>• Many More!</div>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 text-[#FFDD15]">Step 3: Purchase Credits</h3>
                                <p className="text-gray-300 mb-4">
                                    Choose your credit amount and payment method. All transactions are encrypted and secure.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-yellow-300 mb-2">Credit Amounts:</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>$10 - Perfect for trying new games</li>
                                            <li>$25 - Most popular choice</li>
                                            <li>$50 - Extended gaming sessions</li>
                                            <li>$100+ - Maximum gaming experience</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-yellow-300 mb-2">Payment Options:</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>Credit & Debit Cards</li>
                                            <li>PayPal</li>
                                            <li>Cash App</li>
                                            <li>Cryptocurrency</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 text-[#FFDD15]">Step 4: Start Gaming</h3>
                                <p className="text-gray-300 mb-4">
                                    Once payment is confirmed, your credits are added instantly to your account. 
                                    No waiting, no delays - start playing immediately!
                                </p>
                                <div className="bg-[#0e0e0e] p-4 rounded border border-[#FFDD15]">
                                    <p className="text-[#FFDD15] font-semibold">
                                        💡 Your credits never expire and you can use them on any platform at any time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="mt-16 text-center bg-gradient-to-r from-[#FFDD15] to-yellow-400 text-black rounded-lg p-8">
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Gaming?</h2>
                            <p className="text-lg mb-6">
                                Join thousands of players already enjoying their favorite games on our platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a 
                                    href="/deposit" 
                                    className="bg-black text-[#FFDD15] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition"
                                >
                                    Browse Gaming Platforms
                                </a>
                                <a 
                                    href="/sign-up" 
                                    className="border-2 border-black text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-black hover:text-[#FFDD15] transition"
                                >
                                    Create Free Account
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowToBuyGamingCredits;