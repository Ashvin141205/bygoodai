"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "react-datepicker/dist/react-datepicker.css"

// Import HelmetProvider and Helmet
import { Helmet, HelmetProvider } from "react-helmet-async"

import Error404 from "./components/Common/Error404"
import Error500 from "./components/Common/Error500"
import ErrorBoundary from "./components/Common/ErrorBoundary"
import DashboardLayout from "./components/DashboardLayout/Layout"
import Layout from "./components/Layout/Layout"
import Loading from "./components/Common/Loading"
import AuthProtect from "./protect/AuthProtect"
import FloatingTelegramButton from "./components/FloatingTelegramButton"
import axiosInstance from "./utils/AxiosInstance"

import { useDispatch } from "react-redux"
import { resetGamesState } from "./redux/slice/gamesSlice"
import { logout } from "./redux/slice/authSlice"
import { clearCouponCode } from "./redux/slice/couponSlice"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import Cookies from "js-cookie"
import NotificationBell from "./components/NotificationBell"
import { setUserLocation } from "./redux/slice/authSlice"
import { logger } from "./utils/logger"
import { usePrefetch } from "./hooks/usePrefetch"
import { useSessionTimeout } from "./hooks/useSessionTimeout"
import { API_ENDPOINTS, EXTRA_ENDPOINTS, getApiUrl } from "./config/apiEndpoints"
import KycCallback from './pages/DashboardLayout/KycCallback/KycCallback';

// --- Lazy load all your page components for route-based code splitting ---
// This is excellent for reducing the initial bundle size.
const Home = lazy(() => import("./pages/HomeLayout/Home/Home"))
const About = lazy(() => import("./pages/HomeLayout/About/About"))
const Platform = lazy(() => import("./pages/HomeLayout/Platform/Platofrom"))
const GamesPage = lazy(() => import("./pages/HomeLayout/Games/Games"))
const Blog = lazy(() => import("./pages/HomeLayout/Blog/Blog"))
const BlogDetails = lazy(() => import("./pages/HomeLayout/Blog/BlogDetails"))
const Deposit = lazy(() => import("./pages/HomeLayout/DepositNow/Deposit"))
const Cart = lazy(() => import("./pages/HomeLayout/Cart/Cart"))
const CheckOut = lazy(() => import("./pages/HomeLayout/CheckOut/CheckOut"))
const Faq = lazy(() => import("./pages/HomeLayout/Faq/Faq"))
const ContactUs = lazy(() => import("./pages/HomeLayout/Contactus/ContactUs"))
const Support = lazy(() => import("./pages/HomeLayout/Support/Support"))
const GamesDescription = lazy(() => import("./pages/HomeLayout/Home/GamesDescription"))
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"))
const PlatformDescription = lazy(() => import("./pages/HomeLayout/Home/PlatformDescription"))
const Login = lazy(() => import("./pages/HomeLayout/Auth/Login"))
const Signup = lazy(() => import("./pages/HomeLayout/Auth/Signup"))
const ForgotPassword = lazy(() => import("./pages/HomeLayout/Auth/ForgotPassword"))
const SocialReward = lazy(() => import("./components/SocialReward"))
const Bonuses = lazy(() => import("./pages/DashboardLayout/Bonus/Bonuses"))
const BonusesLevel = lazy(() => import("./pages/DashboardLayout/BounesLevel/BonusesLevel"))
const Profile = lazy(() => import("./pages/DashboardLayout/Profile/Profile"))
const Dashboard = lazy(() => import("./pages/DashboardLayout/Dashboard/Dashboard"))
const Games = lazy(() => import("./pages/DashboardLayout/MyGames/Games"))
const Referral = lazy(() => import("./pages/Referrals/Referral"))
const ReferralProgram = lazy(() => import("./pages/Referrals/ReferralProgram"))
const SecureReliable = lazy(() => import("./pages/Referrals/SecureReliable"))
const RequestRedeem = lazy(() => import("./pages/DashboardLayout/RequestRedeem/RequestRedeem"))
const Withdrawals = lazy(() => import("./pages/DashboardLayout/Withdrawals/Withdrawals"))
const WithdrawalsView = lazy(() => import("./pages/DashboardLayout/Withdrawals/WithdrawalsView"))
const DashboardTransactionView = lazy(() => import("./pages/DashboardLayout/Dashboard/DashboardTransactionView"))
const UserDeposits = lazy(() => import("./pages/DashboardLayout/Deposit/UserDeposits"))
const DepositView = lazy(() => import("./pages/DashboardLayout/Deposit/DepositView"))
const DepositToWallet = lazy(() => import("./pages/DashboardLayout/Deposit_to_Wallet/DepositToWallet"))
const CashAppPage = lazy(() => import("./pages/PaymentPage/CashAppPage"))
const AmountDeposit = lazy(() => import("./pages/PaymentPage/AmountDeposit"))
const HowToBuyGamingCredits = lazy(() => import("./pages/HowToBuyGamingCredits"))
const GamingFAQPage = lazy(() => import("./pages/GamingFAQPage"))
const PromotionMessageView = lazy(
  () => import("./pages/DashboardLayout/Messages/PromotionsMessages/PromotionMessageView"),
)
const Promotions = lazy(() => import("./pages/DashboardLayout/Messages/PromotionsMessages/Promotions"))
const SystemMessages = lazy(() => import("./pages/DashboardLayout/Messages/SystemMessages/SystemMessages"))
const SystemMessagesView = lazy(() => import("./pages/DashboardLayout/Messages/SystemMessages/SystemMessagesView"))
const TermsService = lazy(() => import("./pages/TermsService"))
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"))
const CompanyVerification = lazy(() => import("./pages/CompanyVerification"))
const ResetPassword = lazy(() => import("./pages/HomeLayout/Auth/ResetPassword"))
const AllPlatform = lazy(() => import("./pages/DashboardLayout/Platform/AllPlatform"))
const Wheel = lazy(() => import("./pages/Spin/Wheel"))
const EarningsDetailsPage = lazy(() => import("./pages/Referrals/EarningsDetailsPage"))
const BotPaymentRouter = lazy(() => import("./pages/PaymentPage/BotPaymentRouter"))
const BotCryptoPayment = lazy(() => import("./pages/PaymentPage/BotCryptoPayment"))
const BotHostedPayment = lazy(() => import("./pages/PaymentPage/BotHostedPayment"))
const BotCardPayment = lazy(() => import("./pages/PaymentPage/BotCardPayment"))
const BotPaymentComplete = lazy(() => import("./pages/PaymentPage/BotPaymentComplete"))
const NoDepositBonus = lazy(() => import("./pages/HomeLayout/NoDepositBonus/NoDepositBonus"))
const SlotsPage = lazy(() => import("./pages/HomeLayout/Slots/SlotsPage"))
// --- End of lazy loaded components ---

