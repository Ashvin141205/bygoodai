"use client"

import { useEffect, useRef, useState } from "react"
import Lottie from "lottie-react"

import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../../assets/image/logo.png"
import WeeklyChallengeIcon from "../../assets/image/weekly-challenge-icon.png"
// Import the new unified reducer
import { logout, SET_LEVEL_DATA, UPDATE_BALANCE } from "../../redux/slice/authSlice"
import WeeklyPopupBgImg from "../../assets/image/weeklyPopupBgImg.png"
import {
  AboutIcon,
  CartIcon2,
  ContactIcon,
  DepositIcon,
  EmailIcon,
  HomeIcon,
  WalletIcon,
} from "../../utils/Icons"
import { resetGamesState } from "../../redux/slice/gamesSlice"
import { ApiHandler } from "../../helper/ApiHandler"
import { clearCouponCode } from "../../redux/slice/couponSlice"
import rewardAnimation from "../../assets/animations/ic_invest.json"
import TaskModal from "../../components/Layout/TaskModal"
import ConfirmDialog from "../ConfirmDialog"
import { formatBalance } from "../../helper/CommonFunction"
import { logger } from "../../utils/logger"
import { prefetchOnHover } from "../../hooks/usePrefetch"
import { EXTRA_ENDPOINTS, USER_ENDPOINTS } from "../../config/apiEndpoints"

