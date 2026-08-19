import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation

import { Helmet } from 'react-helmet-async';
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Hero from '../../components/Hero'; 
import axiosInstance from "../../utils/AxiosInstance";
import { EXTRA_ENDPOINTS } from '../../config/apiEndpoints';

import SubscriptionBg from '../../assets/image/leaderboardBg.png';
import GenericPageBg from '../../assets/image/blogBg.png';

const SubscriptionPage = () => {
    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();
        const location = useLocation(); // Get the current location object
    const userID = useSelector((state) => state.auth.user?.id);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // --- SEO Configuration ---
    const canonicalUrl = "https://www.luckycharmsweep.com/subscription";
    const pageTitle = "Subscription Plans - Level Up Your Gaming | Lucky Charm Sweep";
    const pageDescription = "Choose a subscription plan at Lucky Charm Sweep to get exclusive benefits like weekend FREE PLAY, higher winnings percentages, access to more platforms, and hot platform alerts.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg";

    const handleSubscriptionChoose = (planId) => {
        if (!token) {
navigate("/login", { state: { from: location.pathname }, replace: true });
            return;
        }
        setSelectedPlanId(planId);
    };

    const initialOptions = {
        "client-id": "AYUkJvWtGijSoY9BofwqvOnxplNVUtTngJp0ZATGlsJfoTL4mdlmw02HNAkkpZcoKB48wuwlCzyrfV_S",
        vault: true,
        intent: "subscription",
        components: "buttons,funding-eligibility",
        "enable-funding": "venmo,card,paylater",
    };

    const handleSubscriptionCapture = async (subscriptionID) => {
        if (!userID) {
            toast.error("User ID not found. Please log in again.");
            return;
        }
        try {
            const response = await axiosInstance.post(EXTRA_ENDPOINTS.CAPTURE_SUBSCRIPTION, {
                subscriptionID,
                userID,
            });

            if (response.data.success) {
                toast.success("Subscription captured successfully! Your benefits are now active.");
                setSelectedPlanId(null); // Reset the view
            } else {
                toast.error(`Failed to capture subscription: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error capturing subscription:", error);
            toast.error("An error occurred while capturing the subscription.");
        }
    };
    
    // --- Data for the Subscription Plans ---
    const plans = [
        {
            name: "Beginner",
            price: "$9.99",
            planId: "P-92V89647419774118M45IIOY",
            features: [
                { text: "FREE PLAY every weekend", included: true },
                { text: "25% of winnings", included: true },
                { text: "Access to 1 platform", included: true },
                { text: "Hot High Winning Platform Alerts", included: false },
            ],
            borderColor: "border-gray-600",
        },
        {
            name: "Pro",
            price: "$29.99",
            planId: "P-2KF235974U2231139M5BCAPI",
            features: [
                { text: "FREE PLAY every weekend", included: true },
                { text: "50% of winnings", included: true },
                { text: "Access to 3 platforms", included: true },
                { text: "Hot High Winning Platform Alerts", included: true },
            ],
            borderColor: "border-yellow-400",
            popular: true,
        },
        {
            name: "Expert",
            price: "$49.99",
            planId: "P-1C368124AF191452TM5BCCBY",
            features: [
                { text: "FREE PLAY every weekend", included: true },
                { text: "75% of winnings", included: true },
                { text: "Access to all 5 platforms", included: true },
                { text: "Hot High Winning Platform Alerts", included: true },
            ],
            borderColor: "border-gray-600",
        },
    ];

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={ogImageUrl} />
            </Helmet>
            <Hero
                title={"SUBSCRIPTION"}
                bgImg={GenericPageBg}
                backgroundColor='#131A2A'
            />
            <PayPalScriptProvider options={initialOptions}>
                <div 
                    className="min-h-screen bg-cover bg-center"
                    style={{ backgroundImage: `url(${SubscriptionBg})` }}
                >
                    <div className="bg-black bg-opacity-60 min-h-screen">
                        <div className="container mx-auto px-4 py-16 sm:py-24">
                            <div className="text-center text-white mb-12">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                    <span className="text-yellow-400">Unlock</span> Your Winning Potential
                                </h1>
                                <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-300">
                                    Choose a subscription to get exclusive weekend Free Play, higher winnings, and real-time alerts on the hottest platforms.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`bg-slate-900 rounded-xl shadow-2xl overflow-hidden border-2 ${plan.borderColor} 
                                            transition-all duration-300 ease-in-out ${plan.popular ? 'lg:scale-110 z-10' : 'lg:hover:scale-105'}`
                                        }
                                    >
                                        {plan.popular && (
                                            <div className="bg-yellow-500 text-center py-1 text-sm font-bold text-black uppercase tracking-wider">Most Popular</div>
                                        )}
                                        <div className="p-8">
                                            <h2 className="text-3xl font-bold text-white text-center">{plan.name}</h2>
                                            <p className="text-4xl font-extrabold text-center my-4 text-yellow-400">{plan.price}<span className="text-base font-medium text-gray-400">/month</span></p>
                                            
                                            <ul className="space-y-4 my-8">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start">
                                                        {feature.included ? (
                                                            <CheckIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                                                        ) : (
                                                            <XMarkIcon className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                                                        )}
                                                        <span className={feature.included ? "text-gray-300" : "text-gray-500 line-through"}>{feature.text}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-8">
                                                {selectedPlanId === plan.planId ? (
                                                    <PayPalButtons
                                                        style={{ layout: "vertical", label: "subscribe", color: "gold", shape: "rect" }}
                                                        createSubscription={(data, actions) => actions.subscription.create({ plan_id: plan.planId })}
                                                        onApprove={(data) => {
                                                            toast.info(`Finalizing your subscription...`);
                                                            return handleSubscriptionCapture(data.subscriptionID);
                                                        }}
                                                        onError={(err) => toast.error(`PayPal Error: ${err.message || 'An unknown error occurred.'}`)}
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => handleSubscriptionChoose(plan.planId)}
                                                        className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg ${
                                                            plan.popular 
                                                            ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                                        }`}
                                                    >
                                                        Choose {plan.name}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- FAQ Section --- */}
                            <div className="mt-20 max-w-4xl mx-auto">
                                <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {faqData.map((faq, index) => (
                                        <Disclosure key={index} as="div" className="bg-slate-800 rounded-lg">
                                            {({ open }) => (
                                                <>
                                                    <Disclosure.Button className="flex w-full justify-between items-center px-6 py-4 text-left text-white focus:outline-none focus-visible:ring focus-visible:ring-yellow-500 focus-visible:ring-opacity-75">
                                                        <span className="font-bold text-lg">{faq.question}</span>
                                                        <ChevronUpIcon className={`${open ? "rotate-180" : ""} h-6 w-6 text-yellow-400 transition-transform duration-200`} />
                                                    </Disclosure.Button>
                                                    <Disclosure.Panel className="px-6 pb-4 text-base text-gray-300">
                                                        {faq.answer}
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PayPalScriptProvider>
        </>
    );
};


const faqData = [
  {
    question: "What are the benefits of subscribing?",
    answer:
      "Subscribing unlocks a world of benefits, including FREE PLAY every weekend, a higher percentage of winnings, access to more platforms, and exclusive features like Hot Platform Alerts.",
  },
  {
    question: "How does the FREE PLAY work?",
    answer:
      "Every Saturday and Sunday, you'll receive free credits to play on your chosen platform(s). You can use these credits to enjoy any of the available games.",
  },
  {
    question: "Can I upgrade my subscription plan?",
    answer: "Yes, you can upgrade your subscription plan anytime from your account settings.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "If you cancel your subscription, you'll lose access to subscription benefits at the end of your billing period.",
  },
  {
    question: "Do you offer any discounts?",
    answer: "Yes! We occasionally offer promotional discounts. Check the platform for details.",
  },
  {
    question: "What does 25% winnings mean?",
    answer:
      "25% winnings means that if you win a game using the Free Play balance provided by the Beginner plan, you will receive only 25% of your total winnings. The remaining 75% will belong to us. For example, if you win $100 using the Free Play balance, you will get $25, and $75 will remain with us. If you play using your own balance, 100% of your winnings will belong to you.",
  },
  {
    question: "What does 50% winnings mean?",
    answer:
      "50% winnings means that if you win a game using the Free Play balance provided by the Pro plan, you will receive 50% of your total winnings. The other 50% will belong to us. For example, if you win $100 using the Free Play balance, you will get $50, and $50 will remain with us. If you play using your own balance, 100% of your winnings will belong to you.",
  },
  {
    question: "What does 75% winnings mean?",
    answer:
      "75% winnings means that if you win a game using the Free Play balance provided by the Expert plan, you will receive 75% of your total winnings. The remaining 25% will belong to us. For example, if you win $100 using the Free Play balance, you will get $75, and $25 will remain with us. If you play using your own balance, 100% of your winnings will belong to you.",
  },
  {
    question: "What are Hot High Winning Platform Alerts?",
    answer:
      "Hot High Winning Platform Alerts provide you with real-time information about platforms that currently have a high winning probability based on our extensive user statistics and winning ratios. With our large user base, we analyze data to recommend platforms where your chances of winning are higher.",
  },
];

export default SubscriptionPage;