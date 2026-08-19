import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import Loading from '../../../components/Common/Loading';
import { ApiHandler } from '../../../helper/ApiHandler';
// Import the new unified reducer
import { SET_LEVEL_DATA, clearSignupBonus } from '../../../redux/slice/authSlice';
import { EXTRA_ENDPOINTS } from '../../../config/apiEndpoints';

const BonusesLevel = () => {
    const [levelData, setLevelData] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- Logic for the Signup Bonus Popup (Unchanged) ---
    const signupBonus = useSelector((state) => state.auth.signupBonus);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (signupBonus && signupBonus.code) {
            setShowPopup(true);
            localStorage.setItem('signupBonusCode', signupBonus.code);
            localStorage.setItem('showSignupBonusPopup', 'true');
            Cookies.set('freeplayCouponCode', signupBonus.code, { expires: 1, path: '/' });
        }
    }, [signupBonus]);

    useEffect(() => {
        const savedCode = localStorage.getItem('signupBonusCode');
        const showPopupFlag = localStorage.getItem('showSignupBonusPopup');

        if (savedCode && showPopupFlag === 'true') {
            setShowPopup(true);
            Cookies.set('signupBonusCode', savedCode, { expires: 1, path: '/' });
        }
    }, []);

    const handleCopy = () => {
        toast.success("Coupon code copied to clipboard!");
    };

    const closePopupAndClearBonus = () => {
        setShowPopup(false);
        dispatch(clearSignupBonus());
        localStorage.removeItem('signupBonusCode');
        localStorage.removeItem('showSignupBonusPopup');
        Cookies.remove('signupBonusCode');
    };
    // --- End of Popup Logic ---

    // --- NEW: Unified Data Fetching Effect ---
    useEffect(() => {
        const fetchAllLevelData = async () => {
            if (!token) {
                setLoading(false);
                return; // Don't fetch if not logged in
            }
            setLoading(true);
            try {
                // Call the single, unified API endpoint
                // (Assuming the endpoint is /get_level_progress.php)
                const response = await ApiHandler(EXTRA_ENDPOINTS.LEVEL_PROGRESS, 'POST', undefined, token, dispatch, navigate);
                
                if (response.data && response.data.status.code === 1) {
                    const data = response.data.data;
                    
                    // Dispatch all data to Redux to update the entire app state
                    // This updates activeLevel, lifetimeDeposit, and progressPercent for the Header
                    dispatch(SET_LEVEL_DATA(data));

                    // Enrich the full list of levels (data.allLevels) for *this page's* UI
                    // The backend already calculated 'active', 'progress', and 'progressStatus'
                    const enrichedData = enrichData(data.allLevels);
                    setLevelData(enrichedData);
                } else {
                    console.error('Failed to fetch level data:', response.data?.status?.message);
                }
            } catch (error) {
                console.error('Error fetching level data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllLevelData();
    }, [token, dispatch, navigate]); // Only depends on token

    // Function to enrich the API data with background and filter (Unchanged)
    const enrichData = (apiData) => {
        // This static data is for styling only
        const DamylevelData = [
            { id: '1', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(215, 98, 69, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '2', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(215, 98, 69, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '3', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(215, 98, 69, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '4', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(215, 98, 69, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '5', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(191, 191, 191, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '6', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(191, 191, 191, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '7', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(191, 191, 191, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '8', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(191, 191, 191, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '9', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(252, 149, 30, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '10', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(252, 149, 30, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '11', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(252, 149, 30, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '12', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(252, 149, 30, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '13', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '14', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '15', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '16', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '17', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '18', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '19', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' },
            { id: '20', filter: 'brightness(0.5)', background: 'radial-gradient(circle, rgba(206, 241, 251, 0.8) 0%, rgba(0, 0, 0, 0) 67%)' }
        ];

        // Ensure apiData is an array before mapping
        if (!Array.isArray(apiData)) {
            console.error("enrichData expected an array but received:", apiData);
            return [];
        }

        return apiData.map(item => {
            const match = DamylevelData.find(d => d.id === item.id);
            return match ? { ...item, background: match.background, filter: match.filter } : item;
        });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-start xl:justify-between">
                {
                    levelData.map(data => (
                        <div
                            key={data.id}
                            className="relative flex flex-col items-center justify-start rounded w-full sm:w-[48%] lg:w-[31%] xl:w-[24%] h-full pt-3 bg-transparent"
                            style={{
                                border: data.active ? '1px solid rgb(239, 202, 57)' : '1px solid rgb(48, 52, 69)',
                                borderRadius: '10px'
                            }}
                        >
                            <div className='text-lg uppercase font-extrabold px-3' style={{ color: 'rgba(255, 255, 255, 0.92)' }}>{data.title}
                            </div>

                            <div className='css-1cpa8wi'>
                                <div className='inline-block p-[25px] rounded-[12px]' style={{ background: data.background }}>
                                    <img
                                        src={data.image}
                                        alt={data.title}
                                        className='w-[114px] max-w-[200px] h-[130px] max-h-[120px] object-contain'
                                        style={{ filter: data.active ? 'none' : data.filter }}
                                    />
                                    {
                                        !data.active &&
                                        (
                                            <div className="css-194gi2f" style={{ transform: "translate(-50%, -50%)" }}>
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" fontSize="38" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"></path>
                                                </svg>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <div className='flex flex-col justify-between h-full w-full' style={{ borderTop: '1px solid rgb(48, 52, 69)', color: 'rgba(255, 255, 255, 0.92)' }}>
                                <div className='py-[16px] px-3'>
                                    <div className='flex items-center justify-between mb-[0.75rem] text-center'>
                                        <p className='font-semibold text-[1rem]'>
                                            Daily withdrawal Limit
                                        </p>
                                        <p className='font-semibold text-[15px] px-3' style={{ color: 'rgb(169, 183, 217)' }}>
                                            {data.withdrawal_limit ? `$${data.withdrawal_limit}` : ''}
                                        </p>
                                    </div>
                                    {/* Progress bar now reads directly from the API data */}
                                    {data.progressStatus && (
                                        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-2">
                                            <div
                                                className="progressBar text-xs font-medium text-center p-[1px] leading-none rounded-full"
                                                style={{ width: `${data.progress}%`, maxWidth: '100%' }}
                                            >
                                                {data.progress}%
                                            </div>
                                        </div>
                                    )}
                                    <div className='flex items-center justify-between mb-[0.75rem] text-center'>
                                        <p className='font-semibold text-[1rem]'>
                                            Total Deposit
                                        </p>
                                        <p className='font-semibold text-[15px] px-3' style={{ color: 'rgb(169, 183, 217)' }}>
                                            {data.min_deposit_limit ? `$${data.min_deposit_limit} -` : ''} &nbsp;
                                            {data.max_deposit_limit ? `$${data.max_deposit_limit}` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="css-yp6gff">
                                    <p>
                                        DEPOSIT BONUS {data.bonus ? data.bonus : '0.0'}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            {/* --- Signup Bonus Popup UI (Unchanged) --- */}
            {showPopup && signupBonus && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
                    <div className="relative bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg w-full max-w-md p-6 shadow-2xl text-center">
                        <button
                            onClick={closePopupAndClearBonus}
                            className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
                        >
                            &times;
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-2 text-yellow-400">Congratulations!</h2>
                        <p className="text-lg mb-4">You've received a ${signupBonus.balance || '2.00'} Freeplay!</p>
                        <p className="mb-4">Here's your unique coupon code:</p>

                        <div className="border-2 border-dashed border-yellow-500 rounded-lg p-3 mb-6 flex justify-between items-center bg-gray-900">
                            <span className="text-2xl font-bold text-yellow-400 tracking-widest">
                                {signupBonus.code}
                            </span>
                            <CopyToClipboard text={signupBonus.code} onCopy={handleCopy}>
                                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-1 px-3 rounded flex items-center transition-colors duration-200">
                                    <ClipboardIcon className="w-5 h-5 mr-2" />
                                    <span className="text-sm">Copy</span>
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
                            <button 
                                onClick={closePopupAndClearBonus}
                                className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-3 px-4 rounded-md w-full transition-colors duration-200"
                            >
                                Redeem Now
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BonusesLevel;