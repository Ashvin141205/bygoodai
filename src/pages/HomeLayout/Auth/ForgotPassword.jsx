import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { Helmet } from 'react-helmet-async'; // Import Helmet
import SignUpBg from '../../../assets/image/signUpBg.png'; // Ensure this path is correct
import { toast } from 'react-toastify';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux'; // useSelector is needed
import Loading from '../../../components/Common/Loading'; // Assuming you have a Loading component

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state
    // const token = useSelector((state) => state.auth.token); // Token might not be needed here unless API requires it
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Define the canonical URL for this page
    // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
    const canonicalUrl = "https://www.luckycharmsweep.com/forgot-password";
    const pageTitle = "Forgot Password - Lucky Charm Sweep";
    const pageDescription = "Forgot your Lucky Charm Sweep password? Enter your email address to receive a password reset link and regain access to your account.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // General site OG image

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        try {
            // Token is usually not required for a forgot password request,
            // but if your ApiHandler or backend needs it for some reason, include it.
            // For a typical forgot password, you usually don't pass a token.
            const response = await ApiHandler(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 'POST', { email }, undefined, dispatch, navigate);
            if (response.data.status.code === 1) {
                toast.success(response.data.status.message || "Password reset link sent successfully! Please check your email.");
                navigate('/login'); // Navigate to login page after sending the link
                setEmail('');
            } else {
                toast.error(response.data.status.message || "Failed to send reset email. Please ensure the email is correct.");
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <>
            <Helmet>
                {/* --- Primary Meta Tags --- */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* --- Open Graph / Facebook --- */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />

                {/* --- Twitter --- */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                {/* Instruct search engines not to index this page, but follow links */}
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <div
                style={{
                    backgroundImage: `url(${SignUpBg})`,
                }}
                className="min-h-screen bg-cover"
            >
                <div className="container mx-auto px-4 md:px-8">
                    <div className="pt-16 md:pt-32">
                        <h1 className="flex font-bold justify-center items-center text-[#FFDD15] text-2xl md:text-4xl underline bg-cover">
                            FORGOT PASSWORD
                        </h1>
                    </div>

                    <div className="flex justify-center mt-8 md:mt-10 pb-10">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-[#0E0E0E] p-4 md:p-6 rounded-xl w-full md:w-2/3 lg:w-1/2"
                        >
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-white text-sm mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-md bg-[#222222] text-white border border-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-yellow-500 text-black py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors duration-200" disabled={loading}>
                                {loading ? 'SENDING...' : 'Send Reset Link'}
                            </button>
                            <div className="flex justify-center items-center mt-4 text-sm text-white">
                                <p>Remember your password?</p>
                                <Link to="/login" className="ml-2 text-yellow-500 hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;