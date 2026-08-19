import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyIcon } from '../../utils/Icons'; // Assuming CopyIcon path is correct
import { useDispatch, useSelector } from 'react-redux';
import { ApiHandler } from '../../helper/ApiHandler'; // Assuming ApiHandler path is correct
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useNavigate } from 'react-router-dom';
// Import components from react-share
import {
    FacebookShareButton,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailShareButton, // Optional: Email sharing
    FacebookIcon,
    TelegramIcon,
    TwitterIcon,
    WhatsappIcon,
    EmailIcon, // Optional: Email icon
} from 'react-share';

const Referral = () => {
    const userData = useSelector(state => state.auth.user); // Assuming user object contains referral_code
    const referralCode = userData?.referral_code; // Extracted for clarity
    const [referrals, setReferrals] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [dailyEarnings, setDailyEarnings] = useState([]);
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Construct Referral Link and Share Message ---
    // IMPORTANT: Replace 'https://www.luckycharmsweep.com' with your actual website's base URL
    const siteBaseUrl = process.env.REACT_APP_WEBSITE_URL || 'https://www.luckycharmsweep.com';
    const referralLink = referralCode ? `${siteBaseUrl}/sign-up?ref=${referralCode}` : '';
    const shareMessage = `Join me on LuckyCharmSweep and get a bonus! Use my referral code: ${referralCode}`;
    const shareTitle = "Join LuckyCharmSweep!"; // For platforms like Email, Twitter

    useEffect(() => {
        if (token) { // Ensure token is available before fetching
            fetchReferrals();
            fetchEarningsDetails();
        }
    }, [token]); // Added token as a dependency

 const fetchReferrals = async () => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.BONUS.GET_REFERRAL, 'POST', undefined, token, dispatch, navigate);
            setReferrals(response?.data?.data || []);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            
            // Check if the error message is due to the expected "Data Not Found" 
            // from the backend's incorrect 400 response.
            const errorMessage = String(error);

            if (!errorMessage.includes('Data Not Found')) {
                // Only show a generic error toast for unexpected network or server errors.
                toast.error('Failed to fetch referrals.');
            }
            // If it is 'Data Not Found', we skip the toast, and the 'referrals' state 
            // remains at its initial empty array state ([]), correctly showing the 
            // "No referrals found yet. Share your code!" message.
        }
    };

    const fetchEarningsDetails = async () => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.BONUS.GET_EARNINGS, 'GET', undefined, token, dispatch, navigate);
            if (response?.data?.status?.code === 1 && response.data.data) {
                setTotalEarnings(response.data.data.total_earnings || 0);
                setDailyEarnings(response.data.data.daily_earnings || []);
            } else {
                console.error('Failed to fetch earnings details:', response?.data?.status?.message);
                toast.error('Failed to fetch earnings details.');
            }
        } catch (error) {
            console.error('Error fetching earnings details:', error);
            toast.error('Error fetching earnings details.');
        }
    };

    const copyToClipboard = (textToCopy, message) => {
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            toast.success(message || 'Copied to clipboard!');
        } else {
            toast.error('Nothing to copy!');
        }
    };

    const handleViewDetails = () => {
        navigate('/referral/earnings-details', { state: { dailyEarnings: dailyEarnings } });
    };

    return (
        <div className="flex justify-center items-center py-8"> {/* Added py-8 for spacing */}
            <div className="w-full max-w-lg main-dot-bg p-6 sm:p-10 rounded-lg shadow-2xl"> {/* Increased max-width and shadow */}
                <h1 className="text-3xl font-semibold text-center mb-6 text-yellow-500">Referrals & Earnings</h1>
 <p className="text-md text-center text-gray-400 mb-6"> {/* MODIFIED THIS LINE */}
                    Earn $5 per referral & 10% lifetime commission!
                </p>
                {/* Referral Code Section */}
                <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
                        <span className="text-lg font-medium text-[#cbd5e1] mb-2 sm:mb-0">Your Referral Code:</span>
                        <div className="flex items-center bg-gray-700/60 px-3 py-1.5 rounded-md">
                            <span className="text-lg font-semibold text-[#FFDD15] mr-2">{referralCode || 'N/A'}</span>
                            <button
                                onClick={() => copyToClipboard(referralCode, 'Referral code copied!')}
                                disabled={!referralCode}
                                className="p-1 rounded text-[#38bdf8] hover:text-[#0ea5e9] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Copy referral code"
                            >
                                <CopyIcon className="w-5 h-5 fill-current" /> {/* Adjusted size */}
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center bg-gray-700/60 px-3 py-1.5 rounded-md mb-4">
                        <span className="text-sm text-gray-300 mr-2 truncate flex-1">Referral Link:</span>
                        <button
                            onClick={() => copyToClipboard(referralLink, 'Referral link copied!')}
                            disabled={!referralLink}
                            className="p-1 rounded text-[#38bdf8] hover:text-[#0ea5e9] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Copy referral link"
                        >
                            <CopyIcon className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                    {referralLink && (
                         <p className="text-xs text-gray-400 mb-3 truncate">{referralLink}</p>
                    )}


                    {/* Social Sharing Icons */}
                    {referralCode && referralLink && (
                        <div className="mt-4 pt-3 border-t border-gray-700">
                            <p className="text-sm text-center text-gray-300 mb-3">Share your code:</p>
                            <div className="flex justify-center items-center space-x-3">
                                <WhatsappShareButton
                                    url={referralLink}
                                    title={shareMessage}
                                    separator=" " // Adds a space before the URL if title is also used
                                    className="transform hover:scale-110 transition-transform duration-150"
                                >
                                    <WhatsappIcon size={40} round />
                                </WhatsappShareButton>

                                <TelegramShareButton
                                    url={referralLink}
                                    title={shareMessage}
                                    className="transform hover:scale-110 transition-transform duration-150"
                                >
                                    <TelegramIcon size={40} round />
                                </TelegramShareButton>

                                <FacebookShareButton
                                    url={referralLink}
                                    quote={shareMessage} // Message that appears with the shared link
                                    hashtag="#luckycharmsweep" // Optional hashtag
                                    className="transform hover:scale-110 transition-transform duration-150"
                                >
                                    <FacebookIcon size={40} round />
                                </FacebookShareButton>

                                <TwitterShareButton
                                    url={referralLink}
                                    title={shareTitle + " " + shareMessage} // Combine title and message for Twitter
                                    hashtags={["luckycharmsweep", "referral"]} // Optional hashtags
                                    className="transform hover:scale-110 transition-transform duration-150"
                                >
                                    <TwitterIcon size={40} round />
                                </TwitterShareButton>

                                <EmailShareButton
                                     url={referralLink}
                                     subject={shareTitle}
                                     body={`${shareMessage}\n\nClick here to join: ${referralLink}`}
                                     separator="\n\n"
                                     className="transform hover:scale-110 transition-transform duration-150"
                                >
                                     <EmailIcon size={40} round />
                                </EmailShareButton>
                            </div>
                        </div>
                    )}
                </div>


                {/* Total Earnings Section */}
                <div className="flex flex-col xs:flex-row justify-center items-center mb-6 border-t border-b border-gray-700 py-4">
                    <span className="text-lg font-medium text-[#cbd5e1]">Total Earnings: </span>
                    <span className="text-lg font-semibold ml-2 text-[#4AFFA9]">
                        ${totalEarnings.toFixed(2)}
                    </span>
                </div>

                {/* View Details Link/Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleViewDetails}
                        disabled={dailyEarnings.length === 0}
                        className="px-6 py-2 rounded-md bg-[#FFDD15] text-[#0E0E0E] font-semibold hover:bg-[#f0d214] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {dailyEarnings.length > 0 ? 'View Earning Details' : 'No Daily Earnings Available'}
                    </button>
                </div>

                {/* Referrals Table */}
                {referrals.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-600"> {/* Adjusted border color */}
                        <table className="min-w-full">
                            <thead>
                                <tr className='bg-[#290A47]'>
                                    <th className="py-3 px-4 text-left font-medium text-white text-sm">Referral Name</th> {/* Adjusted text size */}
                                    <th className="py-3 px-4 text-left font-medium text-white text-sm">Status</th> {/* Adjusted text size */}
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((referral, index) => (
                                    <tr key={index} className={`border-t bg-[#0E0E0E] border-gray-700 ${index % 2 !== 0 ? 'bg-opacity-50' : ''}`}> {/* Alternating row bg slightly */}
                                        <td className="py-3 px-4 text-white font-semibold text-sm">{referral.name}</td> {/* Adjusted text size */}
                                        <td className="py-3 px-4 text-sm"> {/* Adjusted text size */}
                                            <span
                                                className={`inline-flex items-center justify-center px-2 py-1 font-semibold leading-none rounded-full ${referral.status === '0' ? 'text-[#F8924F]' : 'text-[#4AFFA9]'}`}>
                                                {referral.status === '0' ? 'Pending' : 'Completed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 mt-4">No referrals found yet. Share your code!</div>
                )}
            </div>
        </div>
    );
}

export default Referral;