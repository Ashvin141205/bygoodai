import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SignUpBg from '../../../assets/image/signUpBg.png';
import { toast } from 'react-toastify';
import { setLevelDataState, UPDATE_BALANCE, userData, userToken } from '../../../redux/slice/authSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import Loading from '../../../components/Common/Loading';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SocialLoginButtons from '../../../components/SocialLoginButtons'; // Import the new component


const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Default loading state is false
  // const [recaptchaToken, setRecaptchaToken] = useState(null);
  // const handleCaptchaChange = useCallback((token) => {
  //   setRecaptchaToken(token);
  // }, []);


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '', // Auto-generated from firstName
    phone: '',
    referralCode: '',
    password: '',
    confirmPassword: '', // Will be same as password
    age: '21', // Default age set to 21, hidden from user
  });
  // NEW/MODIFIED useEffect to populate referralCode from cookie
  useEffect(() => {
    const refCodeFromCookie = Cookies.get('referralCode');
    if (refCodeFromCookie) {
      setFormData((prevState) => ({
        ...prevState,
        referralCode: refCodeFromCookie,
      }));
    }
  }, []); // Runs once on mount
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };
    
    // Auto-generate username from firstName
    if (name === 'firstName' && value) {
      const timestamp = Date.now().toString().slice(-4);
      const cleanName = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      updates.username = cleanName + timestamp;
    }
    
    // Auto-set confirmPassword to match password
    if (name === 'password') {
      updates.confirmPassword = value;
    }
    
    setFormData((prevState) => ({
      ...prevState,
      ...updates,
    }));
  };
  const getFingerprint = async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result?.visitorId || null; // This is the unique fingerprint
    } catch (error) {
      console.warn('Fingerprint unavailable for this user/browser:', error);
      return null;
    }
  };

  // =================================================================
  // === START: THE CLIENT-SIDE FIX (NEW FUNCTION) ===
  // This function gets a unique ID from localStorage or creates a new one.
  const getOrSetClientId = () => {
    let clientId = localStorage.getItem('uniqueClientIdentifier');
    if (!clientId) {
      // Generate a unique ID with fallback for older browsers
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // Modern browsers
        clientId = crypto.randomUUID();
      } else {
        // Fallback for older browsers (Android 8.1, Chrome 70, etc.)
        clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : ((r & 0x3) | 0x8);
          return v.toString(16);
        });
      }
      localStorage.setItem('uniqueClientIdentifier', clientId);
    }
    return clientId;
  };
  // === END: THE CLIENT-SIDE FIX ===
  // =================================================================


  const validateReferralCode = async (referralCode) => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.AUTH.VALIDATE_REFERRAL, 'POST', { referral_code: referralCode });

      if (response.data.status.code === 1) {
        return true; // Referral code is valid
      } else {
        toast.error(response.data.status.message || 'Invalid referral code');
        return false; // Referral code is invalid
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      toast.error('An error occurred while validating the referral code. Please try again.');
      return false; // Handle API errors gracefully
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if the phone number is provided
    if (!formData.phone) {
      toast.error('Phone number is required.');
      return;
    }

    // reCAPTCHA validation
    // if (!recaptchaToken) {
    //   toast.error('Please complete the reCAPTCHA.');
    //   return;
    // }

    // Validate age
    const userAge = parseInt(formData.age, 10);
    if (!formData.age || isNaN(userAge) || userAge < 21) {
      toast.error('You must be at least 21 years old to register.');
      return;
    }
    if (formData.referralCode) {
      const isReferralCodeValid = await validateReferralCode(formData.referralCode);
      if (!isReferralCodeValid) {
        return; // Stop submission if the referral code is invalid
      }
    }
    const fingerprint = await getFingerprint();

    // =================================================================
    // === START: THE CLIENT-SIDE FIX (GET THE UUID) ===
    const uniqueClientId = getOrSetClientId();
    // === END: THE CLIENT-SIDE FIX ===
    // =================================================================



    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    // Age validation
    if (!formData.age || isNaN(userAge) || userAge < 21) { toast.error('You must be at least 21 years old to register.');
      return;
    }
    // Construct the payload
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      username: formData.username,
      phone: formData.phone,
      referral_code: formData.referralCode, // Include the referral code in payload
      password: formData.password,
      confirm_password: formData.confirmPassword,
      fingerprint: fingerprint,

      // =================================================================
      // === START: THE CLIENT-SIDE FIX (SEND THE UUID) ===
      client_uuid: uniqueClientId, // <-- ADD THIS NEW PIECE OF DATA
      public_ip_hint: typeof window !== 'undefined' ? window.clientIP || null : null,
      // === END: THE CLIENT-SIDE FIX ===
      // =================================================================
   utm_source: Cookies.get('utm_source') || null,
      utm_medium: Cookies.get('utm_medium') || null,
      utm_campaign: Cookies.get('utm_campaign') || null,
      // Include fingerprint
      // Include user agent
    };

    try {
      setLoading(true);
      const response = await ApiHandler(API_ENDPOINTS.AUTH.SIGNUP, 'POST', payload, undefined, dispatch, navigate);

      if (response.data.status.code === 1) {
        toast.success(response.data.status.message);
        const responseData = response.data.data || {};
        const { token, signupBonus } = responseData;

        dispatch(userToken({ token }));

        // Set tags using the main OneSignal SDK


        // Fetch bounus level data
        try {
          const response = await ApiHandler(API_ENDPOINTS.BONUS.GET_LEVEL, 'POST', undefined, token, dispatch, navigate);
          if (response.data && response.data.status.code === 1) {
            const enrichedData = response.data.data; // Assume enrichData is a function to process data
            dispatch(setLevelDataState(enrichedData));
          } else {
            console.error('Failed to fetch bonus levels: Invalid response');
          }
        } catch (error) {
          console.error('Failed to fetch bonus levels:', error);
        }

        // Fetch user profile data
        const profileResponse = await ApiHandler(API_ENDPOINTS.USER.PROFILE.GET, 'GET', undefined, token, dispatch, navigate);

        if (profileResponse.data.status.code === 1) {
          dispatch(userData({ user: profileResponse.data.data }));
          
          // Use signup bonus from backend response (if available)
          if (signupBonus && signupBonus.code) {
            // Save the popup state and coupon code to localStorage
            localStorage.setItem('showCouponPopup', 'true');
            localStorage.setItem('couponCode', signupBonus.code);
          }
        } else {
          toast.error('Failed to fetch profile data');
        }

        // Get User Balance
        try {
          const balanceResponse = await ApiHandler(API_ENDPOINTS.USER.BALANCE.GET, 'GET', undefined, token, dispatch, navigate);
          const { main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count } = balanceResponse.data.data;

          // Dispatch the action to update the balance
          dispatch(UPDATE_BALANCE({ main_balance, bonus_balance, total_deposit, promotion_count, system_count, total_count }));
        } catch (error) {
          console.error('Balance fetch error:', error);
        }
        
        setLoading(false);
        
        // Navigate to deposit page after everything is complete
        navigate('/deposit');
      } else {
        toast.error(response.data.status.message);
        setFormData({
          ...formData,
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup. Please try again.');

      // Clear specific fields in case of an error
      setFormData({
        ...formData,
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Sign Up Free - Lucky Charms Sweepstakes Casino | Get $2 Free + $10 Bonus</title>
        <meta name="description" content="Join Lucky Charms Sweepstakes Casino today! Sign up free in the USA and get $2 instant bonus plus $10 deposit bonus on your first order. Fast registration, no credit card required to start!" />
        <link rel="canonical" href="https://www.luckycharmsweep.com/sign-up" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.luckycharmsweep.com/sign-up" />
        <meta property="og:title" content="Sign Up Free - Lucky Charms Sweepstakes Casino" />
        <meta property="og:description" content="Get $2 free bonus + $10 deposit match! Join the #1 sweepstakes casino in the USA. Quick registration, instant access to Orion Stars, Juwa & more!" />
        <meta property="og:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.luckycharmsweep.com/sign-up" />
        <meta name="twitter:title" content="Sign Up Free - Lucky Charms Sweepstakes Casino" />
        <meta name="twitter:description" content="Get $2 free bonus + $10 deposit match! Join today for instant access to top games." />
        <meta name="twitter:image" content="https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg" />
        
        {/* Keywords targeting high-volume searches */}
        <meta name="keywords" content="lucky charms sweepstakes casino login usa sign up, lucky charms sweepstakes casino sign up free, lucky charms casino sign up, sweepstakes casino registration, free casino bonus, no deposit bonus" />
      </Helmet>
      
      <div
        style={{
          backgroundImage: `url(${SignUpBg})`,
        }}
        className='min-h-screen bg-cover'
      >
        <div className='container mx-auto px-4 md:px-8'>
          <div className='pt-16 md:pt-32'>
          <h1 className='flex font-bold justify-center items-center text-[#FFDD15] text-2xl md:text-4xl underline bg-cover'>
            REGISTER
          </h1>
          <div className='flex justify-center items-center flex-col text-white text-md md:text-xl font-bold uppercase mt-6 md:mt-10'>
            <p>Get $10 deposit bonus on your first order!</p>
            <p className='text-center'>Plus, get $2 Freeplay just for signing up - no deposit required!</p>
          </div>
        </div>

        <div className='flex justify-center mt-8 md:mt-10 pb-10'>
          <form onSubmit={handleSubmit} className='bg-[#0E0E0E] p-4 md:p-6 rounded-xl w-full md:w-2/3 lg:w-1/2'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label htmlFor='firstName' className='block text-white text-sm mb-2'>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500'
                  required
                  placeholder='Enter first name'
                />
              </div>
              <div>
                <label htmlFor='lastName' className='block text-white text-sm mb-2'>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500'
                  required
                  placeholder='Enter last name'
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-white text-sm mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                country={'us'} // Default country
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })} // Update state without validation
                inputProps={{
                  name: 'phone',
                  required: true, // Mark as required
                  className: 'w-full pl-11 p-2 rounded-md bg-[#222222] text-white border border-white/50',
                }}
                containerClass="w-full relative"
                dropdownClass="custom-dropdown"
                inputClass="w-full"
                buttonClass="border border-white/50"
              />

            </div>

            {/* Email Address */}
            <div className='mb-4'>
              <label htmlFor='email' className='block text-white text-sm mb-2'>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500'
                required
                placeholder='Enter email address'
              />
            </div>

            {/* Password */}
            <div className='mb-4'>
              <label htmlFor='password' className='block text-white text-sm mb-2'>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500'
                required
                placeholder='Create a password'
              />
            </div>

            {/* Terms and No-Refund Policy Acceptance */}
            <div className="mt-4 mb-4 p-4 bg-gray-800/50 border border-yellow-500/30 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-2 border-yellow-500 bg-gray-700 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer flex-shrink-0"
                  required
                />
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Privacy Policy
                    </Link>
                    , and understand that all purchases of Virtual Currency Credits are{' '}
                    <span className="text-yellow-400 font-semibold">final and non-refundable</span> as they are intangible digital goods consumed instantly.
                  </p>
                </div>
              </label>
            </div>

            <div className="mb-6">
              {/*<Captcha onCaptchaChange={handleCaptchaChange} /> */}
            </div>

            <button type='submit' className='w-full bg-yellow-500 text-black py-2 rounded-md font-semibold'>
              NEXT
            </button>
            <SocialLoginButtons pageType="signup" />

          </form>

        </div>
      </div>
    </div>
    </>
  );
};

export default Signup;