import React, { useState, useEffect } from 'react';
import { ApiHandler } from '../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { Trophy, Users, DollarSign } from 'lucide-react';
import Loading from '../../components/Common/Loading';

const Leaderboard = () => {
    const [leaderboards, setLeaderboards] = useState({ top_referrers: [], top_earners: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const response = await ApiHandler(API_ENDPOINTS.BONUS.GET_LEADERBOARD, 'GET');
                if (response.data.status.code === 1) {
                    setLeaderboards(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboards", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    const LeaderboardList = ({ title, data, dataKey, icon, unit }) => (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10 w-full">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                {icon} {title}
            </h3>
            {data && data.length > 0 ? (
                <ul className="space-y-3">
                    {data.map((item, index) => (
                        <li key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-md">
                            <div className="flex items-center">
                                <span className={`font-bold text-lg w-8 ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    {index + 1}
                                </span>
                                <span className="text-white font-semibold">{item.username}</span>
                            </div>
                            <span className="font-bold text-green-400">
                                {unit === '$' && '$'}{item[dataKey]}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No data available for this week yet.</p>
            )}
        </div>
    );

    if (loading) {
        return <div className="flex justify-center my-10"><Loading /></div>;
    }

    return (
        <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-center text-white mb-8 flex items-center justify-center gap-3">
                <Trophy size={32} className="text-yellow-400" /> Weekly Leaderboards
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
                <LeaderboardList
                    title="Top Referrers"
                    data={leaderboards.top_referrers}
                    dataKey="referral_count"
                    icon={<Users size={24} />}
                />
                <LeaderboardList
                    title="Top Earners"
                    data={leaderboards.top_earners}
                    dataKey="total_earnings"
                    icon={<DollarSign size={24} />}
                    unit="$"
                />
            </div>
        </div>
    );
};

export default Leaderboard;