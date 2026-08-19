"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { userData, userToken } from "../../../redux/slice/authSlice"
import Loading from "../../../components/Common/Loading"
import { ApiHandler } from "../../../helper/ApiHandler"
import { API_ENDPOINTS, EXTRA_ENDPOINTS } from "../../../config/apiEndpoints"
import { isGuestAutoSession, clearGuestAutoSession } from "../../../helper/guestUserHelper"
import {
  generateCSRFToken,
  validatePasswordStrength,
  checkSuspiciousActivity,
  secureFormData,
  isValidEmail,
} from "../../../helper/FormSecurity"

const Profile = () => {
  const token = useSelector((state) => state.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const isGuestAuto = isGuestAutoSession()

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referral_code: "",
    oldPassword: "",
  })

  const { firstName, lastName, email, username, phone, password, confirmPassword, referral_code, oldPassword } =
    profileData

  const [errors, setErrors] = useState({})
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  useEffect(() => {
    generateCSRFToken()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await ApiHandler(API_ENDPOINTS.USER.PROFILE.GET, "GET", undefined, token, dispatch, navigate)
        if (response.data.status.code === 1) {
          const {
            first_name,
            last_name,
            email,
            username,
            phone,
            referral_code,
            sms_notifications: apiSmsNotifications,
            is_phone_verified,
          } = response.data.data

          const isSmsEnabled = apiSmsNotifications === "1" || apiSmsNotifications === 1
          const phoneVerifiedStatus = is_phone_verified === "1" || is_phone_verified === 1

          setProfileData((prevData) => ({
            ...prevData,
            firstName: first_name,
            lastName: last_name,
            email,
            username,
            phone,
            referral_code,
          }))

          setSmsNotifications(isSmsEnabled)
          setIsPhoneVerified(phoneVerifiedStatus)
        } else {
          toast.error(response.data.status.message || "Failed to fetch profile details.")
        }
      } catch (error) {
        toast.error("Failed to fetch profile data. Please try again.")
        console.error("Profile fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    } else {
      navigate("/login")
      setLoading(false)
    }
  }, [token, dispatch, navigate])

  const handleSmsToggle = () => {
    setSmsNotifications((prevState) => !prevState)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── Guest upgrade flow ────────────────────────────────────────────
    if (isGuestAuto) {
      let formIsValid = true
      const newErrors = {}

      if (!email || !isValidEmail(email)) {
        newErrors.email = "A valid email address is required."
        formIsValid = false
      }
      if (!password) {
        newErrors.password = "Please set a password for your account."
        formIsValid = false
      } else {
        const pv = validatePasswordStrength(password)
        if (!pv.isValid) { newErrors.password = pv.message; formIsValid = false }
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match."
        formIsValid = false
      }

      setErrors(newErrors)
      if (!formIsValid) return

      try {
        setLoading(true)
        const response = await ApiHandler(
          EXTRA_ENDPOINTS.GUEST_UPGRADE_USER,
          "POST",
          {
            email: email.trim(),
            password,
            confirm_password: confirmPassword,
            first_name: firstName || "Guest",
            last_name: lastName || "User",
          },
          token,
          dispatch,
          navigate
        )

        if (response?.data?.status?.code === 1) {
          const newToken = response?.data?.data?.token
          if (newToken) {
            dispatch(userToken({ token: newToken }))
            localStorage.setItem("token", newToken)
            // Refresh profile with new token
            try {
              const profileRes = await ApiHandler(
                API_ENDPOINTS.USER.PROFILE.GET, "GET", undefined, newToken, dispatch, navigate
              )
              if (profileRes?.data?.status?.code === 1) {
                dispatch(userData({ user: profileRes.data.data }))
              }
            } catch (_) {}
          }
          clearGuestAutoSession()
          toast.success("Account set up successfully! You can now log in with your email and password.")
          setProfileData((prev) => ({ ...prev, password: "", confirmPassword: "", oldPassword: "" }))
        } else {
          toast.error(response?.data?.status?.message || "Failed to set up account.")
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.")
        console.error("Guest upgrade error:", error)
      } finally {
        setLoading(false)
      }
      return
    }

    // ── Normal profile update flow ────────────────────────────────────
    const securityCheck = checkSuspiciousActivity({
      formKey: "profile_update",
      maxAttempts: 10,
      windowMs: 60000,
    })

    if (securityCheck.blocked) {
      toast.error(securityCheck.reason)
      return
    }

    let formIsValid = true
    const newErrors = {}

    if (!oldPassword) {
      newErrors.oldPassword = "Old password is required to update your profile."
      formIsValid = false
    }

    if (password) {
      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message
        formIsValid = false
      } else if (passwordValidation.warning) {
        toast.info(passwordValidation.message)
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "New passwords do not match!"
        formIsValid = false
      }
    }

    if (password && !confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password."
      formIsValid = false
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address."
      formIsValid = false
    }

    setErrors(newErrors)

    if (!formIsValid) {
      return
    }

    try {
      setLoading(true)
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        phone: phone,
        old_password: oldPassword,
        sms_notifications: smsNotifications,
        referral: referral_code,
      }

      if (password) {
        payload.password = password
        payload.confirm_password = confirmPassword
      }

      const securedPayload = secureFormData(payload)

      const response = await ApiHandler(API_ENDPOINTS.USER.PROFILE.UPDATE, "POST", securedPayload, token, dispatch, navigate)

      if (response.data.status.code === 1) {
        toast.success(response.data.status.message || "Profile updated successfully!")

        const profileResponse = await ApiHandler(API_ENDPOINTS.USER.PROFILE.GET, "GET", undefined, token, dispatch, navigate)
        if (profileResponse.data.status.code === 1) {
          dispatch(userData({ user: profileResponse.data.data }))
          setProfileData((prev) => ({ ...prev, password: "", confirmPassword: "", oldPassword: "" }))
        } else {
          toast.error("Failed to refresh profile data after update.")
        }
      } else {
        toast.error(response.data.status.message || "Failed to update profile.")
        if (response.data.status.message && response.data.status.message.toLowerCase().includes("old password")) {
          setErrors((prev) => ({ ...prev, oldPassword: response.data.status.message }))
        }
      }
    } catch (error) {
      toast.error("An error occurred during profile update. Please try again.")
      console.error("Profile update error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!token && !loading) {
    navigate("/login")
    return null
  }

  if (loading) return <Loading />

  return (
    <div className="mx-auto md:max-w-[70%] p-4 md:p-8 main-dot-bg rounded-lg">
      <form onSubmit={handleSubmit} className="bg-[#0E0E0E] p-4 md:p-6 rounded-xl w-full">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">Edit Profile</h2>

        {/* Guest account setup banner */}
        {isGuestAuto && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-400/60 bg-yellow-400/10">
            <p className="text-yellow-300 font-semibold text-sm mb-1">You are browsing as a guest.</p>
            <p className="text-yellow-200/70 text-xs">
              Set your real email and a password below to secure your account and enable withdrawals.
              You can log in with these credentials next time.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-white text-base font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-white text-base font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
              required
              maxLength={50}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-white text-base font-medium mb-2">
            Email {isGuestAuto && <span className="text-yellow-400 text-xs ml-1">(set your real email)</span>}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            readOnly={!isGuestAuto}
            className={`w-full p-3 rounded-md text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500 ${
              isGuestAuto ? "bg-[#222222]" : "bg-[#333333] text-gray-400 cursor-not-allowed"
            }`}
            placeholder={isGuestAuto ? "Enter your real email address" : undefined}
            required
            maxLength={100}
          />
          {errors.email && <div className="text-red-500 font-semibold py-1 text-sm">{errors.email}</div>}
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-white text-base font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
            required
            maxLength={30}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-white text-base font-medium mb-2">
            Phone {isPhoneVerified && <span className="text-xs text-green-400">(Verified)</span>}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={handleChange}
            readOnly={isPhoneVerified}
            className={`w-full p-3 rounded-md text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500 ${
              isPhoneVerified ? "bg-[#333333] text-gray-400 cursor-not-allowed" : "bg-[#222222]"
            }`}
            placeholder={isPhoneVerified ? "Phone number verified" : "Enter your phone number"}
            maxLength={20}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="referral_code" className="block text-white text-base font-medium mb-2">
            Your Referral Code
          </label>
          <input
            type="text"
            id="referral_code"
            name="referral_code"
            value={referral_code}
            disabled
            readOnly
            className="w-full p-3 rounded-md bg-[#333333] text-gray-400 border border-white/30 cursor-not-allowed"
          />
        </div>

        <hr className="my-6 border-gray-700" />

        {isGuestAuto ? (
          <p className="text-yellow-300/70 text-sm mb-4">
            Set a password to secure your account. You will use this to log in next time.
          </p>
        ) : (
          <p className="text-gray-400 text-sm mb-4">
            To change your password, enter your old password and then your new password below. Otherwise, leave the new
            password fields blank.
          </p>
        )}

        {/* Old password — only required for existing (non-guest) accounts */}
        {!isGuestAuto && (
          <div className="mb-4">
            <label htmlFor="oldPassword" className="block text-white text-base font-medium mb-2">
              Old Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={oldPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
              autoComplete="current-password"
              maxLength={128}
            />
            {errors.oldPassword && <div className="text-red-500 font-semibold py-1 text-sm">{errors.oldPassword}</div>}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="password" className="block text-white text-base font-medium mb-2">
            {isGuestAuto ? "Password" : "New Password (leave blank if not changing)"}
            {isGuestAuto && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
            autoComplete="new-password"
            maxLength={128}
          />
          {errors.password && <div className="text-red-500 font-semibold py-1 text-sm">{errors.password}</div>}
          {password && !errors.password && (
            <div className="text-gray-400 text-xs mt-1">
              Password must contain uppercase, lowercase, and numbers. Special characters recommended.
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-white text-base font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#222222] text-white border border-white/30 focus:border-yellow-500 focus:ring-yellow-500"
            autoComplete="new-password"
            maxLength={128}
          />
          {errors.confirmPassword && (
            <div className="text-red-500 font-semibold py-1 text-sm">{errors.confirmPassword}</div>
          )}
        </div>

        <hr className="my-6 border-gray-700" />

        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="smsNotifications" className="block text-white text-base font-medium">
            Receive SMS Notifications
          </label>
          <label className="switch ml-4">
            <input type="checkbox" id="smsNotifications" checked={smsNotifications} onChange={handleSmsToggle} />
            <span className="slider round"></span>
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-1 mb-6">
          By enabling SMS notifications, you agree to receive account-related updates. Message & data rates may apply.
        </p>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black py-3 rounded-md font-semibold hover:bg-yellow-600 transition duration-200"
          disabled={loading}
        >
          {loading ? "UPDATING..." : isGuestAuto ? "SAVE & SECURE MY ACCOUNT" : "UPDATE PROFILE"}
        </button>
      </form>
    </div>
  )
}

export default Profile
