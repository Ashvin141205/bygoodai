import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { ApiHandler } from '../helper/ApiHandler';
import { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from '../firebase';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { UPDATE_BALANCE, userData, userToken, setSignupBonus } from '../redux/slice/authSlice';
import { EXTRA_ENDPOINTS, USER_ENDPOINTS } from '../config/apiEndpoints';
// =================================================================
// === START: THE CLIENT-SIDE FIX (IMPORT FingerprintJS) ===
// =================================================================
import FingerprintJS from '@fingerprintjs/fingerprintjs';
// =================================================================
// === END: THE CLIENT-SIDE FIX ===
// =================================================================

// Social Button Component for Reusability (Used by Facebook)
const SocialButton = ({ platform, onClick, disabled, icon, label }) => {
    const buttonClasses = platform === 'Google'
        ? 'w-full flex items-center justify-center gap-2 text-sm sm:text-base bg-red-600 text-white py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50'
        : 'w-full flex items-center justify-center gap-2 text-sm sm:text-base bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={`Login with ${platform}`}
            className={buttonClasses}
        >
            {icon} {label}
        </button>
    );
};

const SocialLoginButtons = ({ pageType = 'login', from }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    
    const googleButtonContainerRef = useRef(null);
    const [googleButtonWidth, setGoogleButtonWidth] = useState(0);

    const buttonText = pageType === 'signup' ? 'Sign up' : 'Continue';

    useEffect(() => {
        const updateWidth = () => {
            if (googleButtonContainerRef.current) {
                setGoogleButtonWidth(googleButtonContainerRef.current.offsetWidth);
            }
        };
        updateWidth(); 
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const refCodeFromUrl = queryParams.get('ref');
        if (refCodeFromUrl) {
            Cookies.set('referralCode', refCodeFromUrl, { expires: 30, path: '/' });
        }
    }, [location]);

    // =================================================================
    // === START: THE CLIENT-SIDE FIX (ADD HELPER FUNCTIONS) ===
    // =================================================================
    const getOrSetClientId = () => {
        let clientId = localStorage.getItem('uniqueClientIdentifier');
        if (!clientId) {
            clientId = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem('uniqueClientIdentifier', clientId);
        }
        return clientId;
    };

    const getFingerprint = async () => {
        try {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            return result?.visitorId || null;
        } catch (error) {
            console.warn('Fingerprint unavailable for this user/browser:', error);
            return null;
        }
    };
    // =================================================================
    // === END: THE CLIENT-SIDE FIX ===
    // =================================================================

    const handleBackendLogin = async (idToken) => {
        setLoading(true);
        const referralCode = Cookies.get('referralCode');
        
        try {
            // =================================================================
            // === START: THE CLIENT-SIDE FIX (GET FINGERPRINT & UUID) ===
            // =================================================================
            const fingerprint = await getFingerprint();
            const uniqueClientId = getOrSetClientId();
            // =================================================================
            // === END: THE CLIENT-SIDE FIX ===
            // =================================================================

            const payload = { 
                idToken,
                // =================================================================
                // === START: THE CLIENT-SIDE FIX (SEND NEW DATA) ===
                // =================================================================
                fingerprint: fingerprint,
                client_uuid: uniqueClientId,
                public_ip_hint: typeof window !== 'undefined' ? window.clientIP || null : null
                // =================================================================
                // === END: THE CLIENT-SIDE FIX ===
                // =================================================================
            };
            if (referralCode) {
                payload.referral_code = referralCode;
            }

            const loginResponse = await ApiHandler(EXTRA_ENDPOINTS.FIREBASE_LOGIN, 'POST', payload);
            const loginStatus = loginResponse?.data?.status;

            if (referralCode) {
                Cookies.remove('referralCode');
            }

            if (loginStatus?.code !== 1) {
                throw new Error(loginStatus?.message || loginResponse?.data?.message || 'Login failed.');
            }

            const { token, signupBonus } = loginResponse?.data?.data || {};
            const message = loginStatus?.message || 'Login successful!';

            if (!token) {
                throw new Error('Login succeeded but token was missing. Please try again.');
            }
            
            dispatch(userToken({ token }));
            toast.success(message);

            try {
                await Promise.all([
                    ApiHandler(USER_ENDPOINTS.PROFILE.GET, 'GET', undefined, token).then(res => {
                        if (res?.data?.status?.code === 1) dispatch(userData({ user: res?.data?.data }));
                    }),
                    ApiHandler(USER_ENDPOINTS.BALANCE.GET, 'GET', undefined, token).then(res => {
                        if (res.data && res.data.data) dispatch(UPDATE_BALANCE(res.data.data));
                    }),
                ]);
            } catch (error) {
                console.error("Failed to fetch user data after login:", error);
                toast.error("Session started, but failed to load profile. Please refresh.");
            }

            let shouldShowBonus = false;
            // Check if signup bonus was granted in the login response
            if (message === 'Registration successful!' && signupBonus) {
                console.log('Signup Bonus from login response:', signupBonus); // Debug log
                dispatch(setSignupBonus(signupBonus));
                
                // Save to localStorage for popup display (same as manual registration)
                if (signupBonus.code) {
                    console.log('Setting localStorage coupon:', signupBonus.code); // Debug log
                    localStorage.setItem('showCouponPopup', 'true');
                    localStorage.setItem('couponCode', signupBonus.code);
                    shouldShowBonus = true;
                } else {
                    console.warn('No code in signupBonus'); // Debug log
                }
            }
            
            // Navigate to deposit page for new users (to show coupon popup), otherwise bonuses page
            console.log('Navigating with shouldShowBonus:', shouldShowBonus); // Debug log
            navigate(shouldShowBonus ? '/deposit' : (from || '/bonuses/level'), { replace: true });

        } catch (error) {
            const backendMessage = error?.response?.data?.status?.message;
            toast.error(backendMessage || error?.message || 'An error occurred during social login.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            toast.error('Google sign-in failed: No credential received.');
            return;
        }
        setLoading(true);
        const googleCredential = GoogleAuthProvider.credential(credentialResponse.credential);
        try {
            const result = await signInWithCredential(auth, googleCredential);
            const idToken = await result.user.getIdToken();
            await handleBackendLogin(idToken);
        } catch (error) {
            setLoading(false);
            console.error('Firebase Google Auth Error:', error);
            toast.error('Google sign-in failed. Please try again.');
        }
    };
    
    const handleFacebookSuccess = async (response) => {
        if (!response?.accessToken) {
            toast.error('Facebook login failed. Could not get access token.');
            return;
        }
        setLoading(true);
        const facebookCredential = FacebookAuthProvider.credential(response.accessToken);
        try {
            const result = await signInWithCredential(auth, facebookCredential);
            const idToken = await result.user.getIdToken();
            await handleBackendLogin(idToken);
        } catch (error) {
            setLoading(false);
            console.error('Firebase Facebook Auth Error:', error);
            toast.error('Facebook sign-in failed. Please try again.');
        }
    };

    return (
        <div className="mt-6">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <div className="mt-2">
                <div className="max-w-md mx-auto flex justify-center">
                    
                    {/* Google Login Button */}
                    <div ref={googleButtonContainerRef} className="w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Google login failed.')}
                            useOneTap
                            text={pageType === 'signup' ? 'signup_with' : 'continue_with'}
                            shape="rectangular"
                            width={googleButtonWidth ? `${googleButtonWidth}px` : undefined}
                            logo_alignment="center"
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Facebook Login Button 
                    <div className="flex-1">
                        <FacebookLogin
                            appId="788797843550048" 
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={handleFacebookSuccess}
                            render={renderProps => (
                                <SocialButton
                                    platform="Facebook"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled || loading}
                                    icon={<FaFacebook />}
                                    label={loading ? "Signing in..." : `${buttonText} with Facebook`}
                                />
                            )}
                        />
                    </div>
                    */}
                    
                </div>
            </div>
        </div>
    );
};

export default SocialLoginButtons;