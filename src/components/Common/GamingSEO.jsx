import React from 'react';
import { Helmet } from 'react-helmet-async';

const GamingSEO = ({ 
    gameData = {}, 
    pageType = 'gaming', 
    includeGameSchema = true,
    includeFAQ = false,
    includeHowTo = false 
}) => {
    // Enhanced gaming-specific keywords
    const generateGamingKeywords = () => {
        const baseKeywords = [
            'online gaming',
            'casino games',
            'slot games', 
            'card games',
            'gaming credits',
            'digital gaming',
            'instant gaming',
            'gaming platform',
            'online casino',
            'gaming tokens',
            'virtual gaming',
            'gaming deposits',
            'secure gaming',
            'gaming bonuses',
            'gaming rewards'
        ];

        if (gameData.game_name) {
            const gameSpecific = [
                `${gameData.game_name} game`,
                `${gameData.game_name} online`,
                `${gameData.game_name} credits`,
                `${gameData.game_name} tokens`,
                `play ${gameData.game_name}`,
                `${gameData.game_name} gaming`,
                `${gameData.game_name} casino`,
                `${gameData.game_name} slots`
            ];
            return [...baseKeywords, ...gameSpecific].join(', ');
        }

        return baseKeywords.join(', ');
    };

    // VideoGame and SoftwareApplication schema for gaming SEO
    const generateGamingSchema = () => {
        if (!includeGameSchema || !gameData.game_name) return null;

        return {
            "@context": "https://schema.org",
            "@type": ["VideoGame", "SoftwareApplication", "Product"],
            "name": gameData.game_name,
            "description": `Experience ${gameData.game_name} - Premium online gaming with instant deposits, secure transactions, and exciting gameplay. Join thousands of players worldwide!`,
            "applicationCategory": "GameApplication",
            "operatingSystem": ["Windows", "macOS", "iOS", "Android", "Web Browser"],
            "gamePlatform": ["PC", "Mobile", "Tablet", "Web"],
            "genre": ["Casino Games", "Slots", "Card Games", "Table Games"],
            "playMode": ["SinglePlayer", "MultiPlayer"],
            "contentRating": "18+",
            "offers": {
                "@type": "Offer",
                "price": gameData.game_price || "10.00",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2025-12-31",
                "validFrom": new Date().toISOString(),
                "seller": {
                    "@type": "Organization",
                    "name": "LuckCharm Gaming",
                    "url": "https://luckcharm.com"
                },
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "US"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 0,
                            "unitCode": "MIN"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 0,
                            "unitCode": "MIN"
                        }
                    },
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "0.00",
                        "currency": "USD"
                    }
                },
                "hasMerchantReturnPolicy": {
                    "@type": "MerchantReturnPolicy",
                    "applicableCountry": "US",
                    "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
                    "merchantReturnDays": 0
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "3247",
                "bestRating": "5",
                "worstRating": "1"
            },
            "review": [
                {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Verified Player"
                    },
                    "reviewBody": `Amazing experience with ${gameData.game_name || 'this game'}! Fast payouts and excellent gameplay.`,
                    "datePublished": "2025-01-15"
                },
                {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "4.5",
                        "bestRating": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Gaming Enthusiast"
                    },
                    "reviewBody": "Great platform with instant deposits. Highly recommended!",
                    "datePublished": "2025-02-20"
                }
            ],
            "gameLocation": "Online",
            "numberOfPlayers": "1+",
            "quest": `Win big playing ${gameData.game_name}`,
            "characterAttribute": "Luck",
            "gameItem": "Gaming Credits",
            "keywords": generateGamingKeywords(),
            "image": gameData.game_image || "https://luckcharm.com/default-game.jpg",
            "url": `https://luckcharm.com/games/${gameData.game_name?.toLowerCase().replace(/\s+/g, '-')}`,
            "sameAs": [
                "https://facebook.com/luckcharmgaming",
                "https://twitter.com/luckcharmgaming",
                "https://instagram.com/luckcharmgaming"
            ]
        };
    };

    // FAQ Schema for "People Also Ask" sections
    const generateFAQSchema = () => {
        if (!includeFAQ) return null;

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "How do I buy gaming credits?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "You can purchase gaming credits instantly through our secure platform. Simply select your preferred game, choose the credit amount, and complete payment via PayPal, credit card, or cryptocurrency."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Are gaming credits delivered instantly?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! All gaming credits are delivered instantly to your account upon successful payment confirmation. No waiting time required."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What payment methods do you accept?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "We accept PayPal, major credit cards (Visa, Mastercard, American Express), and cryptocurrencies including Bitcoin, Litecoin, and Dogecoin."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is it safe to buy gaming credits online?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Absolutely! We use bank-grade SSL encryption and secure payment processors. All transactions are protected and your personal information is never stored or shared."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Can I get bonuses on my gaming deposits?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! We offer various bonuses including deposit bonuses, weekly challenges, registration bonuses, and game-specific rewards to maximize your gaming experience."
                    }
                }
            ]
        };
    };

    // HowTo Schema for gaming guides
    const generateHowToSchema = () => {
        if (!includeHowTo) return null;

        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Buy Gaming Credits Online",
            "description": "Step-by-step guide to purchasing gaming credits safely and securely",
            "image": "https://luckcharm.com/how-to-buy-credits.jpg",
            "totalTime": "PT5M",
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": "10"
            },
            "supply": [
                {
                    "@type": "HowToSupply",
                    "name": "Valid payment method"
                },
                {
                    "@type": "HowToSupply", 
                    "name": "Internet connection"
                }
            ],
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "Select Game",
                    "text": "Choose your preferred gaming platform from our selection",
                    "image": "https://luckcharm.com/step1-select-game.jpg"
                },
                {
                    "@type": "HowToStep",
                    "name": "Choose Credit Amount",
                    "text": "Select the amount of gaming credits you want to purchase",
                    "image": "https://luckcharm.com/step2-choose-amount.jpg"
                },
                {
                    "@type": "HowToStep",
                    "name": "Add to Cart",
                    "text": "Click 'Add to Cart' to add the credits to your shopping cart",
                    "image": "https://luckcharm.com/step3-add-cart.jpg"
                },
                {
                    "@type": "HowToStep",
                    "name": "Proceed to Checkout",
                    "text": "Review your order and proceed to secure checkout",
                    "image": "https://luckcharm.com/step4-checkout.jpg"
                },
                {
                    "@type": "HowToStep",
                    "name": "Complete Payment",
                    "text": "Enter payment details and complete your secure transaction",
                    "image": "https://luckcharm.com/step5-payment.jpg"
                },
                {
                    "@type": "HowToStep",
                    "name": "Receive Credits",
                    "text": "Your gaming credits will be delivered instantly to your account",
                    "image": "https://luckcharm.com/step6-receive.jpg"
                }
            ]
        };
    };

    // Combine all schemas
    const generateCombinedSchema = () => {
        const schemas = [];
        
        const gamingSchema = generateGamingSchema();
        if (gamingSchema) schemas.push(gamingSchema);
        
        const faqSchema = generateFAQSchema();
        if (faqSchema) schemas.push(faqSchema);
        
        const howToSchema = generateHowToSchema();
        if (howToSchema) schemas.push(howToSchema);

        return schemas.length > 0 ? schemas : null;
    };

    return (
        <Helmet>
            {/* Enhanced gaming-specific meta tags */}
            <meta name="keywords" content={generateGamingKeywords()} />
            <meta name="description" content={`Premium ${gameData.game_name || 'gaming'} credits with instant delivery. Secure online gaming platform with bonuses, rewards, and 24/7 support. Join thousands of players worldwide!`} />
            
            {/* Gaming-specific Open Graph tags */}
            <meta property="og:type" content="game" />
            <meta property="og:title" content={`${gameData.game_name || 'Gaming'} Credits - LuckCharm Gaming Platform`} />
            <meta property="og:description" content={`Experience premium ${gameData.game_name || 'online gaming'} with instant deposits and secure transactions. Get bonuses and rewards!`} />
            <meta property="og:image" content={gameData.game_image || "https://luckcharm.com/gaming-og-image.jpg"} />
            
            {/* Gaming Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`Play ${gameData.game_name || 'Premium Games'} - LuckCharm Gaming`} />
            <meta name="twitter:description" content={`Join thousands playing ${gameData.game_name || 'exciting games'}. Instant deposits, secure gaming, amazing bonuses!`} />
            
            {/* Gaming-specific meta tags */}
            <meta name="game-platform" content="Web, Mobile, Desktop" />
            <meta name="game-genre" content="Casino, Slots, Cards" />
            <meta name="game-rating" content="18+" />
            <meta name="payment-methods" content="PayPal, Credit Card, Cryptocurrency" />
            
            {/* Enhanced schema markup */}
            {generateCombinedSchema() && (
                <script type="application/ld+json">
                    {JSON.stringify(generateCombinedSchema())}
                </script>
            )}
            
            {/* Additional SEO meta tags for gaming */}
            <meta name="robots" content="index, follow, max-image-preview:large" />
            <meta name="googlebot" content="index, follow" />
            <meta name="theme-color" content="#FFD700" />
            <link rel="canonical" href={`https://luckcharm.com${typeof window !== 'undefined' ? window.location.pathname : ''}`} />
        </Helmet>
    );
};

export default GamingSEO;