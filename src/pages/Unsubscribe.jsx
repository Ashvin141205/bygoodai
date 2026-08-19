import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { EXTRA_ENDPOINTS, getApiUrl } from '../config/apiEndpoints';
import { getImageUrl } from '../utils/getImageUrl';
import Hero from '../components/Hero';
import blogBg from '../assets/image/blogBg.png';

const Unsubscribe = () => {
    const [formData, setFormData] = useState({
        email: '',
        answer: ''
    });
    const [mathProblem, setMathProblem] = useState({ problem: '', answer: 0 });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);

    // Generate math problem
    const generateMathProblem = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = Math.random() > 0.5 ? '+' : '-';
        const problem = `${num1} ${operator} ${num2}`;
        const answer = operator === '+' ? num1 + num2 : num1 - num2;
        
        setMathProblem({ problem, answer });
    };

    // Get email from URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        
        if (emailParam && isValidEmail(emailParam)) {
            setFormData(prev => ({ ...prev, email: emailParam }));
        }
        
        generateMathProblem();
    }, []);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate email
        if (!isValidEmail(formData.email)) {
            setMessage('Please enter a valid email address.');
            setMessageType('error');
            setLoading(false);
            return;
        }

        // Validate math answer
        if (parseInt(formData.answer) !== mathProblem.answer) {
            setMessage('Incorrect answer. Please try again.');
            setMessageType('error');
            generateMathProblem(); // Generate new problem
            setFormData(prev => ({ ...prev, answer: '' }));
            setLoading(false);
            return;
        }

        try {
            // Call your API endpoint to unsubscribe
            const response = await fetch(getApiUrl(EXTRA_ENDPOINTS.UNSUBSCRIBE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    answer: formData.answer,
                    mathAnswer: mathProblem.answer
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('You have been successfully unsubscribed from Lucky Charm Sweep emails.');
                setMessageType('success');
                setFormData({ email: '', answer: '' });
                generateMathProblem();
            } else {
                setMessage(result.message || 'An error occurred. Please try again.');
                setMessageType('error');
                if (!result.success && result.message !== 'You have already unsubscribed.') {
                    generateMathProblem();
                    setFormData(prev => ({ ...prev, answer: '' }));
                }
            }
        } catch (error) {
            console.error('Unsubscribe error:', error);
            setMessage('Network error. Please check your connection and try again.');
            setMessageType('error');
            generateMathProblem();
            setFormData(prev => ({ ...prev, answer: '' }));
        }

        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Unsubscribe - Lucky Charm Sweep</title>
                <meta name="description" content="Unsubscribe from Lucky Charm Sweep email communications. Manage your email preferences easily." />
                <link rel="canonical" href="https://www.luckycharmsweep.com/unsubscribe" />
                <meta property="og:title" content="Unsubscribe - Lucky Charm Sweep" />
                <meta property="og:description" content="Unsubscribe from Lucky Charm Sweep email communications." />
                <meta property="og:image" content="https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg" />
                <meta property="og:url" content="https://www.luckycharmsweep.com/unsubscribe" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Unsubscribe - Lucky Charm Sweep" />
                <meta name="twitter:description" content="Unsubscribe from Lucky Charm Sweep email communications." />
                <meta name="twitter:image" content="https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg" />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <Hero bgImg={blogBg} title="Email Unsubscribe" />
            
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 p-8 backdrop-blur-sm relative">
                        {/* Decorative elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ffc21f]/5 to-transparent rounded-xl pointer-events-none"></div>
                        
                        {/* Logo */}
                        <div className="text-center mb-8 relative z-10">
                            <div className="bg-gradient-to-r from-[#ffc21f] to-[#ffb000] rounded-xl p-4 inline-block shadow-lg transform hover:scale-105 transition-transform duration-200">
                                <img
                                    src={getImageUrl('/bg.png')}
                                    alt="Lucky Charm Sweep Logo"
                                    className="h-16 w-auto"
                                />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white text-center mb-6 font-['Oxanium'] relative z-10">
                            Unsubscribe from Our Emails
                        </h2>

                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-center shadow-lg ${
                            messageType === 'success' 
                                ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                                : 'bg-red-900/30 text-red-400 border border-red-700/50'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-['Oxanium']">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffc21f] focus:border-[#ffc21f] transition-all duration-200"
                                placeholder="Enter your email address"
                            />
                        </div>

                        {/* Math Problem */}
                        <div>
                            <label htmlFor="answer" className="block text-sm font-medium text-gray-300 mb-2 font-['Oxanium']">
                                Please solve: <span className="text-[#ffc21f] font-bold">{mathProblem.problem} = ?</span>
                            </label>
                            <input
                                type="number"
                                id="answer"
                                name="answer"
                                value={formData.answer}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffc21f] focus:border-[#ffc21f] transition-all duration-200"
                                placeholder="Enter your answer"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-xl font-bold font-['Oxanium'] text-lg transition-all duration-200 transform ${
                                loading 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-[#ffc21f] to-[#ffb000] text-black hover:from-[#ffb000] hover:to-[#ff9500] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#ffc21f] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {loading ? 'Processing...' : 'Unsubscribe'}
                        </button>
                    </form>

                        {/* Additional Info */}
                        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
                            <p>
                                If you continue to receive emails after unsubscribing, please contact our{' '}
                                <a 
                                    href="/support" 
                                    className="text-[#ffc21f] hover:text-[#ffb000] transition-colors duration-200 font-medium"
                                >
                                    support team
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Unsubscribe;