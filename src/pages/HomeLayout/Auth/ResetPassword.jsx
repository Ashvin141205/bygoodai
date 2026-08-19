import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignUpBg from '../../../assets/image/signUpBg.png';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { id } = useParams();
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') {
            setNewPassword(value);
        } else {
            setConfirmPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await ApiHandler(API_ENDPOINTS.AUTH.RESET_PASSWORD, 'POST', {
                token: id,
                newPassword,
                confirmPassword
            }, token, dispatch, navigate);

            if (response.data.status.code === 1) {
                toast.success(response.data.status.message);
                navigate('/login');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(response.data.status.message);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Failed to reset password. Please try again.');
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${SignUpBg})`,
            }}
            className="min-h-screen bg-cover"
        >
            <div className="container mx-auto px-4 md:px-8">
                <div className="pt-16 md:pt-36">
                    <h1 className="flex font-bold justify-center items-center text-[#FFDD15] text-2xl md:text-4xl underline bg-cover">
                        RESET PASSWORD
                    </h1>
                </div>

                <div className="flex justify-center mt-8 md:mt-10 pb-10">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#0E0E0E] p-4 md:p-6 rounded-xl w-full md:w-2/3 lg:w-1/2"
                    >
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-white text-sm mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md bg-[#222222] text-white border border-white/50"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-white text-sm mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md bg-[#222222] text-white border border-white/50"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full mt-4 bg-yellow-500 text-black py-2 rounded-md font-semibold">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
