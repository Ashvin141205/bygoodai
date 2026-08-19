import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { InfoIcon } from '../../utils/Icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import secure from '../../assets/image/secure.png';
import { toast } from 'react-toastify';
import Loading from '../../components/Common/Loading';
import SEOComponent from '../../components/Common/SEOComponent';
import { resetGamesState } from '../../redux/slice/gamesSlice';
import CheckoutNotFound from '../../components/Checkout/CheckoutNotFound';
import { ApiHandler } from '../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import Cookies from 'js-cookie';

const AmountDeposit = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showGameBonusTooltip, setShowGameBonusTooltip] = useState(false); // State for the custom tooltip
    const token = useSelector((state) => state.auth.token);
    const userData = useSelector((state) => state.auth.user);

    // --- Extracted state variables, including new game-specific bonus data ---
    const {
        cartDataState: cartData,
        totalAmountState, // This is originalAmount + all bonuses (potentially including crypto)
        totalAmount,      // This is the sum of game_price * quantity (Base game price total)
        method,
        discount = '',
        discountamount = '',
        totalDepositBonusAmount = '', // Sum of game.bonus (coupon bonuses applied at the game level)
        weeklyChallengeBonusAmount = '',
        finalTotal = '', // This is totalAmount - discountAmount (The amount to pay)
        promoCode = '',
        promoCodeData = '',
        BonusLevelAmount = '',
        registrationBonusPercentage = '',
        cryptoBonusAmount = 0, // Default to 0 if not provided
        totalGameSpecificBonusAmount = 0, // NEW: Total sum of game-specific percentage bonuses
        bonuses = { gameSpecificBonuses: {} }, // NEW: Object containing game specific bonus map
    } = location.state || {}; // Add default empty object to prevent errors if state is missing

    const [cryptoValue, setCryptoValue] = useState(null);

    // --- Calculate total order-wide bonus amount (excluding game deposit coupons) ---
    // These bonuses are typically distributed proportionally among all games.
    const totalOrderWideBonus = (weeklyChallengeBonusAmount || 0) +
                                (BonusLevelAmount || 0) +
                                (registrationBonusPercentage || 0) +
                                (cryptoBonusAmount || 0);
    
    // Total of ALL bonuses: deposit coupons + game specific + order wide
    const totalAllBonuses = (totalOrderWideBonus || 0) + (totalDepositBonusAmount || 0) + (totalGameSpecificBonusAmount || 0);


    // --- Generate Game Specific Bonus Breakdown Content for Tooltip ---
    const gameBonusDetailsContent = cartData
        ?.map(game => {
            const gameSpecificPercentage = parseFloat(bonuses.gameSpecificBonuses?.[game.id]) || 0;
            if (gameSpecificPercentage > 0) {
                const gameTotal = game.quantity * parseFloat(game.game_price);
                const gameSpecificAmount = gameTotal * (gameSpecificPercentage / 100);
                return (
                    <div key={game.id} className="mt-1">
                        - {game.game_name}: {gameSpecificPercentage}% (${gameSpecificAmount.toFixed(2)})
                    </div>
                );
            }
            return null;
        })
        .filter(detail => detail !== null);
    
    const finalGameBonusContent = gameBonusDetailsContent?.length > 0 ? (
        <>
            <p className="font-semibold mb-1 border-b border-gray-700 pb-1">Game Specific Bonus Breakdown:</p>
            {gameBonusDetailsContent}
        </>
    ) : (
        <p>No game specific percentage bonuses applied.</p>
    );
    // --- END Tooltip Content Generation ---


    const sendDepositRequest = async () => {
        try {
            setLoading(true);
            dispatch(resetGamesState());

            const amount = finalTotal; // Amount to actually charge/deduct
            // totalAmountState already includes all bonuses passed from previous page
            const totalAmountWithBonuses = totalAmountState;
            const baseGameTotal = totalAmount;

            const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.CREATE_NEW, 'POST', {
                email: userData?.email || '',
                phone: userData?.phone || '',
                amount: amount ? parseFloat(amount) : '',
                promocode: promoCode,
                promocodeDiscount: promoCodeData.promoCodePercentage ? parseFloat(promoCodeData.promoCodePercentage) : '',
                discountamount: promoCodeData.promoCodeAmount ? parseFloat(promoCodeData.promoCodeAmount) : '',
                totalamount: totalAmountWithBonuses ? parseFloat(totalAmountWithBonuses) : '', // Send total *including* bonuses
                payment_type: method,
                allow_bonus_checkout: method === 'Bonus' ? '1' : '0',
                weekly_challenge_bonus: weeklyChallengeBonusAmount ? parseFloat(weeklyChallengeBonusAmount) : '',
                game_detail: cartData.map((game) => ({
                    game_name: game.game_name ? game.game_name : '',
                    game_id: game.id ? game.id : '',
                    price: game.game_price ? parseFloat(game.game_price) : '',
                    quantity: game.quantity ? parseFloat(game.quantity) : '',
                    total: parseFloat(game.quantity * (game.game_price || game.price)),
                    deposit_bonus: game.bonus ? parseFloat(game.bonus) : '',
                    platformsID: game.platforms_id ? game.platforms_id : '',
                })),
                account_level_bonus: BonusLevelAmount ? parseFloat(BonusLevelAmount) : '',
                totalDepositBonusAmount: totalDepositBonusAmount ? parseFloat(totalDepositBonusAmount) : '', // Still send total for backend info
                registration_bonus_for_new_users: registrationBonusPercentage ? parseFloat(registrationBonusPercentage) : '',
                crypto_bonus: cryptoBonusAmount ? parseFloat(cryptoBonusAmount) : '',
                total_game_specific_bonus: totalGameSpecificBonusAmount ? parseFloat(totalGameSpecificBonusAmount) : 0, // NEW: Pass the total game specific bonus
                base_total_amount: baseGameTotal ? parseFloat(baseGameTotal) : 0,
                utm_source: Cookies.get('utm_source') || null,
                utm_medium: Cookies.get('utm_medium') || null,
                utm_campaign: Cookies.get('utm_campaign') || null,
            }, token, dispatch, navigate);

            if (response.data.status.code === 1) {
                if (response.data.data.checkoutLink) {
                    setLoading(false);
                    window.location.href = response.data.data.checkoutLink;
                } else {
                    toast.success("Deposit request submitted successfully! Your funds will be added shortly.");
                    navigate('/user/deposits');
                    setLoading(false);
                }
            } else {
                toast.error(response.data.status.message);
                setLoading(false);
            }
            setLoading(false);
        } catch (error) {
            console.error("API call error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCryptoValue = async () => {
            if (['BTC', 'BTCLN', 'LTC', 'DOGE', 'USDT'].includes(method)) {
                try {
                    const tickerMap = {
                        BTC: 'XXBTZUSD', 
                        BTCLN: 'XXBTZUSD', // BTC Lightning uses same BTC price
                        LTC: 'XLTCZUSD', 
                        DOGE: 'XDGUSDT',
                        USDT: 'USDTUSD', // USDT is 1:1 with USD typically
                    };
                    const tickerName = tickerMap[method];
                    // Make sure finalTotal is a valid number before using it
                    const numericFinalTotal = parseFloat(finalTotal);
                    if (!tickerName || isNaN(numericFinalTotal) || numericFinalTotal <= 0) {
                        console.error('Invalid method or finalTotal for crypto calculation', method, finalTotal);
                        setCryptoValue('N/A'); // Indicate an error or invalid state
                        return;
                    }

                    // For USDT, the conversion is 1:1 with USD
                    if (method === 'USDT') {
                        setCryptoValue(numericFinalTotal.toFixed(2));
                        return;
                    }

                    const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${tickerName}`);
                    const data = await response.json();

                    if (data?.result?.[tickerName]?.a?.[0]) {
                        const value = parseFloat(data.result[tickerName].a[0]);
                        if (value > 0) {
                            const cryptoAmount = numericFinalTotal / value;
                            setCryptoValue(cryptoAmount.toFixed(8));
                        } else {
                            console.error('Invalid crypto price from API:', value);
                            setCryptoValue('N/A');
                        }
                    } else {
                        console.error('Error: Ticker not found in API response:', tickerName, data);
                        setCryptoValue('N/A');
                    }
                } catch (error) {
                    console.error('Error fetching crypto value:', error);
                    setCryptoValue('N/A'); // Indicate fetch error
                }
            }
        };

        // Ensure finalTotal is available and valid before fetching
        if (finalTotal) {
           fetchCryptoValue();
        }
    }, [method, finalTotal]);


    useEffect(() => {
        // Guard clause: Check if location.state exists and has the required property
        if (!location.state?.isCheckoutAllowed) {
            console.warn("Redirecting: Checkout not allowed or state missing.");
            navigate('/cart');
            return; // Stop further execution in this effect
        }

        // Proceed with replacing history state only if checkout is allowed
        const currentState = window.history.state;
        // Check if currentState and currentState.usr exist before spreading
        const usrState = currentState?.usr || {};
        const updatedState = {
            ...currentState,
            usr: {
                ...usrState,
                isCheckoutAllowed: false
            }
        };

        // Replace the current history state with the updated state
        window.history.replaceState(updatedState, document.title);

        // Intentionally omitting navigate from dependency array if its change shouldn't re-trigger this effect.
        // If navigate *should* re-trigger, add it back.
    }, [location.state]); // Depend only on location.state

    if (!token) {
        // Consider redirecting inside useEffect based on token changes
        // For now, simple conditional redirect:
        navigate('/login');
        return null; // Return null while redirecting
    }

    // Check cartData after ensuring location.state exists
    if (!cartData || cartData.length === 0) {
        return <CheckoutNotFound />;
    }


    if (loading) {
        return <Loading />;
    }

    // Generate Payment schema for deposit page
    const generatePaymentSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "PaymentService",
            "name": "LuckCharm Payment Processing",
            "description": "Secure payment processing for gaming credit deposits",
            "provider": {
                "@type": "Organization",
                "name": "LuckCharm",
                "url": "https://luckcharm.com"
            },
            "paymentMethodAccepted": [
                "http://purl.org/goodrelations/v1#PayPal",
                "http://purl.org/goodrelations/v1#Bitcoin",
                "http://purl.org/goodrelations/v1#CreditCard"
            ],
            "priceRange": `$${finalTotal || totalAmount}`,
            "currenciesAccepted": "USD",
            "offers": {
                "@type": "Offer",
                "price": finalTotal || totalAmount,
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
                "ratingValue": "4.9",
                "reviewCount": "3500",
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
                        "name": "Satisfied Customer"
                    },
                    "reviewBody": "Smooth payment process and instant credit delivery. Highly secure!",
                    "datePublished": "2025-06-15"
                }
            ]
        };
    };

    return (
        <>
            <SEOComponent
                title="Payment Processing - Secure Deposit | LuckCharm Gaming"
                description="Complete your secure payment for gaming credits. Multiple payment methods including PayPal, Bitcoin, and credit cards."
                keywords="payment processing, secure deposit, gaming credits, PayPal, Bitcoin, cryptocurrency"
                ogType="website"
                structuredData={generatePaymentSchema()}
            />
            
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(generatePaymentSchema())}
                </script>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="container mx-auto text-white mt-16 md:mt-36 px-4">
                {/* Conditionally render the crypto instructions */}
                {(method === "BTC" || method === "BTCLN" || method === "LTC" || method === "DOGE" || method === "USDT") && (
                    <div className="">
                        <p className="mb-4">
                            Please send <span className="font-bold text-red-500 underline">exactly</span> <span className="font-bold">{cryptoValue !== 'N/A' ? cryptoValue : 'calculating...'}</span> <span>{method === "BTCLN" ? "BTC (Lightning)" : method === "USDT" ? "USDT" : method}</span> indicated amount to the wallet.
                        </p>
                        <p className="mb-4">
                            You can make the payment by manually entering the address or simply scanning the QR code with your {method === "BTCLN" ? "Bitcoin Lightning" : method === "USDT" ? "USDT" : method} wallet. Once you issue payment, your order will be automatically processed.
                        </p>

                        <div className="text-white p-4 rounded mb-6 relative py-6 md:py-8"
                            style={{ 
                                backgroundColor: 
                                    method === "BTC" ? "#f7931a" : 
                                    method === "BTCLN" ? "#7B3FF2" : 
                                    method === "LTC" ? "#345D9D" : 
                                    method === "USDT" ? "#26A17B" : 
                                    "#C2A633" 
                            }}
                        >
                            <InfoIcon className="absolute top-2 left-2" />
                            <p>
                                If you do not send the exactly shown amount of {cryptoValue && cryptoValue !== 'N/A' ? (
                                    <>
                                        <span className="font-bold">{cryptoValue}</span> {method === "BTCLN" ? "BTC (Lightning)" : method === "USDT" ? "USDT" : method}
                                    </>
                                ) : (
                                    "calculating..."
                                )} (not including the transaction fee), processing time for your order may take longer due to the manual review process.
                            </p>
                            <p className="font-bold mt-2">
                                You may have to pay the missing part of your deposit after review.
                            </p>
                        </div>
                    </div>
                )}

                <hr className="border-white/15 border" />

                <div className="flex flex-col lg:flex-row w-full gap-5">
                    <div className="bg-gray-800 p-4 rounded my-6 flex-[2] h-full overflow-auto"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.16)', borderWidth: '1px' }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className='text-base md:text-lg font-semibold'>
                                        <th className="p-2 text-start">NAME</th>
                                        <th className="p-2 text-start">PRICE</th>
                                        <th className="p-2 text-start">QUANTITY</th>
                                        <th className="p-2 text-start">TOTAL</th>
                                        <th className="p-2 text-start">BONUSES</th> {/* Renamed Header */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartData?.map((game, index) => {
                                        const gameBaseTotal = game.quantity * parseFloat(game.game_price);
                                        const gameDepositBonus = game.bonus ? parseFloat(game.bonus) : 0;
                                        
                                        // 3. Calculate Game Specific Bonus Amount for this game
                                        const gameSpecificPercentage = parseFloat(bonuses.gameSpecificBonuses?.[game.id]) || 0;
                                        const gameSpecificBonusAmount = gameBaseTotal * (gameSpecificPercentage / 100);

                                        // Calculate the proportional share of order-wide bonuses for THIS game item
                                        let proportionalOrderBonus = 0;
                                        if (totalAmount > 0) { // Avoid division by zero
                                            proportionalOrderBonus = (gameBaseTotal / totalAmount) * totalOrderWideBonus;
                                        }

                                        // Total bonus amount for display in the 'BONUSES' column
                                        const displayAmount = gameDepositBonus + proportionalOrderBonus + gameSpecificBonusAmount;

                                        return (
                                            <tr key={index} className="border-b border-gray-700 text-sm md:text-base font-semibold md:font-medium">
                                                <td className="border px-2 py-4">{game.game_name}</td>
                                                <td className="border px-2 py-4">${parseFloat(game.game_price).toFixed(2)}</td>
                                                <td className="border px-2 py-4">{game.quantity}</td>
                                                <td className="border px-2 py-4">${gameBaseTotal.toFixed(2)}</td>
                                                {/* Updated BONUSES column */}
                                                <td className="border px-2 py-4 font-bold text-green-400">
                                                    ${displayAmount.toFixed(2)}
                                                    {gameSpecificBonusAmount > 0 && (
                                                        <div className="text-xs text-yellow-500 font-normal">
                                                            ({gameSpecificPercentage}% Game Bonus)
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded my-6 flex-1 h-auto"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.16)', borderWidth: '1px' }}>
                        <button type="button"
                            className="w-full chakra-button css-ct8v74 !text-white"
                            style={{ 
                                backgroundColor: 
                                    method === "BTC" ? "#f7931a" : 
                                    method === "BTCLN" ? "#7B3FF2" : 
                                    method === "LTC" ? "#345D9D" : 
                                    method === "DOGE" ? "#C2A633" : 
                                    method === "USDT" ? "#26A17B" : 
                                    method === "Wallet" ? "#8cc43e" : 
                                    method === "CashApp" ? "#FF9085" :
                                    "#ff5f66" 
                            }}
                            onClick={sendDepositRequest}
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Processing...' : `Pay with ${
                                method === "BTC" ? "Bitcoin" : 
                                method === "BTCLN" ? "BTC Lightning" : 
                                method === "LTC" ? "Litecoin" : 
                                method === "DOGE" ? "Dogecoin" : 
                                method === "USDT" ? "USDT (Tether)" : 
                                method === "Wallet" ? "Wallet" : 
                                method === "CashApp" ? "CashApp" :
                                "Bonus"
                            }`}
                        </button>
                        <p className='text-sm font-medium text-white mt-1'>
                            By placing this order, you agree with our
                            <Link to="/privacy-policy" className='text-blue-400 pl-1 pr-1 underline'> Privacy Policy</Link>
                            and
                            <Link to="/terms-of-service" className='text-blue-400 pl-1 pr-1 underline'> Terms Of Use</Link>.
                        </p>

                        <div className='my-4'>
                            <img src={secure} alt="Secure Payment" />
                        </div>

                        {/* --- Summary Section --- */}
                        <h2 className="font-bold text-lg">Bonuses & Discounts Summary</h2>
                        {totalAmount > 0 ? (
                            <div className="mb-2 flex justify-between font-bold">
                                <p>Subtotal (Games)</p>
                                <p>${parseFloat(totalAmount).toFixed(2)}</p>
                            </div>
                        ) : null}
                        <hr className="border-white/5 border my-3" />
                        {/* List all applicable order-wide bonuses */}
                        {registrationBonusPercentage > 0 ? (
                            <div className="mb-2 flex justify-between font-bold text-yellow-400">
                                <p>First Deposit Bonus</p>
                                <p>+${parseFloat(registrationBonusPercentage).toFixed(2)}</p>
                            </div>
                        ) : null}
                          {totalDepositBonusAmount > 0 ? ( // Still show total deposit bonus here for clarity
                            <div className="mb-2 flex justify-between font-bold text-yellow-400">
                                <p>Total Game Deposit Bonuses</p>
                                <p>+${parseFloat(totalDepositBonusAmount).toFixed(2)}</p>
                            </div>
                        ) : null}
                        {weeklyChallengeBonusAmount > 0 ? (
                            <div className="mb-2 flex justify-between font-bold text-yellow-400">
                                <p>Weekly Challenge Bonus</p>
                                <p>+${parseFloat(weeklyChallengeBonusAmount).toFixed(2)}</p>
                            </div>
                        ) : null}
                        
                        {BonusLevelAmount > 0 ? (
                            <div className="mb-2 flex justify-between font-bold text-yellow-400">
                                <p>Bonus Level</p>
                                <p>+${parseFloat(BonusLevelAmount).toFixed(2)}</p>
                            </div>
                        ) : null}

                        {/* NEW: Game Specific Bonus Total with Info Icon */}
                        {totalGameSpecificBonusAmount > 0 && (
                            <div className="mb-2 flex justify-between font-bold text-yellow-400 relative">
                                <p>Total Game Specific Bonuses</p>
                                <span className="flex items-center">
                                    <p>+${parseFloat(totalGameSpecificBonusAmount).toFixed(2)}</p>
                                    <span 
                                        className="ml-2 cursor-pointer text-white/50 hover:text-white"
                                        onMouseEnter={() => setShowGameBonusTooltip(true)}
                                        onMouseLeave={() => setShowGameBonusTooltip(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                            <path d="M8.93 6.57a.5.5 0 0 0-.875-.375l-.946.473L6.18 5.76a.5.5 0 0 0-.75.66l1.4 1.4a.5.5 0 0 0 .75-.66L7.155 6.6l.875-.375zM8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                                        </svg>
                                    </span>
                                    {/* Custom Tooltip/Popup */}
                                    {showGameBonusTooltip && (
                                        <div className="absolute right-0 top-full mt-2 w-max max-w-xs p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs text-left z-10 shadow-xl">
                                            {finalGameBonusContent}
                                        </div>
                                    )}
                                </span>
                            </div>
                        )}

                        {cryptoBonusAmount > 0 ? (
                            <div className="mb-2 flex justify-between font-bold text-yellow-400">
                                <p>✨ Crypto Bonus (10%)</p>
                                <p>+${parseFloat(cryptoBonusAmount).toFixed(2)}</p>
                            </div>
                        ) : null}

                          {/* Show Total Bonuses */}
                          <div className="mb-2 flex justify-between font-bold text-yellow-400">
                            <p>Total Bonuses Applied</p>
                            {/* Calculate sum of all bonuses shown above + totalDepositBonusAmount */}
                            <p>+${totalAllBonuses.toFixed(2)}</p>
                          </div>


                        {/* Promo Code Section */}
                        {promoCode ? (
                             <>
                                <hr className="border-white/5 border my-3" />
                                <div className="mb-2 flex justify-between items-center font-bold">
                                    <p>Promo Code Applied</p>
                                    <span className="text-sm text-white bg-blue-500 px-2 py-1 rounded-md">
                                        {promoCode}
                                    </span>
                                </div>
                                {discount > 0 ? (
                                    <div className="mb-2 flex justify-between font-bold text-green-400">
                                        <p>Promo Discount ({`${(parseFloat(discount) * 100).toFixed(0)}%`})</p>
                                        <p>-${parseFloat(discountamount).toFixed(2)}</p>
                                    </div>
                                ) : null}
                             </>
                        ) : null}

                          {/* Original Total (Value before discount, including bonuses) */}
                        {promoCode && discountamount > 0 &&  (
                            <>
                                <hr className="border-white/5 border my-3" />
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Total Before Discount</p>
                                    <p>${parseFloat(totalAmount).toFixed(2)}</p>
                                </div>
                            </>
                        )}


                        {/* Final Payable Amount */}
                        <hr className="border-white/5 border my-5" />
                        {finalTotal ? (
                            <div className="mt-4 flex justify-between font-bold text-xl">
                                <p>Amount to Pay</p>
                                <p>${parseFloat(finalTotal)?.toFixed(2)}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AmountDeposit;