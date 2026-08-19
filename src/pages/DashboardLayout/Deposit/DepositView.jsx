import React, { useEffect, useState } from 'react'
import { InfoIcon } from '../../../utils/Icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import secure from '../../../assets/image/secure.png';
import Loading from '../../../components/Common/Loading';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';

const DepositView = () => {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id, order_id } = useParams();
    const [game_details, setGame_details] = useState([]);
    const [orderId, setOrderId] = useState('');
    const [payment_id, setPayment_id] = useState('');
    const [rejection_note, setRejection_note] = useState('');
    const [payment_status, setPayment_status] = useState('');
    const [payment_type, setPayment_type] = useState('');
    const [bonusAmount, setBonusAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cryptoValue, setCryptoValue] = useState(null); // State to store crypto value

    const FetchDepositDetails = async () => {
        try {
            setLoading(true);
            const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.GET_DETAILS, 'POST', {
                id: id,
                order_id: order_id,
            }, token, dispatch, navigate)

            if (response.data.status.code === "1") {
                setGame_details(response.data.data.game_details);
                setOrderId(response.data.data.order_id);
                setPayment_id(response.data.data.payment_id);
                setRejection_note(response.data.data.rejection_note);
                setPayment_status(response.data.data.payment_status);
                setPayment_type(response.data.data.game_details.payment_type);
                setBonusAmount(response.data.data.game_details?.totalDepositBonusAmount);
                setLoading(false);
            } else {
                setGame_details([]);
                setOrderId('');
                setPayment_id('');
                setRejection_note('');
                setPayment_status('');
                setPayment_type('');
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (id && order_id) {
            FetchDepositDetails();
        }
    }, [id, order_id])
    
    useEffect(() => {
        const fetchCryptoValue = async () => {
            if (['BTC', 'LTC', 'DOGE'].includes(payment_type)) {
                try {
                    const tickerMap = {
                        BTC: 'XXBTZUSD', // Kraken uses XXBT for Bitcoin
                        LTC: 'XLTCZUSD', // Kraken uses XLTC for Litecoin
                        DOGE: 'XDGUSDT', // Kraken uses XXDG for Dogecoin
                    };
    
                    const tickerName = tickerMap[payment_type];
                    const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${tickerName}`);
                    const data = await response.json();
    
                    if (data?.result?.[tickerName]?.a?.[0]) {

                        // Extract the ask price (current price) of the cryptocurrency in USD
                        const value = parseFloat(data.result[tickerName].a[0]);
                        
                        // Calculate the equivalent cryptocurrency amount
                        const cryptoAmount = parseFloat(game_details.amount) / value;
    
                        // Set the crypto value (rounded to 8 decimal places)
                        setCryptoValue(cryptoAmount.toFixed(8));
                    } else {
                        console.error('Error: Ticker not found in API response:', tickerName, data);
                    }
                } catch (error) {
                    console.error('Error fetching crypto value:', error);
                }
            }
        };
    
        fetchCryptoValue();
    }, [payment_type, game_details.amount]);
    

   

    if (loading) {
        return <Loading />;
    }
    return (
        <div className="container mx-auto text-white mt-16 md:mt-36 px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Order #{orderId}</h1>
            {
                rejection_note && (
                    <div className="text-white p-4 rounded mb-6 relative py-6 md:py-8"
                        style={{ backgroundColor: "#ff5f66" }}
                    >
                        <InfoIcon className="absolute top-2 left-2" />

                        <p className="font-bold mt-2">
                            {rejection_note}
                        </p>
                    </div>
                )
            }
             {/* Conditionally render the crypto instructions */}
      {(payment_type === "BTC" || payment_type === "LTC" || payment_type === "DOGE") && (
        <div className="">
          <p className="mb-4">
            Please send the <span className="font-bold text-red-500 underline">exactly</span> <span className="font-bold">{cryptoValue}</span> <span>{payment_type} </span> indicated amount of {payment_type} to the wallet. {/* Display the selected crypto */}
          </p>
          <p className="mb-4">
            You can make the payment by manually entering the address or simply scanning the QR code with your {payment_type} wallet. Once you issue payment, your order will be automatically processed.
          </p>

          <div className="text-white p-4 rounded mb-6 relative py-6 md:py-8"
            style={{ backgroundColor: payment_type === "BTC" ? "#f7931a" : payment_type === "LTC" ? "#345D9D" : "#C2A633" }}
          >
            <InfoIcon className="absolute top-2 left-2" />
            <p>
              If you do not send the exactly shown amount of {/* Display the crypto value */}
              {cryptoValue ? (
                <>
                  <span className="font-bold">{cryptoValue}</span> {payment_type}
                </>
              ) : (
                "loading..." // Display loading message while fetching the value
              )}
              (not including the transaction fee), processing time for your order may take longer due to the manual review process.
            </p>
            <p className="font-bold mt-2">
              You may have to pay the missing part of your deposit after review.
            </p>
          </div>

          {/* ... your existing code ... */}
        </div>
      )}


            <hr className="border-white/15 border" />

            {
                game_details && (
                    <div className="flex flex-col lg:flex-row w-full gap-5">
                        <div className="bg-gray-800 p-4 rounded my-6 flex-[2] h-full overflow-auto"
                            style={{
                                borderColor: 'rgba(255, 255, 255, 0.16)',
                                borderWidth: '1px'
                            }}
                        >
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className='text-base md:text-lg font-semibold'>
                                            <th className="p-2 text-start">NAME</th>
                                            <th className="p-2 text-start">PRICE</th>
                                            <th className="p-2 text-start">QUANTITY</th>
                                            <th className="p-2 text-start">TOTAL</th>
                                            <th className="p-2 text-start">AMOUNT</th>
                                            <th className="p-2 text-start">BONUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {game_details?.game_detail?.map((game, index) => {
                                            const gamePrice = (game.quantity * parseFloat(game.price))
                                            return (
                                                <tr key={index} className="border-b border-gray-700 text-sm md:text-base font-semibold md:font-medium">
                                                    <td className="border px-2 py-4">{game?.game_name}</td>
                                                    <td className="border px-2 py-4">${parseFloat(game.price).toFixed(2)}</td>
                                                    <td className="border px-2 py-4">{game.quantity}</td>
                                                    <td className="border px-2 py-4">${gamePrice}</td>
                                                    <td className="border px-2 py-4">
                                                        {
                                                            game.deposit_bonus ?
                                                                `$${(gamePrice + parseFloat(game.deposit_bonus)).toFixed(2)}`
                                                                : `$${(gamePrice).toFixed(2)}`
                                                        }
                                                    </td>
                                                    <td className="border px-2 py-4">
                                                        {game.deposit_bonus ? `${game.deposit_bonus} bonus` : `No bonus`}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded my-6 flex-1 h-auto"
                            style={{
                                borderColor: 'rgba(255, 255, 255, 0.16)',
                                borderWidth: '1px'
                            }}>
                            <button type="button"
                                className="w-full chakra-button css-ct8v74 !text-white cursor-not-allowed"
                                style={{ 
                                    backgroundColor: 
                                        payment_type === "BTC" ? "#f7931a" : 
                                        payment_type === "BTCLN" ? "#7B3FF2" : 
                                        payment_type === "LTC" ? "#345D9D" : 
                                        payment_type === "DOGE" ? "#C2A633" : 
                                        payment_type === "USDT" ? "#26A17B" : 
                                        payment_type === "Wallet" ? "#8cc43e" : 
                                        payment_type === "CashApp" ? '#FF9085' : 
                                        "#ff5f66" 
                                }}
                                disabled
                            >
                                Pay with {
                                    payment_type === "BTC" ? "Bitcoin" : 
                                    payment_type === "BTCLN" ? "BTC Lightning" : 
                                    payment_type === "LTC" ? "Litecoin" : 
                                    payment_type === "DOGE" ? "Dogecoin" : 
                                    payment_type === "USDT" ? "USDT (Tether)" : 
                                    payment_type === "Wallet" ? "Wallet" : 
                                    payment_type === "Bonus" ? 'Bonus' : 
                                    payment_type === "CashApp" ? 'CashApp' : 
                                    "PayPal"
                                }
                            </button>
                            <p className='text-sm font-medium text-white mt-1'>
                                By placing this order, you agree with our
                                <Link to="/privacy-policy" className='text-blue-400 pl-1 pr-1 underline'>
                                    Privacy Policy</Link>
                                and
                                <Link to="/terms-of-service" className='text-blue-400 pl-1 pr-1 underline'>
                                    Terms Of Use
                                </Link>
                            </p>

                            <div className='my-4'>
                                <img src={secure} alt="Secure Payment" />
                            </div>

                            <h2 className="font-bold text-lg">Bonuses & Discounts</h2>
                            <hr className="border-white/5 border my-3" />
                            {game_details?.registration_bonus_for_new_users && game_details?.registration_bonus_for_new_users > 0 ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>User First time Deposit Add Bounes</p>
                                    <p>${game_details?.registration_bonus_for_new_users}</p>
                                </div>
                            ) : ""}
                            {bonusAmount ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Deposit Bonus</p>
                                    <p>${bonusAmount}</p>
                                </div>
                            ) : ""}
                            {game_details?.weekly_challenge_bonus ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Weekly Challenge Bonus</p>
                                    <p>${game_details?.weekly_challenge_bonus.toFixed(2)}</p>
                                </div>
                            ) : ""}
                            {game_details?.account_level_bonus ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Bonus Level</p>
                                    <p>${game_details?.account_level_bonus}</p>
                                </div>
                            ) : ""}
                            {game_details?.promocode ? (
                                <div className="mb-2 flex justify-between items-center font-bold">
                                    <p>Promo Code</p>
                                    <span className="text-sm text-white bg-blue-500 px-2 py-1 rounded-md">
                                        {game_details?.promocode}
                                    </span>
                                </div>
                            ) : ""}

                            {game_details?.promocodeDiscount ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Promo Code Discount</p>
                                    <p>{game_details?.promocodeDiscount}</p>
                                </div>
                            ) : null}
                            {game_details?.discountamount ? (
                                <div className="mb-2 flex justify-between items-center font-bold">
                                    <p>PromoCode total discount amount</p>
                                    <p>${game_details?.discountamount}</p>
                                </div>
                            ) : ""}
                            {game_details?.totalamount ? (
                                <div className="mb-2 flex justify-between font-bold">
                                    <p>Original Total</p>
                                    <p>${game_details?.totalamount}</p>
                                </div>
                            ) : ""}

                            <hr className="border-white/5 border my-5" />

                            {game_details?.amount ? (
                                <div className="mt-4 flex justify-between">
                                    <p className="font-bold">Total Amount</p>
                                    <p>${game_details?.amount}</p>
                                </div>
                            ) : null}

                            {
                                payment_status && (
                                    <div className="mt-4 flex justify-between">
                                        <p className="font-bold">Payment Status</p>
                                        {payment_status === "0" ? (
                                            <button
                                                className="text-[#F8924F] py-1 px-4 rounded-md main-border"
                                                style={{ backgroundColor: 'rgba(248, 146, 79, 0.2)' }}
                                            >
                                                Pending
                                            </button>
                                        ) : payment_status === "1" ? (
                                            <button
                                                className="text-[#4AFFA9] py-1 px-4 rounded-md main-border"
                                                style={{ backgroundColor: 'rgba(74, 255, 169, 0.2)' }}
                                            >
                                                Approve
                                            </button>
                                        ) : payment_status === "2" ? (
                                            <button
                                                className="text-[#FF2B62] py-1 px-4 rounded-md main-border"
                                                style={{ backgroundColor: 'rgba(255, 43, 98, 0.2)' }}
                                            >
                                                Cancelled
                                            </button>
                                        ) : payment_status === "3" ? (
                                            <button
                                                className="text-[#FF2B62] py-1 px-4 rounded-md main-border"
                                                style={{ backgroundColor: 'rgba(255, 43, 98, 0.2)' }}
                                            >
                                                Expired
                                            </button>
                                        ) : (<></>)}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default DepositView
