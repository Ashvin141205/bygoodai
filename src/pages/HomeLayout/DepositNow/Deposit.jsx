import React, { useEffect, useState, useMemo, useCallback } from 'react'; // Import useCallback
import { Helmet } from 'react-helmet-async';
import Hero from '../../../components/Hero';
import DepositBg from '../../../assets/image/blogBg.png';
import MainContent from '../../../components/deposit/MainContent';
import DepositIntro from '../../../components/deposit/DepositIntro';
import Loading from '../../../components/Common/Loading';
import SEOComponent from '../../../components/Common/SEOComponent';
import GamingSEO from '../../../components/Common/GamingSEO';
import HowItWorksButton from '../../../components/Common/HowItWorksButton';

import { updateGame } from '../../../redux/slice/gamesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { ClipboardIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Import search icon
import Cookies from 'js-cookie';

const Deposit = () => {
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCouponPopup, setShowCouponPopup] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // <<< NEW: State for search term

    const games = useSelector((state) => state.games.games);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchPlatforms = useCallback(async () => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.GAME.LIST, 'POST', { gameID: "", filter: "platform" }, undefined, dispatch, navigate);
            if (Number(response?.data?.status?.code) === 1) {
                const data = response.data.data;

                const sortedData = [...data].sort((a, b) => {
                    const trendingA = a.trending === "1" ? 1 : 0;
                    const trendingB = b.trending === "1" ? 1 : 0;
                    if (trendingA !== trendingB) {
                        return trendingB - trendingA;
                    }
                    const idA = parseInt(a.platforms_id) || -Infinity;
                    const idB = parseInt(b.platforms_id) || -Infinity;
                    return idA - idB;
                });

                sortedData.forEach((game) => {
                    const updatedGame = {
                        ...game,
                        is_game_add: game.is_game_add ? game.is_game_add : false,
                        quantity: 10,
                        platforms_id: game.platforms_id ? game.platforms_id : 0,
                        status: game.online_status || 'offline',
                    };
                    dispatch(updateGame(updatedGame));
                });
                setCounters(new Array(response.data.data.length).fill(10));
            }
        } catch (error) {
            console.error('Error fetching depositItems:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch, navigate]); // Add dependencies

    useEffect(() => {
        fetchPlatforms();

        const popupState = localStorage.getItem('showCouponPopup');
        const savedCouponCode = localStorage.getItem('couponCode');
        const existingCookie = Cookies.get('freeplayCouponCode');

        // Only restore from localStorage if there's no existing cookie (first time only)
        if (popupState === 'true' && savedCouponCode && !existingCookie) {
            setShowCouponPopup(true);
            setCouponCode(savedCouponCode);
            Cookies.set('freeplayCouponCode', savedCouponCode, { expires: 1, path: '/' });
            localStorage.removeItem('showCouponPopup');
            localStorage.removeItem('couponCode');
        } else if (!savedCouponCode && !existingCookie) {
            // Clean up any orphaned localStorage items
            localStorage.removeItem('showCouponPopup');
            localStorage.removeItem('couponCode');
        }
    }, [fetchPlatforms]);

    const handleCopy = () => {
        toast.success('Coupon code copied to clipboard!');
    };

    const handleClosePopup = () => {
        setShowCouponPopup(false);
    };

    // Handle play game - open in new window/tab (better for mobile)
    const handlePlayGame = (gameUrl, gameName) => {
        if (gameUrl) {
            window.open(gameUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // <<< NEW: Memoized filtering logic >>>
    const filteredGames = useMemo(() => {
        if (!searchTerm) {
            return games; // Return all games if search term is empty
        }
        return games.filter(game =>
            game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [games, searchTerm]);


    if (loading) {
        return <Loading />;
    }

    // Generate service schema for deposit page
    const generateDepositServiceSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Game Credits Deposit Service",
            "description": "Secure deposit service for purchasing game credits across multiple gaming platforms",
            "provider": {
                "@type": "Organization",
                "name": "LuckCharm",
                "url": "https://luckcharm.com"
            },
            "serviceType": "Gaming Credit Purchase",
            "areaServed": "Worldwide",
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Gaming Platforms",
                "itemListElement": games.map((game, index) => ({
                    "@type": "Offer",
                    "position": index + 1,
                    "itemOffered": {
                        "@type": "Product",
                        "name": game.game_name,
                        "description": `${game.game_name} gaming credits`,
                        "category": "Gaming Credits",
                        "offers": {
                            "@type": "Offer",
                            "price": game.game_price || "10.00",
                            "priceCurrency": "USD",
                            "availability": game.status === 'online' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.6",
                            "reviewCount": "85"
                        }
                    },
                    "price": game.game_price || "10.00",
                    "priceCurrency": "USD",
                    "priceValidUntil": "2025-12-31",
                    "availability": game.status === 'online' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
                        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                    }
                }))
            },
            "offers": {
                "@type": "Offer",
                "priceRange": "$1.00-$500.00",
                "priceCurrency": "USD",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock",
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
                    "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "2500",
                "bestRating": "5"
            },
            "review": [
                {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Happy Gamer"
                    },
                    "reviewBody": "Fast and secure deposit service. Credits arrived instantly!",
                    "datePublished": "2025-05-01"
                }
            ]
        };
    };

    return (
        <>
            <SEOComponent
                title="Deposit Now - Buy Game Credits | LuckCharm Gaming"
                description="Secure deposit service for purchasing game credits. Choose from multiple gaming platforms with instant delivery and 24/7 support."
                keywords="game credits, deposit, buy credits, gaming platforms, secure payment, instant delivery"
                ogType="website"
                structuredData={generateDepositServiceSchema()}
            />
            
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(generateDepositServiceSchema())}
                </script>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://luckcharmsweep.com/deposit" />
            </Helmet>

            <Hero 
                bgImg={DepositBg} 
                title={"DEPOSIT NOW"} 
                tagline="Join Now and Start Your Winning Journey With Us!"
            />
            
            {/* <<<<---- START: ADDED SEARCH BAR ---->>>> */}
            <div className="py-4" style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
                <div className="container mx-auto px-4">
                    <div className="relative max-w-lg mx-auto">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for a specific platform or game..."
                            className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:border-yellow-500 transition"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>
            {/* <<<<---- END: ADDED SEARCH BAR ---->>>> */}

            <MainContent 
                depositItems={filteredGames} 
                counters={counters} 
                setCounters={setCounters} 
                fetchPlatforms={fetchPlatforms}
                onPlayGame={handlePlayGame}
            />

            {/* Enhanced Gaming SEO Components */}
            <GamingSEO 
                gameData={{
                    game_name: "Gaming Credits Deposit",
                    game_price: "10.00"
                }}
                pageType="deposit"
                includeGameSchema={true}
                includeFAQ={false}
                includeHowTo={false}
            />

            {/* How It Works Guide Buttons */}
            <div className="py-8" style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <HowItWorksButton 
                            buttonText="How to Buy Gaming Credits"
                            linkTo="/how-to-buy-gaming-credits"
                            variant="primary"
                        />
                        <HowItWorksButton 
                            buttonText="Frequently Asked Questions"
                            linkTo="/gaming-faq"
                            variant="outline"
                        />
                    </div>
                </div>
            </div>

            {showCouponPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
                    <div className="relative bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg w-full max-w-md p-6 shadow-2xl">
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-3 right-3 text-white text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-center">Congratulations!</h2>
                        <p className="text-lg mb-4 text-center">You've earned a $2 Freeplay!</p>
                        <p className="mb-4 text-center">Here's your unique coupon code:</p>

                        <div className="border-2 border-dashed border-yellow-500 rounded-lg p-4 mb-6 flex justify-center items-center">
                            <CopyToClipboard text={couponCode} onCopy={handleCopy}>
                                <div className="flex items-center">
                                    <span className="text-2xl font-bold text-yellow-500 mr-2">
                                        {couponCode}
                                    </span>
                                </div>
                            </CopyToClipboard>
                            <CopyToClipboard text={couponCode} onCopy={handleCopy}>
                                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-1 px-3 rounded flex items-center">
                                    <ClipboardIcon className="w-6 h-6 mr-2" />
                                    <span className="text-sm">Copy Code</span>
                                </button>
                            </CopyToClipboard>
                        </div>

                        <p className="mb-4 text-center">
                            This coupon is valid for <span className="font-bold">24 Hours</span>
                        </p>
                        <p className="text-xs text-center mb-4 text-gray-400">
                            <span className="text-yellow-500 font-semibold">Important:</span> You'll get 30% of any winnings you make using your $2 freeplay bonus.
                        </p>
                        <Link to="/bonuses">
                            <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md w-full transition-colors duration-200">
                                Redeem Now
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Deposit;