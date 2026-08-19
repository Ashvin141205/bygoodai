import React, { useEffect, useRef } from 'react';
import spinnerPopup from '../../assets/image/spinnerPopup.png';
import spinnerPopupBg from '../../assets/image/spinnerPopupBg.png';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { toast } from 'react-toastify';

const SpinnerPopup = ({ setShowPopup }) => {
    const popupRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, main_balance } = useSelector((state) => state.auth);
    const mainBalance = main_balance;


    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPopup(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePurchase = async (spinCount, amount) => {
        if (mainBalance < amount) {
            toast.error("Insufficient balance. Please recharge your account.");
            return;
        }

        const url = API_ENDPOINTS.SPIN.BUY_SPIN;
        const method = 'POST';
        const body = {
            spin: spinCount,
            amount: amount,
        };

        try {
            const response = await ApiHandler(url, method, body, token, dispatch, navigate);
            //console.log("Purchase response:", response);
            if (response.status === 200) {
                toast.success("Purchase successful! You've received your spins.");
                setShowPopup(false);
                navigate('/wheel');
            } else {
                toast.error("Something went wrong. Please try again later.");
            }
        } catch (error) {
            console.error("Error during purchase:", error);
            toast.error("Error processing your purchase. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div
                ref={popupRef}
                className="relative rounded-lg p-8 shadow-lg w-full max-w-2xl text-white text-center py-10 sm:py-20"
                style={{
                    backgroundImage: `url(${spinnerPopupBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <button
                    className="absolute top-4 right-4 text-white text-2xl font-bold"
                    onClick={() => setShowPopup(false)}
                    aria-label="Close"
                >
                    x
                </button>

                {/* <div>
                    <h3 className='text-[#FF9927] text-xl sm:text-2xl font-extrabold'>Your 1 spin is complete! 🎉</h3>
                </div> */}
                <div className='flex flex-col lg:flex-row justify-center items-center gap-5 mt-5'>
                    <div className='flex-[1]'>
                        <img src={spinnerPopup} alt="Spinner Popup" className='w-[150px] sm:w-[200px] lg:w-[270px]' />
                    </div>
                    <div className='flex-[1.5]'>
                        <p className='text-lg sm:text-xl font-semibold'>If you want more spins,</p>
                        <p className='text-2xl sm:text-3xl font-semibold text-[#FFDD15]'>purchase 5 spins & get 2 spins free!</p>
                        <p className='text-xl sm:text-2xl font-semibold text-[#01D370] mt-5'>Price Plan</p>
                        <div className='flex flex-col sm:flex-row items-center w-full mt-5 gap-5 sm:gap-10'>
                            <div
                                className='bg-[#0E0E0E] cursor-pointer p-4 rounded-xl border border-white/20 w-full max-w-xs h-20 sm:h-24'
                                onClick={() => handlePurchase(1, 1)}
                            >
                                <p className='text-lg sm:text-xl font-bold'>$1</p>
                                <p className='text-sm'>✅ Get 1 Spin</p>
                            </div>
                            <div
                                className='bg-[#290A47] cursor-pointer p-4 rounded-xl border-b-2 border-l-2 border-[#EC29FC] w-full max-w-xs h-20 sm:h-24'
                                onClick={() => handlePurchase(5, 5)}
                            >
                                <p className='text-lg sm:text-xl font-bold'>$5</p>
                                <p className='text-sm sm:flex sm:items-center gap-1'>
                                    <span>✅</span>
                                    <span> Get 5 Spins & <br className="hidden sm:block" /> 2 Spins Free</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpinnerPopup;
