import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    CursorArrowRaysIcon, 
    CreditCardIcon, 
    ShoppingCartIcon, 
    CheckCircleIcon,
    PlayIcon,
    GiftIcon
} from '@heroicons/react/24/outline';

const GamingHowTo = ({ 
    tutorialType = 'buy-credits',
    customSteps = [],
    showDefaultGuides = true 
}) => {
    // Different gaming tutorials targeting various keywords
    const tutorials = {
        'buy-credits': {
            title: "How to Buy Gaming Credits Online",
            description: "Complete step-by-step guide to purchasing gaming credits safely and securely",
            totalTime: "PT5M",
            estimatedCost: "10",
            keywords: "buy gaming credits, how to buy credits, gaming credits guide, secure gaming purchases",
            steps: [
                {
                    title: "Choose Your Gaming Platform",
                    description: "Select from our wide variety of gaming platforms including slots, casino games, and card games. Each platform offers unique features and gaming experiences.",
                    icon: CursorArrowRaysIcon,
                    tips: "Look for games with high ratings and good reviews from other players."
                },
                {
                    title: "Select Credit Amount",
                    description: "Choose the amount of gaming credits you want to purchase. Start with smaller amounts if you're new to online gaming.",
                    icon: CreditCardIcon,
                    tips: "Consider starting with $10-20 to test the platform before making larger deposits."
                },
                {
                    title: "Add to Shopping Cart",
                    description: "Click 'Add to Cart' to add your selected credits to your shopping cart. You can add multiple games or credit amounts.",
                    icon: ShoppingCartIcon,
                    tips: "Check for available bonuses or promotional offers before adding to cart."
                },
                {
                    title: "Proceed to Secure Checkout",
                    description: "Review your order details and proceed to our secure checkout system. All transactions are protected with SSL encryption.",
                    icon: CheckCircleIcon,
                    tips: "Double-check your order details and apply any promo codes you have."
                },
                {
                    title: "Complete Payment",
                    description: "Choose your preferred payment method (PayPal, credit card, or cryptocurrency) and complete your secure transaction.",
                    icon: GiftIcon,
                    tips: "PayPal payments are usually the fastest, while crypto payments often come with bonuses."
                },
                {
                    title: "Start Playing Instantly",
                    description: "Your gaming credits will be delivered instantly to your account. Start playing your favorite games right away!",
                    icon: PlayIcon,
                    tips: "Check your account balance and explore different games to find your favorites."
                }
            ]
        },
        'win-slots': {
            title: "How to Maximize Your Wins in Online Slot Games",
            description: "Professional strategies and tips to improve your slot game performance",
            totalTime: "PT10M",
            estimatedCost: "20",
            keywords: "how to win slots, slot game strategy, online slots tips, slot machine guide",
            steps: [
                {
                    title: "Choose High RTP Slot Games",
                    description: "Select slot games with Return to Player (RTP) rates above 96%. Higher RTP means better long-term winning potential.",
                    icon: CursorArrowRaysIcon,
                    tips: "Look for RTP information in game details or ask customer support."
                },
                {
                    title: "Start with Free Play Mode",
                    description: "Practice with free play or demo modes to understand game mechanics, paylines, and bonus features before using real credits.",
                    icon: PlayIcon,
                    tips: "Spend at least 15-20 minutes learning each game's unique features."
                },
                {
                    title: "Set Your Budget and Limits",
                    description: "Establish clear spending limits and stick to them. Never gamble more than you can afford to lose.",
                    icon: CreditCardIcon,
                    tips: "Use deposit limits and session time limits to maintain responsible gaming."
                },
                {
                    title: "Take Advantage of Bonuses",
                    description: "Utilize welcome bonuses, deposit bonuses, and free spins to maximize your playing time and winning opportunities.",
                    icon: GiftIcon,
                    tips: "Read bonus terms carefully and understand wagering requirements."
                },
                {
                    title: "Use Betting Strategies",
                    description: "Consider betting strategies like starting small and gradually increasing bets after wins, or using the 1% rule.",
                    icon: CheckCircleIcon,
                    tips: "Adjust bet sizes based on your bankroll and game volatility."
                },
                {
                    title: "Know When to Stop",
                    description: "Set win and loss limits. Stop playing when you reach either limit to protect your bankroll and secure profits.",
                    icon: CheckCircleIcon,
                    tips: "Take regular breaks and never chase losses with bigger bets."
                }
            ]
        },
        'secure-gaming': {
            title: "How to Ensure Safe and Secure Online Gaming",
            description: "Essential security measures for protecting yourself while gaming online",
            totalTime: "PT8M",
            estimatedCost: "0",
            keywords: "secure online gaming, gaming safety, safe gaming practices, online gaming security",
            steps: [
                {
                    title: "Choose Licensed Gaming Platforms",
                    description: "Only play on licensed and regulated gaming platforms with proper certifications and positive reviews.",
                    icon: CheckCircleIcon,
                    tips: "Look for licensing information in the website footer or about page."
                },
                {
                    title: "Verify SSL Security",
                    description: "Ensure the gaming website uses SSL encryption (look for 'https://' and the padlock icon in your browser).",
                    icon: CheckCircleIcon,
                    tips: "Never enter personal or payment information on non-secure websites."
                },
                {
                    title: "Use Secure Payment Methods",
                    description: "Use reputable payment methods like PayPal, major credit cards, or established cryptocurrency wallets.",
                    icon: CreditCardIcon,
                    tips: "Avoid sharing banking details directly; use trusted payment processors."
                },
                {
                    title: "Enable Account Security Features",
                    description: "Set up strong passwords, enable two-factor authentication, and regularly monitor your account activity.",
                    icon: CheckCircleIcon,
                    tips: "Use unique passwords and never share your account credentials."
                },
                {
                    title: "Read Terms and Conditions",
                    description: "Understand the platform's terms, withdrawal policies, and responsible gaming features before playing.",
                    icon: CursorArrowRaysIcon,
                    tips: "Pay special attention to withdrawal limits and verification requirements."
                },
                {
                    title: "Monitor Your Gaming Activity",
                    description: "Keep track of your deposits, bets, and time spent gaming. Use platform tools for responsible gaming.",
                    icon: CheckCircleIcon,
                    tips: "Set up deposit limits and self-exclusion options if needed."
                }
            ]
        }
    };

    const currentTutorial = tutorials[tutorialType] || tutorials['buy-credits'];
    const steps = customSteps.length > 0 ? customSteps : currentTutorial.steps;

    // Generate HowTo Schema
    const generateHowToSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": currentTutorial.title,
            "description": currentTutorial.description,
            "image": `https://luckcharm.com/tutorials/${tutorialType}-guide.jpg`,
            "totalTime": currentTutorial.totalTime,
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": currentTutorial.estimatedCost
            },
            "supply": [
                {
                    "@type": "HowToSupply",
                    "name": "Internet connection"
                },
                {
                    "@type": "HowToSupply",
                    "name": "Valid payment method"
                },
                {
                    "@type": "HowToSupply",
                    "name": "Computer or mobile device"
                }
            ],
            "tool": [
                {
                    "@type": "HowToTool",
                    "name": "Web browser"
                },
                {
                    "@type": "HowToTool",
                    "name": "Payment method (PayPal, Credit Card, or Crypto wallet)"
                }
            ],
            "step": steps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "name": step.title,
                "text": step.description,
                "image": `https://luckcharm.com/tutorial-steps/step-${index + 1}.jpg`
            }))
        };
    };

    return (
        <>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(generateHowToSchema())}
                </script>
                <meta name="keywords" content={currentTutorial.keywords} />
                <meta name="description" content={currentTutorial.description} />
                <title>{currentTutorial.title} | LuckCharm Gaming Guide</title>
            </Helmet>

            <section className="bg-gray-900 py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {currentTutorial.title}
                        </h1>
                        <p className="text-gray-300 text-lg mb-6">
                            {currentTutorial.description}
                        </p>
                        <div className="flex justify-center space-x-6 text-sm text-gray-400">
                            <span>⏱️ {currentTutorial.totalTime.replace('PT', '').replace('M', ' minutes')}</span>
                            <span>💰 Starting from ${currentTutorial.estimatedCost}</span>
                            <span>📱 Works on all devices</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div 
                                    key={index}
                                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                                                {IconComponent && <IconComponent className="w-6 h-6 mr-2 text-yellow-500" />}
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-300 mb-3 leading-relaxed">
                                                {step.description}
                                            </p>
                                            {step.tips && (
                                                <div className="bg-gray-700 rounded-lg p-3 border-l-4 border-yellow-500">
                                                    <p className="text-yellow-200 text-sm">
                                                        <strong>💡 Pro Tip:</strong> {step.tips}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-3">
                            Ready to Start Gaming?
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Follow this guide and start your gaming journey with confidence!
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                                Start Gaming Now
                            </button>
                            <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default GamingHowTo;