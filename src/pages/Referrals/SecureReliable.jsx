import React from 'react';
import { Link } from 'react-router-dom';

const SecureReliable = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#131A2A] p-4 md:p-8 md:py-36"> 
            <div className="flex flex-col md:flex-row items-center md:space-x-8 bg-[#1F2937] p-6 sm:p-8 rounded-lg shadow-lg text-white">

            
                <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                    <img
                        src='https://d1txq81lrc562k.cloudfront.net/Security-1-1200x1015.png'
                        alt="Security safe"
                        className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg"
                    />
                </div>
                {/* Text Section */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Play with Confidence</h2> 
                    <p className="text-lg md:text-xl mb-4">At Lucky Charm Sweep, we prioritize your security and peace of mind. We partner with only the most trusted platforms in the industry, ensuring a safe and reliable gaming experience from start to finish.</p>

                    <p className="text-lg md:text-xl mb-4"> 
                        We take extra measures to protect your account and your money, so you can focus on what matters most - enjoying the games and winning big!
                    </p>

                    <h3 className="text-xl sm:text-2xl font-semibold mb-4">Our Security Measures:</h3>
                    <ul className="list-disc pl-6 mb-4 text-base">
                        <li>Licensed and regulated platforms with a proven track record of fairness and security.</li>
                        <li>Advanced encryption technology to safeguard your personal and financial information.</li>
                        <li>Secure payment gateways for hassle-free and protected deposits and withdrawals.</li>
                        <li>Proactive fraud prevention measures to detect and prevent any suspicious activity.</li>
                        <li>Dedicated 24/7 support team to assist you with any security concerns or questions.</li>
                    </ul>

                    <Link to="/contact-us"> 
                        <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
                            Contact Support
                        </button> 
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SecureReliable;