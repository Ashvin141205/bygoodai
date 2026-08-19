import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async'; // Import Helmet

import RequestImg from "../../../assets/image/depositToGame.png";
import PaymentButton from "../../../components/PaymentButton";
import BitCoinLogo from "../../../assets/image/bitcoin.png";
import WalletLogo from "../../../assets/image/wallet.png";
import DogeCoinLogo from "../../../assets/image/dogecoin.png";
import DollarIcon from "../../../assets/image/dollarIcon.png";
import LitecoinLogo from "../../../assets/image/Litecoin.png";
import cashAppLogo from "../../../assets/image/cashApp.png";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../../../components/Common/Loading";
import { ApiHandler } from "../../../helper/ApiHandler";
import { API_ENDPOINTS } from "../../../config/apiEndpoints";

const DepositToGame = () => {
    const [games, setGames] = useState([]);
    const [cartDataState, setCartDataState] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [method, setMethod] = useState(null);
    const [totalAmountState, setTotalAmountState] = useState("");
    const [isCheckoutAllowed, setIsCheckoutAllowed] = useState(false);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [newQuantity, setNewQuantity] = useState(0);
    const { user: userData, main_balance, bonus_balance, activeLevel, token } = useSelector((state) => state.auth);
    
    const mainBalance = main_balance;
    const bonusBalance = bonus_balance;
    const bonusLevel = activeLevel;

    const [bonuses, setBonuses] = useState({
        weeklyChallengePercentage: 0,
        depositBonuses: {},
        registrationBonusPercentage: 0,
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const canonicalUrl = "https://www.luckycharmsweep.com/user/deposit/game"; // Replace with your actual domain
    const pageTitle = "Deposit to Game - Lucky Charm Sweep";
    const pageDescription = "Easily deposit funds directly to your favorite games on Lucky Charm Sweep. Select your game, choose a payment method, and start playing with added bonuses!";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image

    const fetchGames = async () => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.GAME.LIST, 'POST', {  gameID: "", }, undefined, dispatch, navigate);
            if (response.data.status.code === "1") {
                const data = response.data.data;
                const formattedGames = data.map((game) => ({
                    id: game.id,
                    game_name: game.game_name,
                    game_image: game.game_image || RequestImg,
                    game_price: `${game.game_price}`,
                    quantity: 10
                }));
                setGames(formattedGames);
            }
        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBonus = async () => {
        if (selectedGame && cartDataState) {
            const payload = [{ game_id: selectedGame.id || 0 }];
            const response = await ApiHandler(API_ENDPOINTS.GAME.VALIDATE, 'POST', { game_data: payload, }, token, dispatch, navigate);

            // Prepare a depositBonuses object to accumulate bonus values by game_id
            const depositBonuses = {};

            // Iterate over the coupons array in the API response
            response?.data?.data?.coupons?.forEach((coupon) => {
                const gameId = coupon.game_id;
                const couponBalance = parseFloat(coupon.coupon_balance);

                // Check if the game_id already exists in depositBonuses, if so, accumulate the balance
                if (depositBonuses[gameId]) {
                    depositBonuses[gameId] += couponBalance;
                } else {
                    // Otherwise, initialize it with the current coupon balance
                    depositBonuses[gameId] = couponBalance;
                }
            });

            cartDataState.forEach((game) => {
                if (depositBonuses[game.id] !== undefined) {
                    game.bonus = depositBonuses[game.id];
                }
            });

            const weeklyChallengePercentage =
                response?.data?.data?.weekly?.bonus_percentage / 100 || 0;

            setBonuses({
                weeklyChallengePercentage,
                depositBonuses,
                registrationBonusPercentage: response?.data?.data?.first_deposit_bonus ? response?.data?.data?.first_deposit_bonus : 0,
            });
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        fetchBonus();
    }, [selectedGame, cartDataState]);

    const handleGameChange = (event) => {
        const selectedGameId = event.target.value;
        setBonuses({
            weeklyChallengePercentage: 0,
            depositBonuses: {},
            registrationBonusPercentage: 0,
        })
        const selectedGame = games.find((game) => +game.id === +selectedGameId);
        setSelectedGame(selectedGame);
        setCartDataState([selectedGame]);
        validateCheckout();
    };

    const handleClick = (method) => {
        let selectedMethod;
        switch (method) {
            case "BTC":
                selectedMethod = "BTC";
                break;
            case "DOGE":
                selectedMethod = "DOGE";
                break;
            case "LTC":
                selectedMethod = "LTC";
                break;
            case "Bonus":
                selectedMethod = "Bonus";
                break;
            case "Wallet":
                selectedMethod = "Wallet";
                break;
            case "CashApp":
                selectedMethod = "CashApp";
                break;
            default:
                selectedMethod = method.toLowerCase();
        }
        setMethod(selectedMethod);
        validateCheckout();
    };

    const handleAmountChange = () => {
        if (selectedGame) {
            const price = parseFloat(selectedGame?.game_price?.replace("$", ""));
            const totalAmount = price * selectedGame?.quantity;
            setTotalAmountState(parseFloat(totalAmount?.toFixed(2)));
        }
    };

    useEffect(() => {
        handleAmountChange();
    }, [selectedGame, selectedGame?.quantity]);

    const validateCheckout = () => {
        if (selectedGame && method && totalAmountState) {
            setIsCheckoutAllowed(true);
        } else {
            setIsCheckoutAllowed(false);
        }
    };


    const totalAmount = totalAmountState;

    const weeklyChallengeBonusAmount = totalAmount * bonuses.weeklyChallengePercentage;

    const bonusPercentage = parseFloat(bonusLevel?.bonus) || 0;
    const BonusLevelAmount = (totalAmount * bonusPercentage) / 100;

    const totalDepositBonusAmount = Object.values(bonuses.depositBonuses).reduce((acc, bonus) => acc + bonus, 0);

    const adjustedTotalAmount = totalAmount + totalDepositBonusAmount;

    const totalAfterBonuses = adjustedTotalAmount + weeklyChallengeBonusAmount;

    const originalAmount = totalAmount + totalDepositBonusAmount + weeklyChallengeBonusAmount + BonusLevelAmount + bonuses.registrationBonusPercentage;

    const finalTotal = totalAmount;

    const handleNextClick = async () => {
        if (isCheckoutAllowed) {
            if (method === "BTC" || method === "LTC" || method === "DOGE") {
                navigate("/user/deposits/amount", {
                    state: {
                        isCheckoutAllowed: true,
                        cartDataState: cartDataState,
                        totalAmountState: originalAmount,
                        method: method,
                        discountamount: '',
                        discount: '',
                        bonuses: bonuses,
                        totalDepositBonusAmount: totalDepositBonusAmount,
                        weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
                        totalAfterBonuses: totalAfterBonuses,
                        finalTotal: finalTotal,
                        promoCode: '',
                        promoCodeData: '',
                        BonusLevelAmount: BonusLevelAmount,
                        registrationBonusPercentage: bonuses.registrationBonusPercentage,
                        totalAmount: totalAmount
                    },
                });
            }

            if (method === "CashApp") {
                try {
                    const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.GET_CASHAPP_BARCODE, 'POST', undefined, token, dispatch, navigate);

                    const barcodeImage = response.data?.data?.barcode_image;
                    const cashapplink = response.data?.data?.cashapplink;


                    if (response.data.status.code === 1 && barcodeImage && cashapplink) {
                        navigate("/cashapp", {
                            state: {
                                directPassPage: false,
                                isCheckoutAllowed: true,
                                cartDataState: cartDataState,
                                totalAmountState: originalAmount,
                                method: "CashApp",
                                discountamount: '',
                                discount: '',
                                promocodeDiscount: '',
                                bonuses: bonuses,
                                totalDepositBonusAmount: totalDepositBonusAmount,
                                weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
                                totalAfterBonuses: totalAfterBonuses,
                                finalTotal: finalTotal,
                                promoCode: '',
                                promoCodeData: '',
                                BonusLevelAmount: BonusLevelAmount,
                                userData: userData,
                                proof_image: barcodeImage,
                                cashapp_url: cashapplink,

                                registrationBonusPercentage: bonuses.registrationBonusPercentage,
                                totalAmount: totalAmount
                            },
                        });
                    }
                } catch (error) {
                    console.error("Error fetching CashApp barcode:", error);
                }
            }

            if (method === "Bonus") {
                if (bonusBalance && bonusBalance < totalAmount) {
                    toast.error("Insufficient bonus balance");
                    return;
                }
                navigate("/user/deposits/amount", {
                    state: {
                        isCheckoutAllowed: true,
                        cartDataState: cartDataState,
                        totalAmountState: originalAmount,
                        method: "Bonus",
                        discountamount: '',
                        discount: '',
                        bonuses: bonuses,
                        totalDepositBonusAmount: totalDepositBonusAmount,
                        weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
                        totalAfterBonuses: totalAfterBonuses,
                        finalTotal: finalTotal,
                        promoCode: '',
                        promoCodeData: '',
                        BonusLevelAmount: BonusLevelAmount,
                        registrationBonusPercentage: bonuses.registrationBonusPercentage,
                        totalAmount: totalAmount
                    },
                });
            }

            if (method === "Wallet") {
                if (mainBalance && mainBalance < totalAmount) {
                    toast.error("Insufficient main balance");
                    return;
                }
                navigate("/user/deposits/amount", {
                    state: {
                        isCheckoutAllowed: true,
                        cartDataState: cartDataState,
                        totalAmountState: originalAmount,
                        method: method,
                        discountamount: '',
                        discount: '',
                        bonuses: bonuses,
                        totalDepositBonusAmount: totalDepositBonusAmount,
                        weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
                        totalAfterBonuses: totalAfterBonuses,
                        finalTotal: finalTotal,
                        promoCode: '',
                        promoCodeData: '',
                        BonusLevelAmount: BonusLevelAmount,
                        registrationBonusPercentage: bonuses.registrationBonusPercentage,
                        totalAmount: totalAmount
                    },
                });
            }
        } else {
            toast.error("Please select a game, payment method, and enter an amount.");
        }
    };

    const handleQuantityClick = () => {
        setNewQuantity(selectedGame.quantity);
        setShowQuantityModal(true);
    };

    const handleQuantitySubmit = () => {
        setSelectedGame((prevGame) => ({
            ...prevGame,
            quantity: newQuantity,
        }));
        setShowQuantityModal(false);
    };

    if (loading) return <Loading />

    return (
        <>
          <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
            </Helmet>
        <div className="flex justify-center min-h-fit bg-[#0e0e0e]">
            <div className="bg-[#222222] text-white p-8 rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl xxl:max-w-2xl">
                <h2 className="text-2xl font-bold text-center text-[#FFDD15] underline mb-4">
                    Deposit to Game
                </h2>

                <div className="mb-6 flex justify-center">
                    <img
                        src={RequestImg}
                        alt="Deposit Illustration"
                        className="w-44 rounded-lg"
                    />
                </div>

                <div className="">
                    <label className="block text-white mb-2">Select a Game</label>
                    <select
                        className="w-full p-2 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
                        onChange={handleGameChange}
                    >
                        <option value="">Select a Game</option>
                        {games.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.game_name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedGame && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white border border-gray-700 bg-black">
                            <thead>
                                <tr className="bg-black">
                                    <th className="px-4 py-2 text-white/50 font-normal">Logo</th>
                                    <th className="px-4 py-2 text-white/50 font-normal">Name</th>
                                    <th className="px-4 py-2 text-white/50 font-normal">Price</th>
                                    <th className="px-4 py-2 text-white/50 font-normal">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2">
                                        <img
                                            src={selectedGame.game_image}
                                            alt={selectedGame.game_name}
                                            className="w-20 h-20 rounded-lg"
                                        />
                                    </td>
                                    <td className="px-4 py-2">{selectedGame.game_name}</td>
                                    <td className="px-4 py-2 text-[#01D370]">
                                        ${selectedGame.game_price}
                                    </td>
                                    <td
                                        className="px-4 py-2 cursor-pointer"
                                        onClick={handleQuantityClick}
                                    >
                                        {selectedGame.quantity}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {totalDepositBonusAmount ||
                    bonuses.registrationBonusPercentage ||
                    bonuses.weeklyChallengePercentage ? (
                    <>
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-[#FFDD15] mb-2">
                                Bonuses
                            </h3>
                            <div className="bg-black p-4 rounded-md border border-gray-700">
                                {bonuses.weeklyChallengePercentage > 0 && (
                                    <div className="mb-2">
                                        <strong>Weekly Challenge Bonus:</strong>{" "}
                                        {(bonuses.weeklyChallengePercentage * 100).toFixed(2)}%
                                    </div>
                                )}
                                {totalDepositBonusAmount > 0 && (
                                    <div className="mb-2 flex gap-2">
                                        <strong>Deposit Bonuses:</strong>
                                        <span>${totalDepositBonusAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {bonuses.registrationBonusPercentage > 0 && (
                                    <div className="mb-2">
                                        <strong>Registration Bonus:</strong>{" "}
                                        {bonuses.registrationBonusPercentage.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    ""
                )}

                {/* Modal for editing quantity */}
                {showQuantityModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="bg-[#222222] p-5 rounded-lg shadow-md w-96">
                            <h3 className="text-lg font-bold text-[#FFDD15] mb-4">
                                Edit Quantity
                            </h3>
                            <input
                                type="number"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                className="w-full p-2 border border-white/50 rounded-md bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setShowQuantityModal(false)}
                                    className="bg-gray-600 px-4 py-2 rounded-md text-white mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuantitySubmit}
                                    className="bg-[#FFDD15] px-4 py-2 rounded-md text-black"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <fieldset className="mt-5">
                    <legend className="block text-white mb-2">
                        Select Balance Option*
                    </legend>
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 w-full ">
                        <PaymentButton
                            bgColor={method === "BTC" ? "#D47D18" : "#F7931A"}
                            logo={BitCoinLogo}
                            title={"Bitcoin"}
                            onClick={() => handleClick("BTC")}
                        />
                        <PaymentButton
                            bgColor={method === "LTC" ? "#2D4F89" : "#345D9D"}
                            logo={LitecoinLogo}
                            title={"Litecoin"}
                            onClick={() => handleClick("LTC")}
                        />
                        <PaymentButton
                            bgColor={method === "DOGE" ? "#9F8D2E" : "#C2A633"}
                            logo={DogeCoinLogo}
                            title={"Dogecoin"}
                            onClick={() => handleClick("DOGE")}
                        />
                        <PaymentButton
                            bgColor={method === "Wallet" ? "#77A434" : "#8CC43E"}
                            logo={WalletLogo}
                            title={"Wallet"}
                            onClick={() => handleClick("Wallet")}
                        />
                        <PaymentButton
                            bgColor={method === "Bonus" ? "#E75057" : "#FF5F66"}
                            logo={DollarIcon}
                            title={"Bonus"}
                            onClick={() => handleClick("Bonus")}
                        />
                        <PaymentButton
                            bgColor={method === "CashApp" ? "#E6716D" : "#FF9085"}
                            logo={cashAppLogo}
                            title={"CashApp"}
                            onClick={() => handleClick("CashApp")}
                        />
                    </div>
                </fieldset>
                <div className="mt-5">
                    <label className="block text-white mb-2">Amount</label>
                    <input
                        type="text"
                        value={`$${finalTotal}`}
                        readOnly
                        className="w-full p-2 border border-white/50 rounded-md bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="$0.00"
                    />
                </div>

                <button
                    type="button"
                    className={`w-full py-2 rounded-md font-bold text-lg mt-6 ${isCheckoutAllowed
                        ? "bg-[#FFDD15] text-black"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                        }`}
                    onClick={handleNextClick}
                    disabled={!isCheckoutAllowed}
                >
                    Next
                </button>
            </div>
        </div>
        </>
    );
};

export default DepositToGame;
