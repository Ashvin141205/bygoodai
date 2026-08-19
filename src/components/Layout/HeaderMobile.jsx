import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import rewardAnimation from '../../assets/animations/ic_invest.json';
import CrosBawIcon from '../../assets/image/crossbow.png';
import { logout, SET_LEVEL_DATA, UPDATE_BALANCE } from '../../redux/slice/authSlice'; // Import SET_LEVEL_DATA
import { CartIcon2, CrossIcon, MenuIcon, WalletIcon } from '../../utils/Icons';
import WeeklyChallengeIcon from '../../assets/image/weekly-challenge-icon.png';
import NotificationIcon from "../../assets/image/notification.png";
import WeeklyPopupBgImg from '../../assets/image/weeklyPopupBgImg.png';
import { resetGamesState } from '../../redux/slice/gamesSlice';
import { ApiHandler } from '../../helper/ApiHandler';
import { clearCouponCode } from '../../redux/slice/couponSlice';
import TaskModal from '../../components/Layout/TaskModal';
import logo from "../../assets/image/logo.png";
import { formatBalance } from '../../helper/CommonFunction';
import { EXTRA_ENDPOINTS, USER_ENDPOINTS } from '../../config/apiEndpoints';

const HeaderMobile = () => {
    const [open, setOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const openTaskModal = () => setTaskModalOpen(true);
    const closeTaskModal = () => setTaskModalOpen(false);
    const [walletDropdownVisible, setWalletDropdownVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector(state => state.auth.token);
    const userData = useSelector(state => state.auth.user);
    const cartData = useSelector((state) => state.games.cart);
    
    const [today, setToday] = useState('');
    const [weeklyChallengeData, setWeeklyChallengeData] = useState([]);
    const location = useLocation();

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Get all level and progress data directly from Redux
    const { 
        activeLevel, 
        main_balance, 
        bonus_balance, 
        total_count, 
        promotion_count, 
        system_count,
        progressPercent // <-- Use the new progress from Redux
    } = useSelector(state => state.auth);

    const totalBalance = parseFloat(useSelector(state => state.auth.main_balance)) + parseFloat(useSelector(state => state.auth.bonus_balance));

    const goToProfile = () => {
        navigate(`/profile/`);
        setOpen(false);
    };

    // --- NEW: Unified API call for all level data ---
    const fetchLevelData = async () => {
        try {
            // Call the new unified endpoint
            const response = await ApiHandler(EXTRA_ENDPOINTS.LEVEL_PROGRESS, 'POST', undefined, token, dispatch, navigate);
            if (response.data && response.data.status.code === 1) {
                // Dispatch the single action to update everything
                dispatch(SET_LEVEL_DATA(response.data.data));
            } else {
                console.error('Failed to fetch unified level data:', response.data?.status?.message);
            }
        } catch (error) {
            console.error('Error fetching unified level data:', error);
        }
    };

    const getGeneralWalletData = async () => {
        try {
            const response = await ApiHandler(USER_ENDPOINTS.BALANCE.GET, 'GET', undefined, token, dispatch, navigate);
            if (response.status === 200) {
                const { main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count } = response.data.data;
                dispatch(UPDATE_BALANCE({ main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count }));
                fetchData(); // For weekly challenge modal
            } else {
                console.error('Failed to fetch wallet data: Invalid response');
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await ApiHandler(EXTRA_ENDPOINTS.WEEKLY_CHALLENGE_BONUS_PERCENTAGE, 'GET', undefined, token, dispatch, navigate);
            if (response?.data?.status?.code === 1) {
                setWeeklyChallengeData(response?.data?.data || []);
            } else {
                console.error('Error fetching weekly challenge data:', response?.data?.status?.message);
            }
        } catch (error) {
            console.error('Error fetching weekly challenge data:', error);
        }
    };

    // --- MODIFIED: Unified useEffect for data fetching ---
    useEffect(() => {
        if (token) {
            getGeneralWalletData(); // Fetches balances, notifications
            fetchLevelData();       // Fetches level, deposit, and progress
        }
    }, [token, location.pathname]); // Re-fetch on token or page navigation
    
    // --- (Removed old progress calculation useEffect) ---

    useEffect(() => {
        const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setToday(todayDay);
    }, []);

    const handleLinkClick = () => {
        setOpen(false); // Close mobile menu on link click
    };

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetGamesState());
        dispatch(clearCouponCode());
        navigate("/login");
        setOpen(false); // Close mobile menu after logout
    };

    const toggleWalletDropdown = () => {
        setWalletDropdownVisible(!walletDropdownVisible);
    }

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const walletDropdownRef = useRef(null);
    const handleMessageClick = () => {
        if (system_count > 0) {
            navigate('/user/message/system');
        } else if (promotion_count > 0) {
            navigate('/user/message/promotions');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                walletDropdownRef.current && !walletDropdownRef.current.contains(event.target)
            ) {
                setWalletDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={`w-full bg-[#222222] ${open ? 'h-[100vh] overflow-y-scroll fixed z-50 text-white' : ''}`}>
            <div className='flex justify-between flex-col items-center '>
                <div className='flex justify-between items-center w-full bg-[#0E0E0E] sm:px-5 px-3'>
                    <Link to="/home" className="flex items-center gap-1" onClick={handleLinkClick}>
                        <img
                            src={logo}
                            className="w-[64px] h-[54.01px] object-contain"
                            alt="luckycharm logo"
                        />
                        <div className="flex flex-col justify-center leading-none gap-1">
                            <h1 className="font-oxanium font-bold text-[16px] text-[#fff] leading-[100%] tracking-[5%] uppercase">
                                LUCKY CHARM
                            </h1>
                            <h2 className="font-oxanium font-bold text-[#FFDD15] text-[16px] leading-none tracking-wide uppercase">
                                SWEEP
                            </h2>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex relative items-center gap-1">
                            <Lottie
                                animationData={rewardAnimation}
                                loop
                                className="w-10 h-10 cursor-pointer"
                                onClick={openTaskModal}
                            />
                        </div>
                        <TaskModal
                            taskModalOpen={taskModalOpen}
                            closeTaskModal={closeTaskModal}
                            isLoggedIn={!!token}
                        />
                        {token && <>
                            <div className="relative ">
                                <div className="flex items-center gap-1 cursor-pointer" onClick={toggleWalletDropdown}>
                                    <WalletIcon className="w-5 h-5 fill-[#FFDD15]" />
                                </div>
                                {walletDropdownVisible && (
                                    <div ref={walletDropdownRef} className="absolute -left-48 mt-4 w-[250px] bg-black text-white rounded-lg shadow-lg p-4 border border-[#FFDD15] z-50">
                                        <div className='flex flex-col items-start xs:flex-row xs:justify-between sx:items-center p gap-2 xs:gap-0'>
                                            <p className='font-bold text-sm'>General Wallet</p>
                                            <p className='text-sm font-medium'>Total:${formatBalance(totalBalance)}</p>
                                        </div>
                                        <div className='flex flex-col gap-3'>
                                            <div className="p-5 border-b flex justify-between items-center border-[#444] bg-[#1e1e1e] mt-4 rounded-lg">
                                                <span className="block text-sm">Main</span>
                                                <span className="block text-sm font-bold">${formatBalance(main_balance)}</span>
                                            </div>
                                            <div className="p-5 flex justify-between items-center bg-[#1e1e1e] rounded-lg">
                                                <span className="block text-sm">Bonus</span>
                                                <span className="block text-sm font-bold">${formatBalance(bonus_balance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>}
                        {token && (
                            <>
                                <div className="relative">
                                    <div
                                        className='flex items-center justify-center w-10 h-10 z-[50] rounded-full relative cursor-pointer'
                                    >
                                        <div onClick={goToProfile}
                                            className=' rounded-full border-[#FFDD15] border-2 h-9 w-9 flex items-center justify-center font-bold text-[#FFDD15]'>
                                            {userData?.username?.substring(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {open ? (
                            <CrossIcon className="fill-white w-6 h-6" onClick={() => setOpen(false)} />
                        ) : (
                            <MenuIcon onClick={() => setOpen(true)} className="fill-white" />
                        )}
                    </div>
                </div>

                {
                    token && (
                        <>
                            <div className='bg-[#0E0E0E] w-full sm:px-5 px-3 flex justify-between items-center py-3'>
                                <div className='flex gap-2'>
                                    <img src={WeeklyChallengeIcon} alt="Weekly Challenge" className='w-14 h-14 object-contain cursor-pointer' onClick={openModal} />
                                    
                                    {/* === LEVEL DISPLAY UPDATED === */}
                                    <Link to="/bonuses/level" className="newNav_onlyDesktop__d4BrB" onClick={handleLinkClick}>
                                        <div className="newNav_progress__SFIF_">
                                            <span style={{ boxSizing: 'border-box', display: 'inline-block', overflow: 'hidden', width: '51px', height: '50px', background: 'none', opacity: '1', border: '0px', margin: '0px', padding: '0px', position: "relative" }}>
                                                <img
                                                    src={CrosBawIcon}
                                                    decoding="async"
                                                    data-nimg="fixed"
                                                    style={{ position: "absolute", inset: "0px", boxSizing: "border-box", padding: "0px", border: 'none', margin: 'auto', display: 'block', width: '0px', height: '0px', minWidth: '100%', maxWidth: '100%', minHeight: '100%', maxHeight: "100%" }} />
                                            </span>
                                            <div className="newNav_levelBar__dD693 text-white">
                                                <span className="newNav_textItself__xsBoP">
                                                    {/* UPDATED: Display level TITLE from Redux */}
                                                   {activeLevel ? activeLevel.id : '...'} LEVEL

                                                </span>
                                                <div 
                                                    className="newNav_progress__bar__iBAcL" 
                                                    // UPDATED: Use progressPercent from Redux
                                                    style={{ width: `${progressPercent}%`, maxWidth: '100%' }}
                                                >
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    {/* === END LEVEL DISPLAY UPDATE === */}
                                </div>
                                <div className="flex gap-4">
                                    {/* Cart Icon */}
                                    <Link to="/cart" className="relative flex items-center" onClick={handleLinkClick}>
                                        <CartIcon2 className="w-7 h-7 fill-[#FFDD15]" />
                                        <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-full z-30">
                                            {cartData.length ? cartData.length : 0}
                                        </span>
                                    </Link>
                                    
                                    {/* Notification Icon */}
                                    {((+promotion_count > 0) || (+system_count > 0)) && (
                                        <div className="relative flex items-center" onClick={handleMessageClick}>
                                            <img src={NotificationIcon} alt="luckycharm notification" className="w-7 h-7" />
                                            {total_count && total_count !== 0 && (
                                                <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-full z-30">
                                                    {total_count}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )
                }
            </div>

            {open && (
                <>
                    <div className='text-white flex flex-col justify-center items-center w-full gap-3 mt-5'>
                        <Link className='text-xl hover:text-[#FFDD15] transition-colors duration-300' to="/deposit" onClick={handleLinkClick}>Game Deposit</Link>
                        <hr className='w-full border border-white/5' />

                        {token && (
                            <>
                                <Link className='text-xl hover:text-[#FFDD15] transition-colors duration-300' to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                                <hr className='w-full border border-white/5' />
                                <Link className='text-xl hover:text-[#FFDD15] transition-colors duration-300' to="/bonuses" onClick={handleLinkClick}>Claim Freeplay</Link>
                                <hr className='w-full border border-white/5' />
                            </>
                        )}

<Link
  className='text-xl hover:text-[#FFDD15] transition-colors duration-300'
  to={token ? "/user/referrals" : "/referral/program"}
  onClick={handleLinkClick}
>
  Refer & Earn
</Link>                        <hr className='w-full border border-white/5' />
                        <Link className='text-xl hover:text-[#FFDD15] transition-colors duration-300' to="/about" onClick={handleLinkClick}>About Us</Link>
                        {token && (
                            <>
                                <hr className='w-full border border-white/5' />
                                <Link className='text-xl pb-5 hover:text-[#FFDD15] transition-colors duration-300' onClick={() => {
                                    handleLogout();
                                    setOpen(false);
                                }}>Logout</Link>
                            </>
                        )}
                    </div>

                    {
                        !token && (
                            <div className='flex items-center justify-center bg-[#0E0E0E] p-5 gap-5 w-full'>
                                <Link to={"/login"} className='bg-[#FFDD15] text-black py-2 w-[150px] text-center font-bold hover:bg-[#e0c20b] transition-colors duration-300' onClick={() => {
                                    handleLinkClick()
                                }}>
                                    Sign In
                                </Link>
                                <Link to={"/sign-up"} className='bg-[#290A47] border border-white/50 py-2 w-[150px] text-center font-bold hover:bg-[#380d61] transition-colors duration-300' onClick={() => {
                                    handleLinkClick()
                                }}>
                                    Sign Up
                                </Link>
                            </div>
                        )
                    }
                </>
            )}

            {isOpen && (
                <div className="fixed inset-0 w-full flex items-center justify-center z-50 bg-black/80 bg-opacity-50">
                    <div className="relative bg-black text-white rounded-lg w-full md:w-[600px] max-h-screen overflow-y-auto h-[90vh] my-auto">
                        <button
                            className="absolute top-2 right-2 text-white font-bold text-xl bg-transparent hover:text-gray-300 transition-colors duration-300"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        <div className="h-full">
                            <div
                                style={{
                                    backgroundImage: `url(${WeeklyPopupBgImg})`,
                                    height: '100px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundSize: 'cover',
                                }}
                            >
                                <h2 className="text-center text-2xl font-bold text-yellow-400">
                                    WEEKLY CHALLENGE
                                </h2>
                            </div>
                            <div className="p-[1rem]">
                                {daysOfWeek.map((day, index) => (
                                    <div key={day} className="flex flex-col md:flex-row mt-3 md:gap-3">
                                        <div
                                            className={`p-2 w-[120px] md:w-[150px] text-lg rounded-lg text-center border-dashed border-2 border-yellow-400 cursor-pointer transition-colors duration-300
                                            ${today === day ? 'bg-yellow-400 text-black font-bold' : 'hover:border-yellow-300'}`}
                                        >
                                            {day}
                                        </div>
                                        <div className="bg-purple-900 text-white p-3 text-base rounded-lg text-center border-2 border-purple-400 w-full mt-2 md:mt-0">
                                            Make deposit and earn additional {weeklyChallengeData[index]?.bonus_percentage || 5}% bonus
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </header>
    );
}

export default HeaderMobile;