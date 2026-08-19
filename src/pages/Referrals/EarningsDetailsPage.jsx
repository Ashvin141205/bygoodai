// src/pages/EarningsDetailsPage.js (Example)
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EarningsDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [earningsData, setEarningsData] = useState([]);

    useEffect(() => {
        // Check if state exists and contains dailyEarnings
        if (location.state && location.state.dailyEarnings) {
            setEarningsData(location.state.dailyEarnings);
        } else {
            // If navigated directly or state is missing, redirect or show error
            console.warn("No earnings data provided in state. Redirecting...");
            navigate('/referral'); // Redirect back to referral page
        }
    }, [location.state, navigate]); // Re-run if state changes or navigate is updated

    return (
        <div className="flex justify-center items-center min-h-screen">
             <div className="w-full max-w-md main-dot-bg p-10 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold text-center mb-6 text-[#e2e8f0]">Daily Earnings Details</h1>

                {earningsData.length > 0 ? (
                     <div className="overflow-hidden rounded-lg border border-[#fff]">
                         <table className="min-w-full ">
                             <thead>
                                 <tr className='bg-[#290A47]'>
                                     <th className="py-3 px-4 text-left font-medium text-white">Date</th>
                                     <th className="py-3 px-4 text-left font-medium text-white">Earning</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {earningsData.map((item, index) => (
                                     <tr key={index} className="border-t bg-[#0E0E0E] border-[#fff]">
                                         <td className="py-3 px-4 text-white">{item.date}</td>
                                         {/* Format earning as currency */}
                                         <td className={`py-3 px-4 font-semibold ${parseFloat(item.daily_earning) >= 0 ? 'text-[#4AFFA9]' : 'text-[#F8924F]'}`}>
                                            ${parseFloat(item.daily_earning).toFixed(2)}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                ) : (
                     <div className="text-center text-gray-400">No daily earning records found.</div>
                )}

                 <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/user/referrals')} // Button to go back
                        className="px-6 py-2 rounded-md bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
                    >
                        Back to Referrals
                    </button>
                </div>

             </div>
        </div>
    );
};

export default EarningsDetailsPage;