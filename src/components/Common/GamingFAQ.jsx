import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const GamingFAQ = ({ 
    customFAQs = [],
    showDefaultFAQs = true,
    pageType = 'gaming',
    includeSchema = true
}) => {
    const [openFAQ, setOpenFAQ] = useState(null);

    // Default gaming FAQs targeting competitive keywords
    const defaultGamingFAQs = [
        {
            question: "How do I buy gaming credits online safely?",
            answer: "Purchase gaming credits safely by using our secure platform with SSL encryption. We accept PayPal, major credit cards, and cryptocurrencies. All transactions are protected with bank-grade security, and credits are delivered instantly to your account.",
            keywords: "buy gaming credits, online gaming, secure gaming, gaming safety"
        },
        {
            question: "What are the best online gaming platforms for real money?",
            answer: "LuckCharm offers one of the best online gaming experiences with instant deposits, secure transactions, and amazing bonuses. Our platform features slot games, card games, and casino games with 24/7 support and proven payouts.",
            keywords: "best online gaming, real money gaming, gaming platforms, online casino"
        },
        {
            question: "How fast are gaming credit deposits?",
            answer: "Gaming credits are delivered instantly! Once your payment is confirmed through PayPal, credit card, or cryptocurrency, your credits appear in your account immediately. No waiting time required - start playing right away!",
            keywords: "instant gaming credits, fast deposits, gaming credits delivery, instant gaming"
        },
        {
            question: "What bonuses can I get for online gaming?",
            answer: "We offer multiple gaming bonuses including deposit bonuses up to 100%, weekly challenge rewards, registration bonuses for new players, game-specific bonuses, and crypto payment bonuses. Check our promotions page for current offers!",
            keywords: "gaming bonuses, deposit bonuses, gaming rewards, online gaming promotions"
        },
        {
            question: "Is online gaming legal and regulated?",
            answer: "Yes, online gaming is legal in many jurisdictions. LuckCharm operates under strict regulations with proper licensing. We ensure fair play, secure transactions, and responsible gaming practices for all our players.",
            keywords: "legal online gaming, regulated gaming, gaming license, safe gaming"
        },
        {
            question: "How do I win at online slot games?",
            answer: "While slot games are based on luck, you can maximize your chances by choosing games with high RTP rates, managing your bankroll wisely, taking advantage of bonuses, and playing responsibly. Start with smaller bets and gradually increase as you learn.",
            keywords: "win slot games, slot game strategy, online slots tips, slot game RTP"
        },
        {
            question: "What payment methods work best for gaming deposits?",
            answer: "PayPal offers the fastest and most secure gaming deposits with instant processing. Credit cards (Visa, Mastercard) are also quick and reliable. Cryptocurrency payments (Bitcoin, Litecoin) often come with bonus rewards and enhanced privacy.",
            keywords: "gaming payment methods, PayPal gaming, crypto gaming, secure deposits"
        },
        {
            question: "Can I play casino games on mobile devices?",
            answer: "Absolutely! Our gaming platform is fully optimized for mobile devices including smartphones and tablets. Play your favorite casino games, slots, and card games anywhere with seamless mobile gameplay and touch controls.",
            keywords: "mobile casino games, mobile gaming, mobile slots, responsive gaming"
        },
        {
            question: "How do I withdraw winnings from online gaming?",
            answer: "Withdrawing winnings is simple and secure. Request withdrawals through your account dashboard, choose your preferred method (PayPal, bank transfer, or crypto), and receive your funds within 24-48 hours after verification.",
            keywords: "withdraw gaming winnings, gaming payouts, withdrawal methods, gaming cashout"
        },
        {
            question: "What makes a gaming platform trustworthy?",
            answer: "Trustworthy gaming platforms feature SSL encryption, licensed operations, transparent terms, verified payment processors, positive user reviews, responsive customer support, and proven payout history. LuckCharm meets all these criteria.",
            keywords: "trustworthy gaming, reliable gaming platform, gaming security, safe online gaming"
        }
    ];

    const allFAQs = showDefaultFAQs ? [...defaultGamingFAQs, ...customFAQs] : customFAQs;

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    // Generate FAQ Schema for SEO
    const generateFAQSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": allFAQs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    };

    return (
        <>
            {includeSchema && (
                <Helmet>
                    <script type="application/ld+json">
                        {JSON.stringify(generateFAQSchema())}
                    </script>
                    <meta name="keywords" content={allFAQs.map(faq => faq.keywords).filter(Boolean).join(', ')} />
                </Helmet>
            )}

            <section className="bg-gray-900 py-12 px-4" id="gaming-faq">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-300 text-lg">
                            Get answers to common questions about online gaming, deposits, and our platform
                        </p>
                    </div>

                    <div className="space-y-4">
                        {allFAQs.map((faq, index) => (
                            <div 
                                key={index}
                                className="bg-[#1a1a1a] rounded-lg border border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#222222] transition-colors duration-200"
                                >
                                    <h3 className="text-white font-semibold text-lg pr-4">
                                        {faq.question}
                                    </h3>
                                    {openFAQ === index ? (
                                        <ChevronUpIcon className="h-5 w-5 text-[#FFDD15] flex-shrink-0" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>
                                
                                {openFAQ === index && (
                                    <div className="px-6 pb-4">
                                        <div className="border-t border-gray-700 pt-4">
                                            <p className="text-gray-300 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Additional SEO content */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm">
                            Have more questions about online gaming? Contact our 24/7 support team for instant assistance.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default GamingFAQ;