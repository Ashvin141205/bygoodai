import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation

import { toast } from "react-toastify";

import ContentSpin from "./ContentSpin";
import WheelComponent from "./WheelComponent";
import SpinnerPopup from "./SpinnerPopup";
import CouponTimer from "./CouponTimer";
import { useSelector } from "react-redux";
import WheelBg from '../../assets/image/blogBg.png'
import Hero from "../../components/Hero";


export default function Wheel() {
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location object

    const { couponCode, expiryTime, discount } = useSelector((state) => state.coupon);
    const { token } = useSelector((state) => state.auth); // Check token for login status
// Desired starting sequence


// Desired starting sequence - Optimized for engagement and profitability
const startSegments = [
    // Mixed distribution with low values - avoid clustering
    "5%", "$1", "5%", "Free Spin", "$1", "Try Again",
    "10%", "$2", "10%", "$2", 
    "15%", "$3", "15%", "$3", "$4", "20%", "$5"
];

// Extended segments list for variety and better house edge
const originalSegments = [
    // Well-distributed mix with predominantly low values
    "5%", "$1", "5%", "$1",
    "10%", "$2", "10%", "$2", "5%", 
    "15%", "$1", "10%", "$2", "15%",
    "$3", "20%", "$3", "20%", "$4",
    "5%", "$1", "25%", "$4", "10%", "$5"
];

// Remove duplicates between startSegments and originalSegments
const remainingSegments = originalSegments.filter(item => !startSegments.includes(item));

// Split startSegments by type
const percentSegments = startSegments.filter(s => s.includes('%'));
const dollarSegments = startSegments.filter(s => s.includes('$'));
const otherSegments = startSegments.filter(s => !s.includes('%') && !s.includes('$'));

// Interleave percent and dollar segments
const mixedSegments = [];
const maxLength = Math.max(percentSegments.length, dollarSegments.length);

for (let i = 0; i < maxLength; i++) {
    if (percentSegments[i]) mixedSegments.push(percentSegments[i]);
    if (dollarSegments[i]) mixedSegments.push(dollarSegments[i]);
}

// Add any "other" segments like "Free Spin" at the end
mixedSegments.push(...otherSegments);

// Finally, add remaining (non-duplicate) segments from the original list
mixedSegments.push(...remainingSegments);

//console.log(mixedSegments);

// Combine fixed start with randomized rest
const segments = [...mixedSegments];
const randomUpDuration = Math.floor(Math.random() * 10) + 5; // between 5–15
const randomDownDuration = Math.floor(Math.random() * 1000) + 500; // between 500–1500
 
    const segColors = [
        "linear-gradient(174.82deg, #B95B16 3.93%, #F97515 49.58%, #B95B16 95.22%)",
        "linear-gradient(185.53deg, #8C0D00 8.99%, #FFABA2 54.02%, #8C0D00 99.04%)",
        "linear-gradient(28.94deg, #007D59 5.77%, #0AC68F 43.78%, #007D59 81.8%)",
        "linear-gradient(244.31deg, #6143B1 18.05%, #AE8FFF 58%, #6143B1 97.94%)",
        "linear-gradient(265.02deg, #B03146 5.77%, #F6435F 52.31%, #B03146 98.84%)",
        "linear-gradient(274.97deg, #9D2724 3.82%, #F14744 51.4%, #9D2724 98.98%)",
        "linear-gradient(298.17deg, #842B56 16.93%, #EA4C99 57.63%, #842B56 98.32%)",
        "linear-gradient(152.31deg, #7D2C8A 4.33%, #D94DF0 44.97%, #7D2C8A 85.61%)",
        "linear-gradient(174.7deg, #3E67B4 0.88%, #528FFF 48.32%, #3E67B4 95.75%)",
        "linear-gradient(184.94deg, #015F71 0.79%, #02B4D7 47.47%, #015F71 94.15%)",
        "linear-gradient(208.33deg, #16763E 3.51%, #24C165 42.87%, #16763E 82.23%)",
        "linear-gradient(241.53deg, #48650D 7.16%, #90CB1B 44.04%, #48650D 83.69%)",
        "linear-gradient(263.95deg, #06524A 1.07%, #0DB8A6 48.57%, #06524A 96.08%)",
        "linear-gradient(273.99deg, #3E40A8 1.03%, #6063F5 48.67%, #3E40A8 96.31%)",
        "linear-gradient(297.95deg, #5F3292 3.44%, #A155F8 43.2%, #5F3292 82.96%)",
        "linear-gradient(150.38deg, #A7731E 16.54%, #F89E0C 57.1%, #A7731E 97.66%)"
    ];

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
// Redirect to login if not authenticated
useEffect(() => {
    if (!token) {

navigate("/login", { state: { from: location.pathname }, replace: true });
    }
}, [token, navigate]);

    const getWheelSize = () => {
        if (windowWidth < 576) return 143; // Small screens
        if (windowWidth >= 576 && windowWidth < 768) return 153; // Medium screens
        return 153; // Large screens
    };

    const onFinished = (winner) => {
    };

    return (
        <>
            {/* <Hero title={"Fortune Wheel"} bgImg={WheelBg} backgroundColor='#290A47' /> */}
            <div>
                {showPopup && (
                    <SpinnerPopup setShowPopup={setShowPopup} />
                )}

                <div className="css-e1wkzd  mb-10 overflow-hidden w-full py-10 ">
                    <div className="container mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-center w-full gap-24 md:gap-0 lg:pt-20">
                            <div id="wheelCircle">
                                <WheelComponent
                                    segments={segments}
                                    segColors={segColors}
                                    winningSegment=""
                                    onFinished={(winner) => onFinished(winner)}
                                    primaryColor="white"
                                    primaryColoraround="white"
                                    contrastColor="#1E1B26"
                                    buttonText="Spin"
                                    isOnlyOnce={false}
                                    // size={190}
                                    size={getWheelSize()}
                                    upDuration={10}
                                    downDuration={500}
                                    setShowPopup={setShowPopup}
                                />
                            </div>
                            <div className="w-full md:w-1/2">
                                {
                                    couponCode || expiryTime || discount?.length > 0 ? (
                                        <>
                                            <CouponTimer />
                                        </>
                                    ) : (
                                        <>
                                            <div className="orange-blink css-1qfio2">
                                                Prizes are just a spin away — get started now!
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <ContentSpin />
                </div>
            </div>
        </>
    );
} 