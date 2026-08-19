import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
    PlayIcon, 
    CurrencyDollarIcon, 
    ShieldCheckIcon, 
    GiftIcon,
    ClockIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const GamingContentHub = () => {
    // Generate comprehensive gaming content schema
    const generateContentHubSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Gaming Content Hub - Guides, Tips & Resources",
            "description": "Comprehensive gaming guides, tips, and resources for online gaming enthusiasts",
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "Article",
                            "name": "How to Get Started with Online Gaming",
                            "description": "Complete beginner's guide to online gaming",
                            "url": "https://luckcharm.com/guides/getting-started"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                            "@type": "Article",
                            "name": "Best Online Gaming Strategies",
                            "description": "Proven strategies for maximizing your gaming success",
                            "url": "https://luckcharm.com/guides/gaming-strategies"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "item": {
                            "@type": "Article",
                            "name": "Gaming Safety and Security Guide",
                            "description": "Essential security practices for safe online gaming",
                            "url": "https://luckcharm.com/guides/gaming-security"
                        }
                    }
                ]
            },
            "keywords": "online gaming guides, gaming tips, gaming strategies, gaming security, gaming resources"
        };
    };

    const gamingCategories = [
        {
            title: "Getting Started",
            description: "New to online gaming? Start here with our comprehensive beginner guides.",
            icon: PlayIcon,
            color: "bg-blue-600",
            articles: [
                { title: "How to Choose Your First Game", slug: "choose-first-game", readTime: "5 min" },
                { title: "Understanding Gaming Credits", slug: "gaming-credits-explained", readTime: "4 min" },
                { title: "Setting Up Your Gaming Account", slug: "setup-gaming-account", readTime: "6 min" },
                { title: "Making Your First Deposit", slug: "first-deposit-guide", readTime: "7 min" }
            ]
        },
        {
            title: "Gaming Strategies",
            description: "Advanced tips and strategies to improve your gaming performance.",
            icon: StarIcon,
            color: "bg-yellow-600",
            articles: [
                { title: "Bankroll Management for Gamers", slug: "bankroll-management", readTime: "8 min" },
                { title: "When to Increase Your Bets", slug: "betting-strategies", readTime: "6 min" },
                { title: "Understanding Game Odds", slug: "game-odds-explained", readTime: "5 min" },
                { title: "Maximizing Bonus Opportunities", slug: "bonus-strategies", readTime: "7 min" }
            ]
        },
        {
            title: "Safety & Security",
            description: "Learn how to protect yourself and game safely online.",
            icon: ShieldCheckIcon,
            color: "bg-green-600",
            articles: [
                { title: "Recognizing Secure Gaming Sites", slug: "secure-gaming-sites", readTime: "6 min" },
                { title: "Payment Security Best Practices", slug: "payment-security", readTime: "5 min" },
                { title: "Responsible Gaming Guidelines", slug: "responsible-gaming", readTime: "8 min" },
                { title: "Account Protection Tips", slug: "account-protection", readTime: "4 min" }
            ]
        },
        {
            title: "Bonuses & Promotions",
            description: "Make the most of available bonuses and promotional offers.",
            icon: GiftIcon,
            color: "bg-purple-600",
            articles: [
                { title: "Types of Gaming Bonuses Explained", slug: "bonus-types", readTime: "7 min" },
                { title: "How to Claim Welcome Bonuses", slug: "welcome-bonuses", readTime: "5 min" },
                { title: "Understanding Wagering Requirements", slug: "wagering-requirements", readTime: "6 min" },
                { title: "VIP and Loyalty Programs", slug: "vip-programs", readTime: "8 min" }
            ]
        },
        {
            title: "Payment Methods",
            description: "Everything you need to know about deposits and withdrawals.",
            icon: CurrencyDollarIcon,
            color: "bg-red-600",
            articles: [
                { title: "PayPal Gaming Deposits Guide", slug: "paypal-deposits", readTime: "4 min" },
                { title: "Cryptocurrency Gaming Payments", slug: "crypto-payments", readTime: "9 min" },
                { title: "Credit Card Gaming Deposits", slug: "credit-card-deposits", readTime: "5 min" },
                { title: "Fast Withdrawal Methods", slug: "fast-withdrawals", readTime: "6 min" }
            ]
        },
        {
            title: "Game Guides",
            description: "Specific guides for popular gaming platforms and games.",
            icon: ClockIcon,
            color: "bg-indigo-600",
            articles: [
                { title: "Slot Games: Tips for Beginners", slug: "slot-games-guide", readTime: "10 min" },
                { title: "Card Games Strategy Guide", slug: "card-games-strategy", readTime: "12 min" },
                { title: "Casino Games Rules & Tips", slug: "casino-games-rules", readTime: "15 min" },
                { title: "Mobile Gaming Optimization", slug: "mobile-gaming-tips", readTime: "6 min" }
            ]
        }
    ];

    return (
        <>
            <Helmet>
                <title>Gaming Content Hub - Guides, Tips & Resources | LuckCharm Gaming</title>
                <meta name="description" content="Comprehensive gaming guides, strategies, and resources for online gaming enthusiasts. Learn how to play, win, and stay safe while gaming online." />
                <meta name="keywords" content="gaming guides, online gaming tips, gaming strategies, gaming resources, gaming tutorials, gaming safety, gaming bonuses, gaming security" />
                <script type="application/ld+json">
                    {JSON.stringify(generateContentHubSchema())}
                </script>
                <link rel="canonical" href="https://luckcharm.com/gaming-hub" />
            </Helmet>

            <section className="bg-gray-900 py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Gaming Content Hub
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                            Your complete resource for online gaming guides, strategies, tips, and best practices. 
                            From beginner basics to advanced techniques, we've got you covered.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center">
                                <PlayIcon className="w-5 h-5 mr-2 text-blue-400" />
                                50+ Gaming Guides
                            </span>
                            <span className="flex items-center">
                                <StarIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                Expert Tips & Strategies
                            </span>
                            <span className="flex items-center">
                                <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-400" />
                                Safety & Security Focus
                            </span>
                        </div>
                    </div>

                    {/* Gaming Categories Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gamingCategories.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <div 
                                    key={index}
                                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`${category.color} p-3 rounded-lg mr-4`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            {category.title}
                                        </h3>
                                    </div>
                                    
                                    <p className="text-gray-300 mb-6 leading-relaxed">
                                        {category.description}
                                    </p>

                                    <div className="space-y-3">
                                        {category.articles.map((article, articleIndex) => (
                                            <Link
                                                key={articleIndex}
                                                to={`/guides/${article.slug}`}
                                                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-white font-medium text-sm">
                                                        {article.title}
                                                    </h4>
                                                    <span className="text-gray-400 text-xs flex items-center">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        {article.readTime}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <Link
                                            to={`/guides/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center"
                                        >
                                            View All {category.title} Guides
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Access Section */}
                    <div className="mt-16 bg-gray-800 rounded-xl p-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            Quick Access Gaming Resources
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link
                                to="/deposit"
                                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200"
                            >
                                Start Gaming Now
                            </Link>
                            <Link
                                to="/games"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200"
                            >
                                Browse All Games
                            </Link>
                            <Link
                                to="/bonuses"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200"
                            >
                                Current Bonuses
                            </Link>
                            <Link
                                to="/support"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200"
                            >
                                Get Support
                            </Link>
                        </div>
                    </div>

                    {/* SEO Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm leading-relaxed max-w-4xl mx-auto">
                            Our gaming content hub is regularly updated with the latest strategies, tips, and industry insights. 
                            Whether you're interested in <strong className="text-white">online casino games</strong>, <strong className="text-white">slot machine strategies</strong>, 
                            <strong className="text-white"> card game tips</strong>, or <strong className="text-white">secure gaming practices</strong>, 
                            you'll find expert guidance to enhance your gaming experience and improve your chances of success.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default GamingContentHub;