const initialOptions = {
  "client-id": "AYUkJvWtGijSoY9BofwqvOnxplNVUtTngJp0ZATGlsJfoTL4mdlmw02HNAkkpZcoKB48wuwlCzyrfV_S",
  currency: "USD",
  components: "buttons,applepay,googlepay",
  intent: "capture",
  "disable-funding": "",
  "enable-funding": "venmo,paylater",
  "data-sdk-integration-source": "react-paypal-js",
}

function App() {
  const location = useLocation()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    checked: false,
    isEnabled: false,
    message: "",
    startTime: null,
    endTime: null,
  })
  const path = location.pathname

  usePrefetch([
    () => import("./pages/HomeLayout/DepositNow/Deposit"),
    () => import("./pages/DashboardLayout/Dashboard/Dashboard"),
    () => import("./pages/HomeLayout/Cart/Cart"),
    () => import("./pages/HomeLayout/Games/Games"),
  ])

  // Automatically logout user after 30 minutes of inactivity (with 5-minute warning)
  useSessionTimeout(30, 5)

  useEffect(() => {
    let isMounted = true

    const fetchMaintenanceStatus = async () => {
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.MAINTENANCE.STATUS), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        })

        const raw = await response.text()
        const cleaned = (raw || "").replace(/^\uFEFF+/, "").trim()
        const payload = cleaned ? JSON.parse(cleaned) : {}
        const data = payload?.data || {}

        if (isMounted) {
          setMaintenanceInfo({
            checked: true,
            isEnabled: Number(data?.is_enabled ?? 0) === 1,
            message: data?.message || "We're currently performing scheduled maintenance. Please check back shortly.",
            startTime: data?.start_time || null,
            endTime: data?.end_time || null,
          })
        }
      } catch (error) {
        logger.warn("Could not fetch maintenance status:", error)
        if (isMounted) {
          setMaintenanceInfo((prev) => ({ ...prev, checked: true, isEnabled: false }))
        }
      }
    }

    fetchMaintenanceStatus()
    const intervalId = window.setInterval(fetchMaintenanceStatus, 60000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  // 🔒 SELLER PROTECTION: Capture client IP address and track page visits
  useEffect(() => {
    const getClientIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        window.clientIP = data.ip;
        console.log("🔒 Client IP captured:", data.ip);
        
        // Also generate a unique session ID if not exists
        if (!sessionStorage.getItem("session_id")) {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem("session_id", sessionId);
          sessionStorage.setItem("session_start_time", Date.now().toString());
          sessionStorage.setItem("page_visit_count", "1");
          console.log("🔒 Session ID generated:", sessionId);
        }
      } catch (error) {
        console.error("Failed to get client IP:", error);
        window.clientIP = "unknown";
      }
    };
    getClientIP();
  }, []);

  // 🔒 SELLER PROTECTION: Track page visits throughout session
  useEffect(() => {
    const currentCount = parseInt(sessionStorage.getItem("page_visit_count") || "1");
    sessionStorage.setItem("page_visit_count", (currentCount + 1).toString());
    console.log("🔒 Page visits:", currentCount + 1);
  }, [location.pathname]);

  // Effect to capture referral code from URL and store in cookie
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const refCodeFromUrl = params.get("ref")

    if (refCodeFromUrl) {
      Cookies.set("referralCode", refCodeFromUrl, { expires: 30, path: "/" })
    }
  }, [location.search])
  // =================================================================
  // === START: THE FIX - CAPTURE UTM PARAMETERS ===
  // =================================================================
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const utmSource = queryParams.get("utm_source")
    const utmMedium = queryParams.get("utm_medium")
    const utmCampaign = queryParams.get("utm_campaign")

    // If utm_source exists, it's from a campaign link. Save the tags in cookies.
    if (utmSource) {
      Cookies.set("utm_source", utmSource, { expires: 30, path: "/" })
      if (utmMedium) Cookies.set("utm_medium", utmMedium, { expires: 30, path: "/" })
      if (utmCampaign) Cookies.set("utm_campaign", utmCampaign, { expires: 30, path: "/" })
    }
  }, [location]) // This effect runs every time the URL changes
  // =================================================================
  // === END: THE FIX ===
  // =================================================================
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])
  // <<< --- REPLACE the previous location-fetching useEffect with THIS ONE --- >>>
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await axiosInstance.get(EXTRA_ENDPOINTS.USER_LOCATION)
        if (response.data && response.data.status) {
          // Dispatch the country to the Redux store
          dispatch(setUserLocation({ country: response.data.country }))
        }
      } catch (error) {
        logger.error("Could not determine user location:", error)
        // If the check fails, we can set a default non-USA location
        dispatch(setUserLocation({ country: "Unknown" }))
      }
    }

    fetchUserLocation()
  }, [dispatch]) // This effect runs only once when the app loads
  // Handle loading state and Redux actions on login path change
  useEffect(() => {
    if (path === "/login") {
      setLoading(true) // You might want to display a loading state specifically for login transition
      dispatch(resetGamesState())
      dispatch(clearCouponCode())
      dispatch(logout())
      setLoading(false) // Make sure this is fast enough not to show a flicker
    } else {
      setLoading(false)
    }
  }, [path, dispatch])

  if (loading || !maintenanceInfo.checked) {
    return <Loading />
  }

  if (maintenanceInfo.isEnabled) {
    return (
      <HelmetProvider>
        <Helmet>
          <title>Maintenance Mode - Lucky Charm Sweep</title>
        </Helmet>
        <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center px-6">
          <div className="max-w-2xl w-full bg-[#1B1B1B] border border-yellow-500/30 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-3xl font-bold mb-3 text-yellow-400">Scheduled Maintenance</h1>
            <p className="text-gray-200 text-lg leading-7 mb-6">
              {maintenanceInfo.message}
            </p>
            {(maintenanceInfo.startTime || maintenanceInfo.endTime) && (
              <div className="text-sm text-gray-400 space-y-1">
                {maintenanceInfo.startTime && <p>Start: {new Date(maintenanceInfo.startTime).toLocaleString()}</p>}
                {maintenanceInfo.endTime && <p>Expected end: {new Date(maintenanceInfo.endTime).toLocaleString()}</p>}
              </div>
            )}
          </div>
        </div>
      </HelmetProvider>
    )
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Lucky Charm Sweep - Play Top Online Sweepstakes Games</title>
        <meta
          name="description"
          content="Instantly play Orion Stars, Juwa, Milky Way, GameVault, and more! Enjoy fast payouts, 24/7 support, and exclusive bonuses at Lucky Charm Sweep."
        />

        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lucky Charm" />
        <meta name="theme-color" content="#0E0E0E" />
        <meta name="format-detection" content="telephone=no" />

        <link rel="canonical" href="https://www.luckycharmsweep.com" />
        <meta property="og:title" content="Lucky Charm Sweep - Safe & Instant Access to Top Casino Platforms!" />
        <meta
          property="og:description"
          content="Access Orion Stars, Milky Way, Juwa, Gamevault & more with instant deposits & withdrawals! Enjoy secure transactions, 24/7 support, generous bonuses, and 100% legit payouts."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.luckycharmsweep.com" />
        <meta property="og:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.luckycharmsweep.com" />
        <meta name="twitter:title" content="Lucky Charm Sweep - Safe & Instant Access to Top Casino Platforms!" />
        <meta
          name="twitter:description"
          content="Access Orion Stars, Milky Way, Juwa & more with instant deposits & withdrawals! 24/7 support, secure transactions, and legit payouts."
        />
        <meta name="twitter:image" content="https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg" />
        <meta name="twitter:site" content="@LuckyCharmSweep" />

        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        <meta
          httpEquiv="Permissions-Policy"
          content="geolocation=(), microphone=(), camera=(), payment=(self), usb=()"
        />
      </Helmet>
      <PayPalScriptProvider options={initialOptions}>
          <ErrorBoundary>
            {typeof window !== "undefined" && "Notification" in window && <NotificationBell />}
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<Error404 />} path={`/404`} />
                <Route element={<Error500 />} path={`/500`} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="*" element={<Navigate to={`/404`} />} /> {/* Catch-all for undefined routes */}
                  <Route path="/home" element={<Home />} /> {/* Redundant if "/" is Home, consider removing */}
                  <Route path="/platform" element={<Platform />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/category/:id" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogDetails />} />
                  <Route path="/deposit" element={<Deposit />} />
                  <Route path="/referral/program" element={<ReferralProgram />} />
                  <Route path="/security" element={<SecureReliable />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/social-reward" element={<SocialReward />} />
                  <Route path="/games/description/:game_slug" element={<GamesDescription />} />
                  <Route path="/platform/description/:platform_slug" element={<PlatformDescription />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<CheckOut />} />
                  <Route path="/cashapp" element={<CashAppPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsService />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:id" element={<ResetPassword />} />
                  <Route path="/sign-up" element={<Signup />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/wheel" element={<Wheel />} />
                  <Route path="/how-to-buy-gaming-credits" element={<HowToBuyGamingCredits />} />
                  <Route path="/gaming-faq" element={<GamingFAQPage />} />
                  <Route path="/company-verification" element={<CompanyVerification />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/deposit-bonus" element={<NoDepositBonus />} />
                  <Route path="/slots" element={<SlotsPage />} />
                  <Route element={<AuthProtect />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/bonuses/level" element={<BonusesLevel />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/bonuses" element={<Bonuses />} />
                      <Route path="/user/message/promotions" element={<Promotions />} />
                      <Route path="/user/message/system" element={<SystemMessages />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/user/withdrawals" element={<Withdrawals />} />
                      <Route path="/user/deposits" element={<UserDeposits />} />
                      <Route path="/user/request/redeem" element={<RequestRedeem />} />
                      <Route path="/referral/earnings-details" element={<EarningsDetailsPage />} />
                      <Route path="/user/referrals" element={<Referral />} />
                      <Route path="/user/payments" element={<DepositToWallet />} />
                      <Route path="/user/deposit/game" element={<Navigate to="/deposit" />} />
                      <Route path="/user/message/promotion/:id" element={<PromotionMessageView />} />
                      <Route path="/user/message/system/:id" element={<SystemMessagesView />} />
                      <Route path="/mygames" element={<Games />} />
                      <Route path="/user/withdrawals/:id" element={<WithdrawalsView />} />
                      <Route path="/user/all-platform" element={<AllPlatform />} />
                    </Route>

                    <Route path="/user/wallet/:id/:order_id" element={<DashboardTransactionView />} />
                    <Route path="/user/deposits/:id/:order_id" element={<DepositView />} />
                    <Route path="/user/deposits/amount" element={<AmountDeposit />} />
                  </Route>
                </Route>
                <Route path="/payment/creditcard" element={<BotPaymentRouter />} />
                <Route path="/payment/paypal" element={<BotPaymentRouter />} />
                <Route path="/payment/applepay" element={<BotPaymentRouter />} />
                <Route path="/payment/googlepay" element={<BotPaymentRouter />} />
                <Route path="/payment/cashapp" element={<BotPaymentRouter />} />
                <Route path="/payment/crypto/:coin" element={<BotCryptoPayment />} />
                <Route path="/payment/hosted" element={<BotHostedPayment />} />
                <Route path="/payment/card" element={<BotCardPayment />} />
                <Route path="/payment/complete" element={<BotPaymentComplete />} />
                <Route path="/user/kyc-callback" element={<KycCallback />} />
              </Routes>
            </Suspense>
            {/* </CHANGE> */}
          </ErrorBoundary>
        </PayPalScriptProvider>
         {/*    <TelegramBotPopup 
  botUsername="LuckyCharmSweepBot"
  channelLink="https://t.me/LuckyCharmSweepChannel" 
  showDelay={5000}
  autoShow={true}
/>*/}
<FloatingTelegramButton 
  botUsername="LuckyCharmSweepBot"
  position="bottom-left"
/>
    </HelmetProvider>
  )
}

export default App
