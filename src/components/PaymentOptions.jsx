import React, { useState } from 'react';
import { ApiHandler } from '../helper/ApiHandler'; // Assuming you have this helper
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from './Common/Loading'; // Assuming you have this
import { EXTRA_ENDPOINTS } from '../config/apiEndpoints';

// Import Apple Pay and Google Pay icons if desired
// import ApplePayIcon from 'path/to/apple-pay-icon.svg';
// import GooglePayIcon from 'path/to/google-pay-icon.svg';

const PaymentOptions = ({ amount, items /* other props like cartData, userData */ }) => {
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleHostedPayment = async (wayCode) => {
        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                // Map your cart items/order details correctly here
                items: items.map(item => ({
                    item_id: item.id || item.game_id, // Adjust based on your item structure
                    name: item.game_name,
                    quantity: item.quantity,
                    price: item.game_price || item.price, // Adjust based on your item structure
                })),
                wayCode: wayCode,
            };

            console.log("Sending payload to generateHostedPaymentLink:", payload); // Debug log

            const response = await ApiHandler(
                EXTRA_ENDPOINTS.GENERATE_HOSTED_PAYMENT_LINK,
                'POST',
                payload,
                token,
                dispatch,
                navigate
            );

            console.log("Response from generateHostedPaymentLink:", response); // Debug log

            if (response?.data?.status?.code === 1 && response?.data?.data?.cashierUrl) {
                // Redirect user to the hosted payment page
                window.location.href = response.data.data.cashierUrl;
            } else {
                toast.error(response?.data?.status?.message || `Failed to initiate ${wayCode} payment.`);
            }
        } catch (error) {
            console.error(`Error initiating ${wayCode} payment:`, error);
            toast.error(`An error occurred while initiating ${wayCode} payment.`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="payment-options">
            {/* ... Other payment options like CashApp, Crypto ... */}

            {/* Google Pay Button */}
            <button
                onClick={() => handleHostedPayment('googlepay')}
                className="w-full py-3 px-4 my-2 bg-black text-white rounded-md font-bold text-lg border border-gray-600 hover:bg-gray-800 transition duration-200 flex items-center justify-center"
                aria-label="Pay with Google Pay"
            >
                {/* Add Google Pay Logo/Icon here if desired */}
                {/* <img src={GooglePayIcon} alt="Google Pay" className="h-6 mr-2" /> */}
                <span>Pay with Google Pay</span>
            </button>

            {/* Apple Pay Button */}
            <button
                onClick={() => handleHostedPayment('applepay')}
                className="w-full py-3 px-4 my-2 bg-black text-white rounded-md font-bold text-lg border border-gray-600 hover:bg-gray-800 transition duration-200 flex items-center justify-center"
                aria-label="Pay with Apple Pay"
            >
                {/* Add Apple Pay Logo/Icon here if desired */}
                {/* <img src={ApplePayIcon} alt="Apple Pay" className="h-6 mr-2" /> */}
                <span>Pay with Apple Pay</span>
            </button>

             {/* Existing CashApp Button/Logic - can remain separate or integrated */}
             {/* <button onClick={() => navigate('/cashapp-payment', { state: { ... } })} ... >Pay with CashApp</button> */}

        </div>
    );
};

export default PaymentOptions;