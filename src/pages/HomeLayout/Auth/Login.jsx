"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { setLevelDataState, UPDATE_BALANCE, userData, userToken } from "../../../redux/slice/authSlice"
import SignUpBg from "../../../assets/image/signUpBg.png"
import { toast } from "react-toastify"
import { ApiHandler } from "../../../helper/ApiHandler"
import { API_ENDPOINTS } from "../../../config/apiEndpoints"
import Loading from "../../../components/Common/Loading"
import SocialLoginButtons from "../../../components/SocialLoginButtons"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import {
  generateCSRFToken,
  checkSuspiciousActivity,
  secureFormData,
  isValidEmail,
  rateLimiter,
} from "../../../helper/FormSecurity"
import { ensureGuestSession } from "../../../helper/guestUserHelper"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const canonicalUrl = "https://www.luckycharmsweep.com/login"
  const pageTitle = "Login - Lucky Charm Sweep"
  const pageDescription =
    "Login to your Lucky Charm Sweep account to access your favorite online sweepstakes games, manage your profile, and enjoy exclusive bonuses."
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"

  const redirectPath = location?.state?.from || "/dashboard"
  const [guestLoading, setGuestLoading] = useState(false)

  useEffect(() => {
    generateCSRFToken()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill out both email and password.")
      return false
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.")
      return false
    }

    return true
  }

  // =================================================================
  // === START: THE CLIENT-SIDE FIX (NEW FUNCTIONS) ===
  // This function gets a unique ID from localStorage or creates a new one.
  const getOrSetClientId = () => {
    let clientId = localStorage.getItem("uniqueClientIdentifier")
    if (!clientId) {
      clientId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem("uniqueClientIdentifier", clientId)
    }
    return clientId
  }

  // This function gets the browser fingerprint.
  const getFingerprint = async () => {
    try {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      return result?.visitorId || null
    } catch (error) {
      console.warn("Fingerprint unavailable for this user/browser:", error)
      return null
    }
  }
  // === END: THE CLIENT-SIDE FIX ===
  // =================================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    const securityCheck = checkSuspiciousActivity({
      formKey: "login",
      maxAttempts: 5,
      windowMs: 60000, // 1 minute
    })

    if (securityCheck.blocked) {
      toast.error(securityCheck.reason)
      return
    }

    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // =================================================================
      // === START: THE CLIENT-SIDE FIX (GET FINGERPRINT & UUID) ===
      const fingerprint = await getFingerprint()
      const uniqueClientId = getOrSetClientId()
      // === END: THE CLIENT-SIDE FIX ===
      // =================================================================

      const securedData = secureFormData({
        email: formData.email,
        password: formData.password,
        fingerprint: fingerprint,
        client_uuid: uniqueClientId,
      })

      const response = await ApiHandler(API_ENDPOINTS.AUTH.LOGIN, "POST", securedData, undefined, dispatch, navigate)
      if (response.data.status.code === 1) {
        rateLimiter.reset("login")

        toast.success(response.data.status.message || "Login successful!")
        const { token } = response.data.data
        dispatch(userToken({ token }))

        setDataLoading(true)

        try {
          const bonusResponse = await ApiHandler(API_ENDPOINTS.BONUS.GET_LEVEL, "POST", undefined, token, dispatch, navigate)
          if (bonusResponse.data && bonusResponse.data.status.code === 1) {
            dispatch(setLevelDataState(bonusResponse.data.data))
          }
        } catch (error) {
          console.error("Failed to fetch bonus levels:", error)
        }

        const profileResponse = await ApiHandler(API_ENDPOINTS.USER.PROFILE.GET, "GET", undefined, token, dispatch, navigate)
        if (profileResponse.data.status.code === 1) {
          dispatch(userData({ user: profileResponse.data.data }))
        } else {
          toast.error("Failed to fetch profile data.")
        }

        try {
          const balanceResponse = await ApiHandler(API_ENDPOINTS.USER.BALANCE.GET, "GET", undefined, token, dispatch, navigate)
          if (balanceResponse.data && balanceResponse.data.data) {
            dispatch(UPDATE_BALANCE(balanceResponse.data.data))
          }
        } catch (error) {
          console.error("Error fetching user balance:", error)
        }

        setDataLoading(false)
        navigate(redirectPath, { replace: true })
      } else {
        toast.error(response.data.status.message || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setLoading(false)
      setFormData({ email: "", password: "" })
    }
  }

  const handleGuestCheckout = async () => {
    setGuestLoading(true)
    try {
      const token = await ensureGuestSession(dispatch, null)
      if (token) {
        navigate(redirectPath, { replace: true })
      } else {
        toast.error('Could not start guest session. Please try again.')
      }
    } catch (err) {
      toast.error('Could not start guest session. Please try again.')
    } finally {
      setGuestLoading(false)
    }
  }

  if (loading || dataLoading || guestLoading) {
    return <Loading />
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div style={{ backgroundImage: `url(${SignUpBg})` }} className="min-h-screen bg-cover">
        <div className="container mx-auto px-4 md:px-8">
          <div className="pt-16 md:pt-32">
            <h1 className="flex font-bold justify-center items-center text-[#FFDD15] text-2xl md:text-4xl underline bg-cover">
              LOGIN
            </h1>
          </div>
          <div className="flex justify-center mt-8 md:mt-10 pb-10">
            <form onSubmit={handleSubmit} className="bg-[#0E0E0E] p-4 md:p-6 rounded-xl w-full md:w-2/3 lg:w-1/2">
              <div className="mb-4">
                <label htmlFor="email" className="block text-white text-sm mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                  autoComplete="email"
                  maxLength={100}
                />
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-white text-sm mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-yellow-500 text-xs sm:text-sm hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                    required
                    autoComplete="current-password"
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-yellow-500 text-black py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "SIGNING IN..." : "Sign In"}
              </button>

              {/* ── Guest Checkout ───────────────────────────────── */}
              <div className="mt-5">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/20" />
                  <span className="mx-3 text-white/50 text-xs uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-white/20" />
                </div>
                <button
                  type="button"
                  onClick={handleGuestCheckout}
                  disabled={guestLoading}
                  className="w-full mt-4 bg-transparent border border-yellow-400 text-yellow-400 py-2 rounded-md font-semibold hover:bg-yellow-400 hover:text-black transition-colors duration-200 disabled:opacity-50"
                >
                  {guestLoading ? "Starting guest session..." : "Guest Checkout"}
                </button>
                <p className="text-center text-xs text-white/40 mt-2">
                  No account needed — you can save your email after payment.
                </p>
              </div>

              {/* Pass the redirect path to the social login component */}
              <SocialLoginButtons from={redirectPath} />
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
