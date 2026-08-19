import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCouponCode } from "../../redux/slice/couponSlice";
import { useNavigate } from "react-router-dom";
import congrats from "../../assets/congrats.png"
import { toast } from "react-toastify";

const CouponTimer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { couponCode, expiryTime, discount } = useSelector((state) => state.coupon);

    const [timeLeft, setTimeLeft] = useState(expiryTime - Date.now());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!expiryTime) return;

        const intervalId = setInterval(() => {
            const timeRemaining = expiryTime - Date.now();
            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                dispatch(clearCouponCode());
            } else {
                setTimeLeft(timeRemaining);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [expiryTime, dispatch]);

    if (!couponCode) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const copyCouponCode = () => {
        navigator.clipboard.writeText(couponCode);
        toast.info('Coupon Code copied to clipboard!', {
            position: 'top-center',
            autoClose: 2000, // Auto close after 5 seconds
            theme: 'dark'
        });
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center relative">
                <div className="congrats px-16 pt-10 pb-6 w-fit flex flex-col justify-center items-center">
                    <div className="font-bold text-2xl md:text-3xl text-[#FFFFFF] text-center">
                        You Won {discount ? `${discount}%` : ''} Coupon Code
                    </div>
                    <div className="font-semibold text-base md:text-xl text-[#FFFFFF] text-center py-2">
                        Your Coupon Code
                    </div>
                    <button
                        onClick={copyCouponCode}
                        className="font-medium text-lg text-[#FFFFFF] bg-[#4A068B] flex justify-center items-center py-2 px-8 w-fit rounded-md">
                        {couponCode}
                    </button>
                    <div className="font-semibold text-base md:text-xl text-[#FFFFFF] text-center pt-4">
                        Your Expiretion Time : {hours}h {minutes}m {seconds}s
                    </div>
                    <button
                        className='bg-[#FFDD15] text-[#0E0E0E] flex justify-center items-center gap-2 px-5 font-semibold py-2 rounded-md text-center w-auto mt-4'
                        onClick={() => navigate('/deposit')}
                    >Deposit Now
                    </button>
                </div>
                <img src={congrats} alt="winner congrats" className="absolute -top-20" width={200} />
            </div>
        </>
    );
};

export default CouponTimer;
