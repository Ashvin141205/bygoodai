import React, { useState } from 'react';
import PayIcon from '../../../assets/image/pay.png';
import PaymentButton from '../../../components/PaymentButton';
import BitCoinLogo from '../../../assets/image/bitcoin.png';
import DogeCoinLogo from '../../../assets/image/dogecoin.png';
import LitecoinLogo from '../../../assets/image/Litecoin.png';
import cashAppLogo from '../../../assets/image/cashApp.png';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../components/Common/Loading';
import { ApiHandler } from '../../../helper/ApiHandler';
import { DEPOSIT_ENDPOINTS } from '../../../config/apiEndpoints';

const DepositToWallet = () => {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [totalamount, setTotalamount] = useState('');
    const [disabledTrue, setDisabledTrue] = useState(true);
    const userDetails = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(false);
    const email = userDetails?.email;

    const handleClick = (method) => {
        setSelectedMethod(method);
        if (amount) {
            setDisabledTrue(false);
        }
    };

    const handleTopUpSubmit = async () => {
        const body = {
            amount: amount ? parseFloat(amount) : '',
            email: email,
            promocode: '',
            promocodeDiscount: '',
            discountamount: '',
            amount: totalamount ? parseFloat(totalamount) : '',
            payment_type: selectedMethod,
            cashAppScreenshot: ''
        }

        if (selectedMethod === 'CashApp') {
            try {
                setLoading(true);
                const response = await ApiHandler(DEPOSIT_ENDPOINTS.GET_CASHAPP_BARCODE, 'POST', undefined, token, dispatch, navigate);
                const barcodeImage = response.data?.data?.barcode_image;
                const cashapplink = response.data?.data?.cashapplink;

                if (response.data.status.code === 1 && barcodeImage && cashapplink) {
                    navigate("/cashapp", {
                        state: {
                            directPassPage: true,
                            isCheckoutAllowed: true,
                            totalAmountState: parseFloat(amount),
                            method: selectedMethod,
                            finalTotal: parseFloat(totalamount),
                            userData: userDetails,
                            proof_image: barcodeImage,
                            cashapp_url: cashapplink,

                            typeApi: true,
                            totalAmount: parseFloat(amount)
                        },
                    });
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching CashApp barcode:", error);
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                const response = await ApiHandler(DEPOSIT_ENDPOINTS.GET_WALLET_DETAIL, 'POST', body, token, dispatch, navigate);
                if (response?.data?.status === 401) {
                    toast.error(response?.data?.message);
                } else {
                    setLoading(false);
                    window.location.href = response?.data?.data?.checkoutLink;
                }
            } catch (error) {
                //console.log(error);
                setLoading(false);
            }
        }
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className=" min-h-screen bg-[#0e0e0e] max-w-[500px] mx-auto">
            <div className="bg-[#222222] text-white p-8 rounded-lg shadow-md w-full ">
                <h2 className="text-2xl font-bold text-center text-[#FFDD15] underline mb-4">Deposit to Wallet</h2>

                <p className="text-center text-[#EC29FC] mb-6 ">
                    Happy Hours Activated!
                    Get 10% cashback when you deposit
                </p>

                <div className="mb-6 flex justify-center">
                    <img
                        src={PayIcon}
                        alt="Payment Icon"
                        className="w-44 rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-2">Amount</label>
                    <input
                        type="text"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setTotalamount(e.target.value) }}
                        className="w-full p-2 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
                    />
                </div>

                <fieldset className="mb-4 mt-5">
                    <legend className="block text-white mb-2">Payment Methods</legend>
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 w-full ">
                        <PaymentButton
                            bgColor={selectedMethod === 'BTC' ? "#D47D18" : "#F7931A"}
                            logo={BitCoinLogo}
                            title={"Bitcoin"}
                            onClick={() => handleClick('BTC')}
                        />
                        <PaymentButton
                            bgColor={selectedMethod === 'DOGE' ? "#9F8D2E" : "#C2A633"}
                            logo={DogeCoinLogo}
                            title={"Dogecoin"}
                            onClick={() => handleClick('DOGE')}
                        />
                        <PaymentButton
                            bgColor={selectedMethod === 'LTC' ? "#2D4F89" : "#345D9D"}
                            logo={LitecoinLogo}
                            title={"Litecoin"}
                            onClick={() => handleClick('LTC')}
                        />
                        <PaymentButton
                            bgColor={selectedMethod === 'CashApp' ? "#E6716D" : "#FF9085"}
                            logo={cashAppLogo}
                            title={"CashApp"}
                            onClick={() => handleClick('CashApp')}
                        />
                    </div>
                </fieldset>

                <button
                    className={`w-full py-2 rounded-md font-bold text-lg ${!amount || amount === 0 || disabledTrue ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : "bg-[#FFDD15] text-black"}`}
                    disabled={!amount || amount === 0 || disabledTrue}
                    onClick={() => {
                        handleTopUpSubmit();
                    }}
                >
                    Next
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    By choosing to deposit, you're agreeing to our Privacy Policy & Terms and Conditions.
                </p>
            </div>
        </div>
    );
}

export default DepositToWallet;