const Header = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [walletDropdownVisible, setWalletDropdownVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [weeklyChallengeData, setWeeklyChallengeData] = useState([])
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const token = useSelector((state) => state.auth.token)
  const userData = useSelector((state) => state.auth.user)
  const cartData = useSelector((state) => state.games.cart)

  // Get all level and progress data directly from Redux state
  const {
    activeLevel,
    main_balance,
    bonus_balance,
    total_count,
    promotion_count,
    system_count,
    lifetimeDeposit, // <-- Get from Redux
    progressPercent, // <-- Get from Redux
  } = useSelector((state) => state.auth)

  const [today, setToday] = useState("")
  const totalBalance = (Number.parseFloat(formatBalance(main_balance)) || 0) + (Number.parseFloat(bonus_balance) || 0)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const openTaskModal = () => setTaskModalOpen(true)
  const closeTaskModal = () => setTaskModalOpen(false)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // --- NEW: Unified API call for all level data ---
  const fetchLevelData = async () => {
    try {
      // Call the new unified endpoint
      const response = await ApiHandler(EXTRA_ENDPOINTS.LEVEL_PROGRESS, "POST", undefined, token, dispatch, navigate)
      if (response.data && response.data.status.code === 1) {
        // Dispatch the single action to update everything
        dispatch(SET_LEVEL_DATA(response.data.data))
      } else {
        logger.error("Failed to fetch unified level data:", response.data?.status?.message)
      }
    } catch (error) {
      logger.error("Error fetching unified level data:", error)
    }
  }

  // --- (Unchanged) ---
  const getGeneralWalletData = async () => {
    try {
      const response = await ApiHandler(USER_ENDPOINTS.BALANCE.GET, "GET", undefined, token, dispatch, navigate)
      if (response.status === 200) {
        const { main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count } =
          response.data.data
        dispatch(
          UPDATE_BALANCE({ main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count }),
        )

        fetchData() // This is for the weekly challenge modal
      } else {
        logger.error("Failed to fetch wallet data: Invalid response")
      }
    } catch (error) {
      logger.error("Failed to fetch wallet data:", error)
    }
  }

  // --- (Unchanged) ---
  const fetchData = async () => {
    try {
      const response = await ApiHandler(
        EXTRA_ENDPOINTS.WEEKLY_CHALLENGE_BONUS_PERCENTAGE,
        "GET",
        undefined,
        token,
        dispatch,
        navigate,
      )
      if (response?.data?.status?.code === 1) {
        
        setWeeklyChallengeData(response?.data?.data || [])
      } else {
        logger.error("Error fetching weekly challenge data:", response?.data?.status?.message)
      }
    } catch (error) {
      logger.error("Error fetching weekly challenge data:", error)
    }
  }

  // --- MODIFIED: Unified useEffect for data fetching ---
  useEffect(() => {
    if (token) {
      getGeneralWalletData() // Fetches balances, notifications
      fetchLevelData() // Fetches level, deposit, and progress
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, location.pathname]) // Re-fetch on token or page navigation

  // --- (Unchanged) ---
  useEffect(() => {
    const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" })
    setToday(todayDay)
  }, [])

  // --- (Unchanged) Crisp useEffect ---
  // This will now use lifetimeDeposit from Redux
  useEffect(() => {
    try {
      if (window.$crisp && userData && userData.email) {
        // Helper function to safely get string values
        const getStringValue = (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : null)

        // Helper function to safely get number values
        const getNumberValue = (value) => (typeof value === "number" && !isNaN(value) ? value : null)

        // Set user identification data only if it's valid
        const email = getStringValue(userData.email)
        if (email) {
          window.$crisp.push(["set", "user:email", email])
        }
        const nickname = getStringValue(userData.first_name)
        if (nickname) {
          window.$crisp.push(["set", "user:nickname", nickname])
        }
        const phone = getStringValue(userData.phone)
        if (phone) {
          window.$crisp.push(["set", "user:phone", phone])
        }

        // --- Build Custom Session Data Object ---
        const sessionData = {}

        const personId = getStringValue(userData.id)
        if (personId) {
          sessionData.person_id = personId
        }
        const lastName = getStringValue(userData.last_name)
        if (lastName) {
          sessionData.last_name = lastName
        }
        const username = getStringValue(userData.username)
        if (username) {
          sessionData.username = username
        }
        const referralCode = getStringValue(userData.referral_code)
        if (referralCode) {
          sessionData.referral_code = referralCode
        }

        // Set a boolean for authentication status
        sessionData.is_authenticated = !!token

        // Set the current level
        if (activeLevel?.id) {
          sessionData.level = activeLevel.id
        }

        // Set the lifetime deposit value (now from Redux)
        const depositValue = getNumberValue(lifetimeDeposit)
        if (depositValue !== null) {
          sessionData.lifetime_deposit = depositValue
        }

        // Set the bonus percentage from the active level
        if (activeLevel?.bonus) {
          // Use 'bonus' based on your API response
          sessionData.active_level_bonus = activeLevel.bonus
        }

        // Set balances as custom session data
        const mainBalanceValue = getNumberValue(main_balance)
        if (mainBalanceValue !== null) {
          sessionData.main_balance = mainBalanceValue
        }
        const bonusBalanceValue = getNumberValue(bonus_balance)
        if (bonusBalanceValue !== null) {
          sessionData.bonus_balance = bonusBalanceValue
        }

        // Convert the object into the correct format: [[["key", "value"], ...]]
        const sessionDataArray = Object.entries(sessionData)

        // Push the data to Crisp with the extra array wrapper
        if (sessionDataArray.length > 0) {
          window.$crisp.push(["set", "session:data", [sessionDataArray]])
        }
      }
    } catch (error) {
      logger.error("Error setting Crisp user data:", error)
    }
  }, [userData, main_balance, bonus_balance, token, activeLevel, lifetimeDeposit])
  // --- End Crisp useEffect ---

  // --- (Unchanged) All other helper functions ---
  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const dropdownRef = useRef(null)
  const walletDropdownRef = useRef(null)

  const getBackgroundColor = (path) => {
    return location.pathname === path ? "#D9D9D91A" : "transparent"
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmedLogout = () => {
    setIsLoggingOut(true)
    try {
      dispatch(logout())
      dispatch(resetGamesState())
      dispatch(clearCouponCode())
      setShowLogoutConfirm(false)
      navigate("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible)
    setWalletDropdownVisible(false)
  }

  const toggleWalletDropdown = () => {
    setWalletDropdownVisible(!walletDropdownVisible)
    setDropdownVisible(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false)
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target)) {
        setWalletDropdownVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleMessageClick = () => {
    if (system_count > 0) {
      navigate("/user/message/system")
    } else if (promotion_count > 0) {
      navigate("/user/message/promotions")
    }
    setDropdownVisible(false) // Close dropdown if it's open
  }
  // --- End Unchanged Functions ---

  return (
    <>
      <nav className="w-full bg-[#ffffff0f] absolute top-0 z-50">
        {/* First Line */}
        <div className="flex items-center justify-between h-[60px] px-4 xl:px-8 text-white">
          {/* ... Logo ... */}
          <div className="flex gap-3">
            <Link to="/home" className="flex items-center gap-1">
              <img
                src={logo || "/placeholder.svg"}
                className="w-[64px] h-[68.01px] object-contain"
                alt="luckycharm logo"
              />
              <div className="flex flex-col justify-center leading-none gap-1">
                <h1 className="font-oxanium font-bold text-[18px] leading-[100%] tracking-[5%] uppercase">
                  LUCKY CHARM
                </h1>
                <h2 className="font-oxanium font-bold text-[#FFDD15] text-[18px] leading-none tracking-wide uppercase">
                  SWEEP
                </h2>
              </div>
            </Link>
          </div>

          {/* ... Right side icons ... */}
          <div className="flex items-center gap-5">
            <div className="flex relative items-center gap-1">
              <Lottie
                animationData={rewardAnimation}
                loop
                className="w-16 h-16 cursor-pointer"
                onClick={openTaskModal}
              />
            </div>
            <TaskModal taskModalOpen={taskModalOpen} closeTaskModal={closeTaskModal} isLoggedIn={!!token} />
            {token && (
              <>
                <div className="flex relative items-center gap-1">
                  <img
                    src={WeeklyChallengeIcon || "/placeholder.svg"}
                    alt="Weekly Challenge"
                    className="w-14 h-14 object-contain cursor-pointer"
                    onClick={openModal}
                  />
                </div>

                {/* === LEVEL DISPLAY UPDATED === */}
                <Link
                  to="/bonuses/level"
                  className="newNav_onlyDesktop__d4BrB"
                  {...prefetchOnHover(() => import("../../pages/DashboardLayout/BounesLevel/BonusesLevel"))}
                >
                  <div className="newNav_progress__SFIF_">
                    <span
                      style={{
                        boxSizing: "border-box",
                        display: "inline-block",
                        overflow: "hidden",
                        width: "51px",
                        height: "50px",
                        background: "none",
                        opacity: "1",
                        border: "0px",
                        margin: "0px",
                        padding: "0px",
                        position: "relative",
                      }}
                    >
                      <img
                        src="/crosbaw.svg"
                        alt="Level progress crossbow icon"
                        decoding="async"
                        data-nimg="fixed"
                        style={{
                          position: "absolute",
                          inset: "0px",
                          boxSizing: "border-box",
                          padding: "0px",
                          border: "none",
                          margin: "auto",
                          display: "block",
                          width: "0px",
                          height: "0px",
                          minWidth: "100%",
                          maxWidth: "100%",
                          minHeight: "100%",
                          maxHeight: "100%",
                        }}
                      />
                    </span>
                    <div className="newNav_levelBar__dD693">
                      <span className="newNav_textItself__xsBoP">
                        {/* UPDATED: Display level TITLE from Redux */}
                        {activeLevel ? activeLevel.id : "..."} LEVEL
                      </span>
                      <div
                        className="newNav_progress__bar__iBAcL"
                        // UPDATED: Use progressPercent from Redux
                        style={{ width: `${progressPercent}%`, maxWidth: "100%" }}
                      ></div>
                    </div>
                  </div>
                </Link>
                {/* === END LEVEL DISPLAY UPDATE === */}

                <Link
                  to="/cart"
                  className="flex items-center gap-1"
                  {...prefetchOnHover(() => import("../../pages/HomeLayout/Cart/Cart"))}
                >
                  <CartIcon2 className="w-5 h-5 fill-[#FFDD15]" />
                  <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">
                    {cartData.length ? cartData.length : 0}
                  </span>
                </Link>

                {/* ... Wallet Dropdown (Unchanged) ... */}
                <div className="relative">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={toggleWalletDropdown}>
                    <WalletIcon className="w-5 h-5 fill-[#FFDD15]" />
                    <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">
                      {formatBalance(totalBalance)}{" "}
                    </span>
                  </div>
                  {walletDropdownVisible && (
                    <div
                      ref={walletDropdownRef}
                      className="absolute right-0 mt-4 w-[250px] bg-black text-white rounded-lg shadow-lg p-4 border border-[#FFDD15]"
                    >
                      <div className="flex justify-between items-center p">
                        <p className="font-bold">General Wallet</p>
                        <p className="text-xs font-semibold">Total: ${formatBalance(totalBalance)}</p>
                      </div>
                      <div className="flex flex-col gap-3">
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

                {/* ... User Profile Dropdown (Unchanged) ... */}
                <div className="relative ">
                  <div
                    onClick={toggleDropdown}
                    className="flex items-center justify-center rounded-full cursor-pointer"
                  >
                    <div className=" rounded-full border-[#FFDD15] border-2 h-9 w-9 flex items-center justify-center font-bold">
                      {userData?.username?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  {dropdownVisible && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-5 min-w-60 main-dot-bg rounded-md shadow-lg py-2 z-40 font-semibold"
                    >
                      <div className="px-4 py-2 flex flex-col gap-2">
                        <p>{userData?.email || 'Guest'}</p>
                      </div>
                      <hr className="border-white/5 border" />
                      <div className="">
                        <p className="text-center py-2 font-semibold">Account</p>
                        <hr className="border-white/5 border" />
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                          {...prefetchOnHover(() => import("../../pages/DashboardLayout/Dashboard/Dashboard"))}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                          {...prefetchOnHover(() => import("../../pages/DashboardLayout/Profile/Profile"))}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/deposit"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                          {...prefetchOnHover(() => import("../../pages/HomeLayout/DepositNow/Deposit"))}
                        >
                          Deposit Now
                        </Link>
                        <Link
                          to="/bonuses"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                          {...prefetchOnHover(() => import("../../pages/DashboardLayout/Bonus/Bonuses"))}
                        >
                          Claim Freeplay
                        </Link>
                 
                        <Link
                          to="/user/deposits"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                        >
                          Deposit Transaction
                        </Link>
                        <Link
                          to="/user/message/system"
                          onClick={() => setDropdownVisible(false)}
                          className="bloack py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                        >
                          Message{" "}
                          {total_count > 0 && (
                            <span className="bg-red-600 px-1.5 py-1 rounded-full">{total_count}</span>
                          )}
                        </Link>
                        <Link
                          to="/user/withdrawals"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                        >
                          Withdrawals
                        </Link>
                        <hr className="border-white/5 border" />
                        <p className="text-center py-2 font-semibold">Help</p>
                        <hr className="border-white/5 border" />
                        <Link
                          to="/support"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                        >
                          Support
                        </Link>
                        <Link
                          to="/faq"
                          onClick={() => setDropdownVisible(false)}
                          className="block py-2 px-4 text-sm text-white hover:bg-[#f1c40f]"
                        >
                          FAQ
                        </Link>
                        {token && (
                          <>
                            <hr className="border-white/5 border" />
                            <button
                              onClick={handleLogout}
                              className="block w-full px-4 text-left py-2 text-sm text-white hover:bg-[#0E0E0E]"
                            >
                              Logout
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ... Notification Icon (Unchanged) ... */}
                {(+promotion_count > 0 || +system_count > 0) && (
                  <div
                    className="bg-red-600 cursor-pointer relative rounded-full h-7 w-8 flex justify-center items-center"
                    onClick={handleMessageClick}
                  >
                    <EmailIcon />
                    <span className="absolute -right-2 -top-2">
                      {total_count && total_count !== 0 ? total_count : ""}
                    </span>
                  </div>
                )}
              </>
            )}
            {/* ... Login/Signup Buttons (Unchanged) ... */}
            {!token && (
              <div className="flex gap-5">
                <Link
                  to="/login"
                  className="tracking-widest font-bold text-sm bg-[#FFDD15] px-2 xl:px-10 py-2.5 rounded-sm text-black"
                >
                  SignIn
                </Link>
                <Link
                  to="/sign-up"
                  className="tracking-widest font-bold text-sm bg-[#FFDD15] px-2 xl:px-10 py-2.5 rounded-sm text-black"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ... Second Line Navigation (Unchanged) ... */}
        <div className="flex justify-center h-[60px] bg-transparent">
          <ul className="flex gap-8 text-white h-full items-center">
            <li className="py-5 px-6 h-full" style={{ backgroundColor: getBackgroundColor("/home") }}>
              <Link
                to="/"
                className="flex items-center gap-1"
                {...prefetchOnHover(() => import("../../pages/HomeLayout/Home/Home"))}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">Home</span>
              </Link>
            </li>
            {token && (
              <li className="py-5 px-6 h-full" style={{ backgroundColor: getBackgroundColor("/mygames") }}>
                <Link
                  to="/mygames"
                  className="flex items-center gap-1"
                  {...prefetchOnHover(() => import("../../pages/DashboardLayout/MyGames/Games"))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFDD15"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14H7C6 14 5.5 13 5.5 12S6 10 7 10H17C18 10 18.5 11 18.5 12S18 14 17 14H16" />
                    <line x1="9" y1="11" x2="9" y2="13" />
                    <line x1="8" y1="12" x2="10" y2="12" />
                    <circle cx="14.5" cy="11.5" r="0.5" fill="#FFDD15" stroke="none" />
                  </svg>
                  <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">My Games</span>
                </Link>
              </li>
            )}
            <li className="py-5 px-6 h-full" style={{ backgroundColor: getBackgroundColor("/deposit") }}>
              <Link
                to="/deposit"
                className="flex items-center gap-1"
                {...prefetchOnHover(() => import("../../pages/HomeLayout/DepositNow/Deposit"))}
              >
                <DepositIcon className="w-5 h-5" />
                <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">Deposit Now</span>
              </Link>
            </li>
            <li className="py-5 px-6 h-full" style={{ backgroundColor: getBackgroundColor("/contact-us") }}>
              <Link
                to="/contact-us"
                className="flex items-center gap-1"
                {...prefetchOnHover(() => import("../../pages/HomeLayout/Contactus/ContactUs"))}
              >
                <ContactIcon className="w-5 h-5" />
                <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">Contact Us</span>
              </Link>
            </li>
            <li className="py-5 px-6 h-full" style={{ backgroundColor: getBackgroundColor("/about") }}>
              <Link
                to="/about"
                className="flex items-center gap-1"
                {...prefetchOnHover(() => import("../../pages/HomeLayout/About/About"))}
              >
                <AboutIcon className="w-5 h-5 " />
                <span className="text-sm font-semibold xl:font-bold xl:tracking-widest">About</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ... Weekly Challenge Modal (Unchanged) ... */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 bg-opacity-50">
          <div className="relative bg-black text-white rounded-lg w-[90%] md:w-[600px]">
            <button className="absolute top-2 right-2 text-white font-bold text-xl bg-transparent" onClick={closeModal}>
              &times;
            </button>
            <div className="">
              <div
                style={{
                  backgroundImage: `url(${WeeklyPopupBgImg})`,
                  height: "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h2 className="text-center text-2xl font-bold mb-4 text-yellow-400 underline">WEEKLY CHALLENGE</h2>
              </div>
              <div className="flex gap-2 p-[1rem]">
                <div className="flex gap-2 p-[1rem] w-full">
                  <div className="flex flex-1 flex-col gap-2">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className={`p-3 rounded-lg text-center ${
                          today === day
                            ? "bg-yellow-400 text-black font-bold"
                            : "border-dashed border-yellow-400 border"
                        }`}
                        aria-current={today === day ? "date" : undefined}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 ">
                    {weeklyChallengeData.length > 0 ? (
                      weeklyChallengeData.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="bg-purple-900 p-3 rounded-lg text-center border-purple-400 border w-full"
                        >
                          Make deposit and earn additional {challenge.bonus_percentage}% bonus
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-700 p-3 rounded-lg text-center text-gray-300">No current challenges</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmedLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Stay Logged In"
        type="warning"
        isLoading={isLoggingOut}
      />
    </>
  )
}

export default Header
