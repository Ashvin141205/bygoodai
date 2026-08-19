import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ApiHandler } from '../../helper/ApiHandler';
import { API_ENDPOINTS, EXTRA_ENDPOINTS } from '../../config/apiEndpoints';
import { userData, userToken } from '../../redux/slice/authSlice';
import { isGuestAutoSession, clearGuestAutoSession } from '../../helper/guestUserHelper';

// NOTE: Replace 'YOUR_TELEGRAM_BOT_USERNAME' with your bot's actual username.
// The link below uses the standard Telegram deep link format (tg://resolve)
// A common fallback for web browsers is 'https://t.me/YOUR_TELEGRAM_BOT_USERNAME'
const TELEGRAM_BOT_LINK = "https://t.me/LuckCharmSweepBot"; // Placeholder: Update this with your actual bot link if known.

const BotPaymentComplete = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const currentToken = useSelector((state) => state.auth.token);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [isGuestAuto] = useState(() => isGuestAutoSession());
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const orderId = searchParams.get('order_id') || '';
  const guestTokenFromQuery = searchParams.get('guest_token');
  const guestTokenFromStorage = localStorage.getItem('guest_checkout_token');
  const guestToken = guestTokenFromQuery || guestTokenFromStorage || '';

  // Session-based guest (came via bot with guest_token)
  const canLinkEmail = useMemo(
    () => Boolean(guestToken) && !isGuestAuto && !alreadyClaimed && !claimSuccess,
    [guestToken, isGuestAuto, alreadyClaimed, claimSuccess]
  );
  // Auto-guest (account created silently on add-to-cart)
  const canUpgradeAccount = useMemo(
    () => isGuestAuto && !claimSuccess,
    [isGuestAuto, claimSuccess]
  );

  const handleGoBackToBot = () => {
    // Attempt to open the deep link, then fall back to the browser link
    window.open(TELEGRAM_BOT_LINK, '_blank');
    
    // After redirecting, navigate the user away from the payment page
    // This is optional but prevents accidental re-engagement.
    navigate('/', { replace: true });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkGuestSessionStatus = async () => {
    if (!guestToken) {
      return;
    }

    setIsStatusLoading(true);
    try {
      const response = await axios.post(
        EXTRA_ENDPOINTS.GUEST_CHECKOUT_SESSION_STATUS,
        { guest_token: guestToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const isSuccess = response?.data?.status?.code === 1;
      if (isSuccess && response?.data?.data?.claimed_user_id) {
        setAlreadyClaimed(true);
      }
    } catch (error) {
      // Silent fail: linking section remains visible when status lookup fails.
      console.error('[BotPaymentComplete] Failed to fetch guest status:', error);
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    if (guestTokenFromQuery) {
      localStorage.setItem('guest_checkout_token', guestTokenFromQuery);
    }
    checkGuestSessionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestTokenFromQuery]);

  // ── Auto-guest upgrade ──────────────────────────────────────────────────
  const handleUpgradeAccount = async (event) => {
    event.preventDefault();
    setClaimError('');
    setClaimSuccess('');

    if (!formData.email || !formData.password || !formData.confirm_password) {
      setClaimError('Email, password, and confirm password are required.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setClaimError('Passwords do not match.');
      return;
    }

    setIsClaiming(true);
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name?.trim() || 'Guest',
        last_name: formData.last_name?.trim() || 'User',
      };

      const response = await ApiHandler(
        EXTRA_ENDPOINTS.GUEST_UPGRADE_USER,
        'POST',
        payload,
        currentToken,
        dispatch,
        navigate
      );

      if (response?.data?.status?.code === 1) {
        const newToken = response?.data?.data?.token;
        if (newToken) {
          dispatch(userToken({ token: newToken }));
          localStorage.setItem('token', newToken);
          try {
            const profileRes = await ApiHandler(
              API_ENDPOINTS.USER.PROFILE.GET,
              'GET',
              undefined,
              newToken,
              dispatch,
              navigate
            );
            if (profileRes?.data?.status?.code === 1) {
              dispatch(userData({ user: profileRes.data.data }));
            }
          } catch (_) { /* profile refresh failure is non-fatal */ }
        }

        clearGuestAutoSession();
        setClaimSuccess('Account set up! Complete your profile to unlock withdrawals.');

        setTimeout(() => {
          navigate('/profile', {
            replace: true,
            state: { requireWithdrawalProfileCompletion: true, source: 'guest_auto_upgrade' },
          });
        }, 1200);
      } else {
        setClaimError(response?.data?.status?.message || 'Unable to set up account right now.');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.status?.message;
      setClaimError(apiMessage || 'Unable to set up account right now. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  // ── Session-based guest claim ───────────────────────────────────────────
  const handleClaimAccount = async (event) => {
    event.preventDefault();
    setClaimError('');
    setClaimSuccess('');

    if (!guestToken) {
      setClaimError('Guest session not found. Please complete checkout again to link an email.');
      return;
    }

    if (!formData.email || !formData.password || !formData.confirm_password) {
      setClaimError('Email, password, and confirm password are required.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setClaimError('Password and confirm password do not match.');
      return;
    }

    setIsClaiming(true);
    try {
      const payload = {
        guest_token: guestToken,
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name?.trim() || 'Guest',
        last_name: formData.last_name?.trim() || 'User',
      };

      const response = await axios.post(
        EXTRA_ENDPOINTS.GUEST_CHECKOUT_CLAIM_ACCOUNT,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response?.data?.status?.code === 1) {
        const linkedToken = response?.data?.data?.token;

        if (linkedToken) {
          dispatch(userToken({ token: linkedToken }));
          try {
            const profileResponse = await ApiHandler(
              API_ENDPOINTS.USER.PROFILE.GET,
              'GET',
              undefined,
              linkedToken,
              dispatch,
              navigate
            );

            if (profileResponse?.data?.status?.code === 1) {
              dispatch(userData({ user: profileResponse.data.data }));
            }
          } catch (profileError) {
            console.error('[BotPaymentComplete] Failed to refresh profile after linking:', profileError);
          }
        }

        setClaimSuccess('Email linked successfully. Please complete your name and phone in Profile before making withdrawals.');
        setAlreadyClaimed(true);
        localStorage.removeItem('guest_checkout_token');

        setTimeout(() => {
          navigate('/profile', {
            replace: true,
            state: {
              requireWithdrawalProfileCompletion: true,
              source: 'guest_checkout_link',
            },
          });
        }, 1200);
      } else {
        setClaimError(response?.data?.status?.message || 'Unable to link email at the moment.');
      }
    } catch (error) {
      const apiMessage = error?.response?.data?.status?.message;
      setClaimError(apiMessage || 'Unable to link email at the moment. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4">
      <div 
        className="max-w-md w-full bg-[#1f2937] p-8 md:p-10 rounded-xl shadow-2xl transform transition-all duration-500 hover:shadow-yellow-500/30" 
        style={{ borderColor: "rgba(255, 255, 255, 0.16)", borderWidth: "1px" }}
      >
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-[#01D370] animate-pulse" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
          Payment Submitted!
        </h1>
        
        {/* Main Message */}
        <p className="text-lg text-gray-300 mb-8 text-center">
          Your payment was successfully submitted and recorded. The payment will be approved shortly.
        </p>

        {orderId && (
          <p className="text-sm text-gray-400 mb-6 text-center">Order ID: {orderId}</p>
        )}

        {/* Highlighted Status Box */}
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-500/50 mb-8">
            <div className="flex justify-between items-center text-xl font-semibold text-white">
                <span className="text-yellow-400">Current Status:</span>
                <span>Processing</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
                All further updates (approval, game credentials) will be sent directly to your Telegram chat.
            </p>
        </div>

        {isStatusLoading && (
          <div className="mb-6 text-sm text-gray-300">Checking account link status...</div>
        )}

        {/* ── Auto-guest: upgrade account form ────────────────────────── */}
        {canUpgradeAccount && (
          <div className="bg-gray-800 p-4 rounded-lg border border-yellow-400/50 mb-8">
            <h2 className="text-white text-lg font-semibold mb-2">Set Up Your Account</h2>
            <p className="text-sm text-gray-300 mb-4">
              You checked out as a guest. Add your real email and password now so you can log in later and request withdrawals.
            </p>

            <form onSubmit={handleUpgradeAccount} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your real email address"
                required
                className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password (min 8 chars)"
                  required
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  required
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {claimError && <p className="text-sm text-red-400">{claimError}</p>}
              {claimSuccess && <p className="text-sm text-emerald-400">{claimSuccess}</p>}

              <button
                type="submit"
                disabled={isClaiming}
                className="w-full py-2 px-4 bg-[#FFDD15] text-black font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
              >
                {isClaiming ? 'Setting up...' : 'Save Email & Password'}
              </button>
            </form>
          </div>
        )}

        {canLinkEmail && (
          <div className="bg-gray-800 p-4 rounded-lg border border-emerald-500/40 mb-8">
            <h2 className="text-white text-lg font-semibold mb-2">Link Email To This Purchase</h2>
            <p className="text-sm text-gray-300 mb-4">
              Create an account now to access this order with email login later. After linking, complete your name and phone to unlock withdrawals.
            </p>

            <form onSubmit={handleClaimAccount} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                required
                className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  required
                  className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {claimError && <p className="text-sm text-red-400">{claimError}</p>}
              {claimSuccess && <p className="text-sm text-emerald-400">{claimSuccess}</p>}

              <button
                type="submit"
                disabled={isClaiming}
                className="w-full py-2 px-4 bg-[#FFDD15] text-black font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
              >
                {isClaiming ? 'Linking Email...' : 'Link Email'}
              </button>
            </form>
          </div>
        )}

        {alreadyClaimed && (
          <div className="bg-gray-800 p-4 rounded-lg border border-emerald-500/40 mb-8">
            <p className="text-sm text-emerald-300 mb-3">
              This purchase is already linked to an account.
            </p>
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-[#FFDD15] text-black font-semibold rounded-md hover:opacity-90 transition"
            >
              Go To Login
            </Link>
          </div>
        )}

        {/* Action Button: Back to Telegram */}
        <button
          onClick={handleGoBackToBot}
          className="w-full flex items-center justify-center py-3 px-6 bg-[#0070BA] text-white text-xl font-bold rounded-lg shadow-lg hover:bg-[#005a9c] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
          <ArrowLeftIcon className="w-6 h-6 mr-3" />
          Back to Telegram Bot
        </button>

        {/* Fallback link */}
        <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/" className="hover:underline hover:text-gray-400 transition">
                Return to Homepage
            </Link>
        </p>
      </div>
    </div>
  );
};

export default BotPaymentComplete;