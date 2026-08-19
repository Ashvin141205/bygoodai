import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import BlogBg from '../assets/image/blogBg.png';
import SEOComponent from '../components/Common/SEOComponent';
import GamingFAQ from '../components/Common/GamingFAQ';

const GamingFAQPage = () => {
    return (
        <>
            <SEOComponent
                title="Gaming Credits FAQ - Frequently Asked Questions | LuckCharm"
                description="Find answers to the most frequently asked questions about buying gaming credits, account management, payment methods, and platform features."
                keywords="gaming credits FAQ, gaming questions, online gaming help, gaming credit support, payment questions"
                ogType="article"
            />
            
            <Helmet>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://luckycharmsweep.com/gaming-faq" />
                <meta property="article:published_time" content="2024-01-01T00:00:00Z" />
                <meta property="article:modified_time" content="2024-01-01T00:00:00Z" />
                <meta property="article:author" content="LuckCharm Support Team" />
                <meta property="article:section" content="Gaming Support" />
                <meta property="article:tag" content="FAQ, Gaming Credits, Support" />
            </Helmet>

            <Hero bgImg={BlogBg} title={"Gaming Credits FAQ"} />
            
            <div className="bg-[#0e0e0e] text-white min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <article className="prose prose-lg prose-invert max-w-none">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-4 text-yellow-500">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Get instant answers to the most common questions about gaming credits, 
                                our platform features, payment methods, and account management. 
                                If you can't find what you're looking for, our 24/7 support team is here to help.
                            </p>
                        </div>

                        <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#FFDD15] rounded-lg">
                            <h2 className="text-2xl font-bold mb-4 text-[#FFDD15]">Need Immediate Help?</h2>
                            <p className="mb-4 text-gray-300">
                                Our support team is available 24/7 to assist you with any questions or concerns.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a 
                                    href="/support" 
                                    className="bg-[#FFDD15] text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition text-center"
                                >
                                    Contact Support
                                </a>
                                <a 
                                    href="/contact-us" 
                                    className="border-2 border-[#FFDD15] text-[#FFDD15] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFDD15] hover:text-black transition text-center"
                                >
                                    Live Chat
                                </a>
                            </div>
                        </div>

                        {/* Include the comprehensive FAQ component */}
                        <GamingFAQ 
                            showDefaultFAQs={true}
                            customFAQs={[
                                {
                                    question: "What makes your platform different from others?",
                                    answer: "We focus on providing a safe, secure, and entertaining gaming experience with instant credit delivery, 24/7 support, and a wide variety of gaming platforms to choose from.",
                                    keywords: "platform features, gaming experience, secure gaming"
                                },
                                {
                                    question: "Do you offer any bonuses or promotions?",
                                    answer: "Yes! We regularly offer welcome bonuses, deposit bonuses, weekly challenges, and special promotional events. Check our promotions page for current offers.",
                                    keywords: "bonuses, promotions, gaming rewards"
                                },
                                {
                                    question: "How do I manage my gaming budget responsibly?",
                                    answer: "We provide various responsible gaming tools including deposit limits, session time limits, and self-exclusion options. We encourage all players to set limits and play within their means.",
                                    keywords: "responsible gaming, budget management, gaming limits"
                                },
                                {
                                    question: "Can I play on mobile devices?",
                                    answer: "Absolutely! Our platform is fully optimized for mobile devices, allowing you to enjoy gaming on smartphones and tablets with the same great experience as desktop.",
                                    keywords: "mobile gaming, responsive design, mobile optimization"
                                }
                            ]}
                        />
                    </article>
                </div>
            </div>
        </>
    );
};

export default GamingFAQPage;