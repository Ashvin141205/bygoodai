import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Img30 from '../assets/image/30.png';
import treasureBox from '../assets/image/treasureBox.png';
import Bg from '../assets/image/popup-img-X-bg.png';
import Spinner from '../assets/image/spinner.png';
import flamingo from '../assets/image/flamingo.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector


const Popup = ({ isVisible, onClose, images, bgImg }) => {
    const isLoggedIn = useSelector(state => !!state.auth.token); // Check if the user is logged in

    if (!isVisible || isLoggedIn) return null; // Hide the popup if not visible or user is logged in

    const CustomPrevArrow = ({ onClick }) => (
        <div
            className="absolute bottom-4 right-14 z-10 cursor-pointer text-white h-7 flex justify-center items-center w-7 bg-[#962ed1]  rounded-md"
            onClick={onClick}
        >
            {"<"}
        </div>
    );

    const CustomNextArrow = ({ onClick }) => (
        <div
            className="absolute bottom-4 right-4 z-10 cursor-pointer text-white h-7 flex justify-center items-center w-7 bg-[#962ed1] rounded-md"
            onClick={onClick}
        >
            {">"}
        </div>
    );

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 600,
                settings: {
                    arrows: true,
                    autoplay: true,
                    speed: 1000,
                    autoplaySpeed: 5000,
                },
            },
        ],
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white text-2xl md:text-3xl font-bold z-10 bg-transparent"
                >
                    &times;
                </button>
                <div className="rounded-lg shadow-lg relative">
                    <Slider {...settings}>

                    <div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" style={{ backgroundImage: `url(${images[7]})` }}> 
  <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

  <div className="relative z-10 text-center"> 
    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md"> 
      Claim Upto 
    </p>
    <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
      $10 Bonus
    </p>
    <p className="mt-2 text-lg sm:text-xl">Sign up at LuckCharm Sweep and start playing!</p>

    <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
    <Link to="/sign-up"> 
  <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
    Register Now
  </button>
</Link>
    </div>

    {/* New note about multiple accounts */}
    <p className="mt-4 text-xs text-yellow-300">
      One account per person. Multiple accounts are strictly prohibited.
    </p> 
  </div>
</div>


                       

                     {/* Slide 4 - Updated to match the first slide's UI */}
<div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" 
     style={{ backgroundImage: `url(${images[7]})` }}> 
  <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

  <div className="relative z-10 text-center"> 
    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md"> 
      Invite Friends
    </p>
    <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
      Earn Rewards! 
    </p>
    <p className="mt-2 text-lg sm:text-xl">Share your code, get $10 for every friend who deposits!</p>

    <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
      <Link to="/referral/program"> 
        <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
          Get Code
        </button>
      </Link>
    </div>

    <p className="mt-4 text-xs text-yellow-300">
    Plus, earn 10% of their bonus on EVERY deposit they make - FOREVER!
    </p> 
    <p className="mt-2 text-xs text-yellow-300"> 
      Invite 10 friends and earn a total of $100 plus 10 Free Spins! 
    </p>
  </div>
</div>


{/* Slide 7 - Subscription Benefits */}
<div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" style={{ backgroundImage: `url(${images[7]})` }}>
    <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

    <div className="relative z-10 text-center">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md">
            Level Up Your Game!
        </p>
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
            Subscribe Now
        </p>
        <p className="mt-2 text-lg sm:text-xl">Unlock weekly free play bonuses on every platform!</p> 

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/subscription"> 
                <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
                    Subscribe Now
                </button>
            </Link>
        </div>

        <p className="mt-4 text-xs text-yellow-300">
            Plus, enjoy exclusive benefits like higher deposit limits and priority support!
        </p> 
    </div>
</div>


           {/* Slide 3 -  Instant Deposits & Withdrawals */}
<div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" style={{ backgroundImage: `url(${images[7]})` }}>
    <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

    <div className="relative z-10 text-center">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md">
            Instant Deposits
        </p>
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
            & Withdrawals
        </p>
        <p className="mt-2 text-lg sm:text-xl">Get your money in and out FAST!</p> 
        <p className="mt-2 text-lg sm:text-xl">No more waiting around!</p> 

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/deposit"> 
                <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
                    Deposit Now
                </button>
            </Link>
        </div>
    </div>
</div>

{/* Slide 4 - Secure & Reliable */}
<div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" style={{ backgroundImage: `url(${images[7]})` }}>
    <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

    <div className="relative z-10 text-center">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md">
            Secure &
        </p>
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
            Reliable
        </p>
        <p className="mt-2 text-lg sm:text-xl">Play with confidence on trusted platforms.</p>
        <p className="mt-2 text-lg sm:text-xl"> We protect your account and your money. </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/security"> 
                <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
                    Learn More
                </button>
            </Link>
        </div>
    </div>
</div>

{/* Slide 6 - 24/7 Support */}
<div className="relative h-[380px] xs:h-[350px] overflow-hidden flex flex-col items-center justify-center text-white p-4 md:p-5 rounded-lg" style={{ backgroundImage: `url(${images[7]})` }}>
    <div className="absolute inset-0 bg-black opacity-80 rounded-lg"></div> 

    <div className="relative z-10 text-center">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-md">
            Always Here for You
        </p>
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFD700] text-shadow-lg">
            24/7 Support
        </p>
        <p className="mt-2 text-lg sm:text-xl">Get help anytime, day or night.</p>
        <p className="mt-2 text-lg sm:text-xl"> Our friendly support team is always available. </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/support"> 
                <button className="bg-[#FFD700] hover:bg-[#DAA520] text-black font-bold py-2 px-4 rounded-md">
                    Contact Us
                </button>
            </Link>
        </div>
    </div>
</div>

                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Popup;
