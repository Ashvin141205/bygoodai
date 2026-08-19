import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InfoIcon } from '../../../utils/Icons'
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';


const WithdrawalsView = () => {
    const { id } = useParams();
    const [withdrawalData, setWithdrawalData] = useState(null);
    const [withdraw_details, setWithdraw_details] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejection_note, setRejection_note] = useState('');
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiHandler(API_ENDPOINTS.WITHDRAWAL.GET_DETAILS, 'POST', { id }, token, dispatch, navigate);
                setWithdrawalData(response.data.data);
                setRejection_note(response.data.data.rejection_note);
                setWithdraw_details(response.data.data.withdraw_details)
            } catch (err) {
                setWithdrawalData(null);
                setRejection_note(null);
                setWithdraw_details(null);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!withdrawalData) {
        return <div>No data found.</div>;
    }

    // Destructure the relevant data
    const { created_date, payment_id, payment_status } = withdrawalData;
    const { amount, crypto_user_id, email, game_id, game_name, game_username, phone, withdrawal_method } = withdraw_details;

    return (
        <div className="main-dot-bg text-white p-4 md:p-8 rounded-lg shadow-lg w-full min-h-screen mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Withdrawal Request</h1>
            {
                rejection_note && (
                    <div className="text-white p-4 rounded mb-6 relative py-6 md:py-8"
                        style={{ backgroundColor: "#ff5f66" }}
                    >
                        <InfoIcon className="absolute top-2 left-2" />

                        <p className="font-bold mt-2">
                            {rejection_note}
                        </p>
                    </div>
                )
            }
            <div className="bg-[#2d3748] p-4 md:p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {
                        payment_id && (
                            <div>
                                <p className="text-gray-400">Payment ID</p>
                                <p className="font-medium">#{payment_id}</p>
                            </div>
                        )
                    }
                    {
                        crypto_user_id && (
                            <div>
                                <p className="text-gray-400">Crypto User Id</p>
                                <p className="font-medium">#{crypto_user_id}</p>
                            </div>
                        )
                    }
                    {
                        created_date && (
                            <div>
                                <p className="text-gray-400">Date Created</p>
                                <p className="font-medium">{created_date}</p>
                            </div>
                        )
                    }
                    {
                        email && (
                            <div>
                                <p className="text-gray-400">Email</p>
                                <p className="font-medium">{email}</p>
                            </div>
                        )
                    }
                    {
                        phone && (
                            <div>
                                <p className="text-gray-400">Phone</p>
                                <p className="font-medium">{phone}</p>
                            </div>
                        )
                    }
                    {
                        game_id && (
                            <div>
                                <p className="text-gray-400">Game ID</p>
                                <p className="font-medium">{game_id}</p>
                            </div>
                        )
                    }
                    {
                        game_name && (
                            <div>
                                <p className="text-gray-400">Game Name</p>
                                <p className="font-medium">{game_name}</p>
                            </div>
                        )
                    }
                    {
                        amount && (
                            <div>
                                <p className="text-gray-400">Amount</p>
                                <p className="font-medium">${amount}</p>
                            </div>
                        )
                    }
                    {
                        withdrawal_method && (
                            <div>
                                <p className="text-gray-400">Payment Type</p>
                                <p className="font-medium">{withdrawal_method}</p>
                            </div>
                        )
                    }
                    {
                        payment_status && (
                            <div className="text-gray-400">
                                <p className="font-medium">Payment Status</p>
                                {payment_status === "0" ? (
                                    <button
                                        className="text-[#F8924F] py-1 px-4 rounded-md main-border"
                                        style={{ backgroundColor: 'rgba(248, 146, 79, 0.2)' }}
                                    >
                                        Pending
                                    </button>
                                ) : payment_status === "1" ? (
                                    <button
                                        className="text-[#4AFFA9] py-1 px-4 rounded-md main-border"
                                        style={{ backgroundColor: 'rgba(74, 255, 169, 0.2)' }}
                                    >
                                        Approve
                                    </button>
                                ) : payment_status === "2" ? (
                                    <button
                                        className="text-[#FF2B62] py-1 px-4 rounded-md main-border"
                                        style={{ backgroundColor: 'rgba(255, 43, 98, 0.2)' }}
                                    >
                                        Cancelled
                                    </button>
                                ) : payment_status === "3" ? (
                                    <button
                                        className="text-[#FF2B62] py-1 px-4 rounded-md main-border"
                                        style={{ backgroundColor: 'rgba(255, 43, 98, 0.2)' }}
                                    >
                                        Expired
                                    </button>
                                ) : (<></>)}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default WithdrawalsView;
