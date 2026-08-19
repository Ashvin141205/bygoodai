"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomGameSelect from './CustomGameSelect';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Common/Loading";
import { useDispatch, useSelector } from "react-redux";
// Assuming ApiHandler has the signature: (url, method, data, token, dispatch, navigate)
import { ApiHandler } from "../../../helper/ApiHandler"; 
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { EXTRA_ENDPOINTS, GAME_ENDPOINTS } from '../../../config/apiEndpoints';

// CSS for the "always visible" approach
const dynamicStyles = `
  /* Keyframe for the highlight effect */
  @keyframes highlight-fade {
    0% { background-color: rgba(255, 221, 21, 0.3); } /* #FFDD15 at 30% opacity */
    100% { background-color: transparent; }
  }
  .highlight-animation {
    animation: highlight-fade 2s ease-out;
  }
  
  /* Container for each step to handle transitions */
  .step-container {
    transition: opacity 0.4s ease-in-out;
    border-radius: 8px; /* Makes the highlight look nicer */
  }

  /* Class to apply when a step is inactive */
  .step-disabled {
    opacity: 0.4;
    pointer-events: none;
  }
`;

const FreePlayForm = () => {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [platform, setPlatform] = useState("");
    const [applyStatus, setApplyStatus] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRedeemSuccessPopup, setShowRedeemSuccessPopup] = useState(false);
    const [freeplayRequests, setFreeplayRequests] = useState([]);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [phoneInput, setPhoneInput] = useState("");
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [showUpdatePhoneModal, setShowUpdatePhoneModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [applyingCode, setApplyingCode] = useState(false);
    const [isCodeApplied, setIsCodeApplied] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Initial couponBalance is null to differentiate from a zero balance
    const [couponBalance, setCouponBalance] = useState(null);

    // State to trigger animations for each section
    const [animatePlatform, setAnimatePlatform] = useState(false);
    const [animatePhone, setAnimatePhone] = useState(false);
    const [animateSubmit, setAnimateSubmit] = useState(false);

    // Refs for scrolling to elements
    const platformRef = useRef(null);
    const phoneVerificationRef = useRef(null);
    const submitButtonRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // FIX: Sequential API calls to avoid concurrency issues with ApiHandler arguments

                // 1. Fetch Games List
                const gamesResponse = await ApiHandler(
                    GAME_ENDPOINTS.LIST, 
                    'POST', 
                    { gameID: "", filter: "platform", is_available: "1" }, 
                    token, 
                    dispatch, 
                    navigate
                );
                if (gamesResponse?.data?.data) {
                    setGames(gamesResponse.data.data);
                }

                // 2. Fetch Phone Number
                const phoneResponse = await ApiHandler(
                    EXTRA_ENDPOINTS.GET_PHONE_NUMBER,
                    'GET', 
                    null, // Explicitly pass null for GET body
                    token, 
                    dispatch, 
                    navigate
                );
                if (phoneResponse?.data?.status?.code === 1) {
                    const { phone, is_phone_verified } = phoneResponse.data.data;
                    setPhoneNumber(phone);
                    setPhoneInput(phone || "");
                    setIsPhoneVerified(is_phone_verified === 1);
                }

                // 3. Fetch Freeplay Requests
                const freeplayResponse = await ApiHandler(
                    EXTRA_ENDPOINTS.GET_FREEPLAY_REQUESTS,
                    'GET', 
                    null, // Explicitly pass null for GET body
                    token, 
                    dispatch, 
                    navigate
                );
                if (freeplayResponse?.data?.status?.code === 1 && freeplayResponse?.data?.data) {
                    setFreeplayRequests(freeplayResponse.data.data);
                } else {
                    setFreeplayRequests([]);
                }

                // 4. Check for coupon cookie
                const freeplayCode = Cookies.get('freeplayCouponCode');
                if (freeplayCode) {
                    setCode(freeplayCode);
                }

            } catch (error) {
                console.error("Error fetching initial data (Sequential attempt):", error);
                // ApiHandler already surfaces the API error toast (e.g., phone-related errors),
                // so avoid adding a generic fallback toast here to prevent duplicates.
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [token, dispatch, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);


    const handleApplyCode = async () => {
        setApplyingCode(true);
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.VERIFY_COUPONS_CODE, 'POST', { coupons_code: code }, token, dispatch, navigate);
            if (response?.data?.status?.code === 1) {
                toast.success("Great news! Your coupon code has been applied.");
                setApplyStatus("Code applied successfully!");
                setCouponBalance(response.data.data.coupon_balance);
                setIsCodeApplied(true);
                
                setAnimatePlatform(true);

                setTimeout(() => {
                    platformRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);

            } else {
                const errorMessage = response?.data?.status?.message || "Error applying the code.";
                setApplyStatus(errorMessage);
            }
        } catch (error) {
            setApplyStatus("Error applying the code. Please try again.");
        } finally {
            setApplyingCode(false);
        }
    };
    
    const handlePlatformSelect = (game) => {
        setPlatform(game.id);
        setAnimatePhone(true);
        setTimeout(() => {
            phoneVerificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleUpdateAndSendCode = async () => {
        if (resendCooldown > 0) {
            toast.info(`Please wait ${resendCooldown} seconds before trying again.`);
            return;
        }
        if (!phoneInput) {
            toast.error("Please enter a phone number.");
            return;
        }
        setLoading(true);
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.UPDATE_PHONE_NUMBER, 'POST', { phone: phoneInput }, token, dispatch, navigate);
            if (response?.data?.status?.code === 1) {
                toast.success("Verification code sent successfully!");
                setPhoneNumber(phoneInput);
                setShowUpdatePhoneModal(false);
                setShowVerificationPopup(true);
                setResendCooldown(30);
            } else {
                toast.error(response?.data?.status?.message || "Failed to update phone number.");
            }
        } catch (error) {
            // ApiHandler already surfaces the error toast
            // so avoid adding a generic fallback to prevent duplicates.
        } finally {
            setLoading(false);
        }
    };
    
    const handleSendVerificationCode = async () => {
        if (resendCooldown > 0) {
            toast.info(`Please wait ${resendCooldown} seconds before trying again.`);
            return;
        }
        setLoading(true);
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.SEND_SMS_CODE, 'POST', { phone_number: phoneNumber }, token, dispatch, navigate);
            if (response?.data?.status?.code === 1) {
                toast.success("Verification code sent successfully!");
                setShowVerificationPopup(true);
                setResendCooldown(30);
            } else {
                toast.error(response?.data?.status?.message || "Failed to send verification code.");
            }
        } catch (error) {
            // ApiHandler already surfaces the error toast
            // so avoid adding a generic fallback to prevent duplicates.
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setLoading(true);
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.VERIFY_SMS_CODE, 'POST', { phone_number: phoneNumber, otp: verificationCode }, token, dispatch, navigate);
            if (response?.data?.status?.code === 1) {
                toast.success("Phone number verified successfully!");
                setIsPhoneVerified(true);
                setShowVerificationPopup(false);
                setAnimateSubmit(true);
                setTimeout(() => {
                    submitButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else {
                toast.error(response?.data?.status?.message || "Failed to verify code.");
            }
        } catch (error) {
            // ApiHandler already surfaces the error toast (e.g., OTP format validation)
            // so avoid adding a generic fallback to prevent duplicates.
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!platform) {
            toast.error("Please select a game.");
            return;
        }
        setLoading(true);
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.FREE_PLAY_COUPON_BONUS, 'POST', {
                coupons_code: code,
                coupon_balance: couponBalance,
                game_id: platform,
            }, token, dispatch, navigate);

            if (response?.data?.status?.code === 1) {
                toast.success("Bonus applied successfully!");
                setShowRedeemSuccessPopup(true);
                
                // Clear the coupon code from cookies, localStorage, and state after successful redemption
                Cookies.remove('freeplayCouponCode');
                localStorage.removeItem('couponCode');
                localStorage.removeItem('showCouponPopup');
                sessionStorage.removeItem('couponCode');
                sessionStorage.removeItem('showCouponPopup');
                setCode('');
                setIsCodeApplied(false);
                setCouponBalance(null);
                setApplyStatus('');
            } else {
                toast.error(response?.data?.status?.message || "Error applying bonus.");
            }
        } catch (error) {
            toast.error("Error submitting the form.");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { name: 'Game', selector: row => row.game_name, sortable: true },
        { name: 'Coupon', selector: row => row.coupon_code, sortable: true },
        { name: 'Date', selector: row => format(new Date(row.created_date), 'yyyy-MM-dd HH:mm:ss'), sortable: true },
        { name: 'Status', cell: row => {
            const statusMap = {
                "Pending": <span className="text-yellow-500">Pending</span>,
                "Approved": <span className="text-green-500">Approved</span>,
                "Rejected": <span className="text-red-500">Rejected</span>,
                "Expired": <span className="text-gray-500">Expired</span>
            };
            return statusMap[row.payment_status] || <span className="text-gray-500">Unknown</span>;
          }, sortable: true 
        },
        { name: 'Balance Type', selector: row => row.balance_type, sortable: true }
    ];
    
    const customStyles = {
        headCells: { style: { backgroundColor: '#290A47', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', padding: '10px' } },
        rows: { style: { backgroundColor: '#0E0E0E', color: '#FFFFFF', fontSize: '14px', fontWeight: '400' } },
        pagination: { style: { backgroundColor: '#222222', color: '#FFFFFF' } },
        noData: { style: { padding: '20px', textAlign: 'center', backgroundColor: '#0E0E0E', color: '#FFFFFF', fontSize: '16px' } },
    };
    
    if (loading) return <Loading />;

    return (
        <div>
            <style>{dynamicStyles}</style>
            
            <form onSubmit={handleSubmit} className="p-4 main-dot-bg text-white rounded-lg shadow-lg justify-center space-y-6">
                
                {/* Step 1: Apply Code */}
                <div className="step-container">
                    <div className="mb-4 bg-[#290A47] p-3 rounded-md text-yellow-400 text-center font-semibold">
                        Coupon Balance: {couponBalance !== null ? couponBalance : 'Enter a code to see balance'}
                    </div>
                    <label htmlFor="code" className="block text-white mb-2 font-semibold">1. FREE-PLAY CODE *</label>
                    <div className="flex flex-col sm:flex-row">
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="CODE"
                            required
                            className="flex-grow p-2 mb-2 sm:mb-0 sm:mr-2 rounded-md bg-[#0E0E0E] main-border text-sm text-white placeholder:text-white focus:outline-none"
                            disabled={isCodeApplied}
                        />
                        <button
                            type="button"
                            onClick={handleApplyCode}
                            className={`tracking-widest font-bold text-sm bg-[#FFDD15] px-2 xl:px-10 py-2.5 hover:bg-[#ffc21f] rounded-sm text-black ${applyingCode || isCodeApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ borderWidth: "1px", borderColor: "rgba(255, 255, 255, 0.16)" }}
                            disabled={applyingCode || isCodeApplied}
                        >
                            {isCodeApplied ? '✓ Applied' : (applyingCode ? 'Applying...' : 'Apply code')}
                        </button>
                    </div>
                    {applyStatus && <p className={`mt-2 text-sm ${applyStatus.includes("successfully") ? "text-green-400" : "text-red-400"}`}>{applyStatus}</p>}
                </div>
                
                {/* Step 2: Select Platform */}
                <div 
                    ref={platformRef} 
                    className={`step-container ${!isCodeApplied ? 'step-disabled' : ''} ${animatePlatform ? 'highlight-animation' : ''}`}
                    onAnimationEnd={() => setAnimatePlatform(false)}
                >
                    <label htmlFor="platform" className="block text-white mb-2 font-semibold">2. Select a Game *</label>
                    <CustomGameSelect
                        games={games}
                        selectedGame={platform}
                        onSelect={handlePlatformSelect}
                    />
                </div>

                {/* Step 3: Phone Verification */}
                <div 
                    ref={phoneVerificationRef} 
                    className={`step-container p-4 mt-4 main-dot-bg text-white rounded-lg shadow-lg ${!platform ? 'step-disabled' : ''} ${animatePhone ? 'highlight-animation' : ''}`}
                    onAnimationEnd={() => setAnimatePhone(false)}
                >
                    <h2 className="text-xl font-semibold mb-4 text-white">3. Phone Verification</h2>
                     {isPhoneVerified ? (
                        <p className="text-green-500">✓ Your phone number is verified.</p>
                    ) : (
                        <div>
                            {phoneNumber ? (
                                <div>
                                    <div className="flex items-center mb-2">
                                        <p className="mr-4">Your phone number: {phoneNumber} </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowUpdatePhoneModal(true)}
                                            className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendVerificationCode}
                                        type="button"
                                        className={`tracking-widest font-bold text-sm bg-[#FFDD15] px-2 xl:px-10 py-2.5 rounded-sm text-black ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={resendCooldown > 0}
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send Verification Code'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-2 text-yellow-400">A verified phone number is required to redeem free play.</p>
                                    <button onClick={() => setShowUpdatePhoneModal(true)} type="button" className="tracking-widest font-bold text-sm bg-blue-600 px-4 py-2.5 rounded-sm text-white hover:bg-blue-700">
                                        Add Phone Number
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 4: Submit */}
                <div 
                    ref={submitButtonRef} 
                    className={`step-container pt-4 text-center ${animateSubmit ? 'highlight-animation' : ''}`}
                    onAnimationEnd={() => setAnimateSubmit(false)}
                >
                     <button
                        type="submit"
                        className={`w-40 border border-[#FFDD15] p-2 mt-3 font-semibold text-base rounded-md mx-auto block ${platform && isCodeApplied && isPhoneVerified ? "bg-[#FFDD15] text-black" : "bg-gray-500 text-gray-300 cursor-not-allowed"}`}
                        disabled={!platform || !isCodeApplied || !isPhoneVerified}
                    >
                        Submit Request
                    </button>
                </div>
            </form>
            
            <div className="p-4 mt-4 main-dot-bg text-white rounded-lg shadow-lg ">
                <h2 className="text-xl font-semibold mb-4 text-white">Your Freeplay Requests</h2>
                <DataTable
                    columns={columns}
                    data={freeplayRequests}
                    customStyles={customStyles}
                    pagination
                    responsive
                    striped
                    className="text-white"
                />
            </div>

            {showUpdatePhoneModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                    <div className="bg-gray-800 rounded-lg p-6 text-white w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Update Your Phone Number</h2>
                        <p className="mb-4 text-sm text-gray-300">A verification code will be sent to this number.</p>
                        <PhoneInput
                            country={'us'}
                            value={phoneInput}
                            onChange={phone => setPhoneInput(phone)}
                            inputProps={{ name: 'phone', required: true, autoFocus: true }}
                            containerClass="w-full mb-4"
                            inputClass="w-full !bg-[#0E0E0E] !text-white !py-2 !px-3 !border !border-white/50 !rounded-md"
                            buttonClass="!bg-[#222222] !border !border-white/50"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowUpdatePhoneModal(false)} className="bg-gray-500 text-white rounded-md font-semibold text-base py-2 px-4">
                                Cancel
                            </button>
                           <button
                                onClick={handleUpdateAndSendCode}
                                className={`bg-blue-600 text-white rounded-md font-semibold text-base py-2 px-4 ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={resendCooldown > 0}
                            >
                                {resendCooldown > 0 ? `Sending in ${resendCooldown}s` : 'Save & Send Code'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showVerificationPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                    <div className="bg-gray-800 rounded-lg p-6 text-white">
                        <h2 className="text-xl font-semibold mb-4">Enter Verification Code</h2>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Verification Code"
                            className="w-full p-2 mb-4 rounded-md bg-[#0E0E0E] main-border text-sm text-white placeholder:text-white"
                        />
                        <button onClick={handleVerifyCode} className="bg-[#FFDD15] text-black rounded-md font-semibold py-2 px-4 mr-2">
                            Verify
                        </button>
                        <button onClick={() => setShowVerificationPopup(false)} className="bg-gray-500 text-white rounded-md font-semibold py-2 px-4">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {showRedeemSuccessPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
                   <div className="relative bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg w-full max-w-md p-6 shadow-2xl">
                        <button
                            onClick={() => {
                                setShowRedeemSuccessPopup(false);
                                navigate("/bonuses/level");
                            }}
                            className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
                        >
                            &times;
                        </button>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <span role="img" aria-label="success" className="text-4xl">✅</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Freeplay Redeemed!</h2>
                        <p className="text-lg mb-4 text-center">
                            Your request has been processed successfully. You will receive your platform credentials and balance shortly within 2-5 minutes.
                        </p>
                        <p className="text-center mb-4">Please be patient.</p>
                        <p className="text-center mb-4">
                            Subscribe to our Telegram channel for more offers, promotions, and updates!
                            <br />
                            <a href="https://t.me/LuckyCharmSweepChannel" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                https://t.me/LuckyCharmSweepChannel
                            </a>
                        </p>
                        <button
                            onClick={() => {
                                setShowRedeemSuccessPopup(false);
                                navigate("/bonuses/level");
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-md w-full transition-colors duration-200"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FreePlayForm;