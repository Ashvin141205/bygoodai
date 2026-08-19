import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { getImageUrl } from '../../utils/getImageUrl'; // Use the helper function for background image
import Title from '../Title';
import { OurPlatformData } from '../../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ApiHandler } from '../../helper/ApiHandler';
import arrowmove from '../../assets/image/arrowmove.svg';
import { slugify } from '../../utils/slugify'; // Import the slugify function
import { GAME_ENDPOINTS } from '../../config/apiEndpoints';

const OurGames = () => {
    const ourPlatform = useSelector((state) => state.auth.ourPlatform);
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isBgLoaded, setIsBgLoaded] = useState(false); // State for background image loading
    const divRef = useRef(null); // Ref for lazy loading the background image

    // Get the background image URL using the helper function
    const backgroundImageUrl = getImageUrl('/assets/image/leaderboardBg.png');

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const response = await ApiHandler(GAME_ENDPOINTS.LIST, 'POST', { gameID: "", filter: 'latest', limit:'10' }, undefined, dispatch, navigate);
                if (response.data.status.code === "1") {
                    dispatch(OurPlatformData({ ourPlatform: response.data.data }));
                }
            } catch (error) {
                console.error('Error fetching platforms:', error);
            }
        };

        fetchPlatforms();
    }, [dispatch, navigate]);

    // Use IntersectionObserver to implement lazy loading for the background image
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsBgLoaded(true); // Load background image when in view
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => {
            if (divRef.current) {
                observer.disconnect();
            }
        };
    }, []);

    const platformsToShow = ourPlatform.slice(0, 9);

    return (
        <div
            ref={divRef} // Attach ref for lazy loading
            style={{
                backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none', // Load background image when in view
            }}
            className="bg-cover bg-auto min-h-screen"
        >
            <div className="container mx-auto text-white mt-10">
                <Title title="OUR" continueTitle="GAMES" />
                <div className="flex justify-center">
                    <div className="mt-10 grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
                        {platformsToShow.map((platform, index) => (
                            <Link
                                to={`/games/description/${slugify(platform.game_name || '')}`} // Provide a fallback value
                                key={platform.id}
                                className="w-[140px] h-[230px] xs:w-[200px] xs:h-[280px] flex flex-col justify-center items-center gap-3"
                            >
                                <div>
                                    <img
                                        src={platform.game_image}
                                        alt={platform.game_name}
                                        className="w-[180px] h-[180px] border-2 border-[#FFDD15] rounded-2xl object-contain"
                                        loading="lazy" // Add lazy loading for images
                                    />
                                </div>
                                <div className="ourPlatformDropShadow border w-full border-[#FFDD15] px-3 rounded-full py-1 text-sm text-center font-bold sm:line-clamp-1">
                                    {platform.game_name}
                                </div>
                            </Link>
                        ))}

                        {ourPlatform.length > 9 && (
                            <div className="w-[140px] h-[150px] xs:w-[200px] xs:h-[280px] flex flex-col justify-center items-center gap-3">
                                <button
                                    onClick={() => navigate('/games')}
                                    className="w-full h-[180px] flex items-center justify-center bg-[#FFDD15] text-black font-bold text-lg rounded-2xl border-2 border-[#FFDD15] hover:bg-[#f0c015] transition duration-300 py-2 relative overflow-hidden"
                                >
                                    View More
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#ffffff4d',
                                            WebkitMaskImage: `url(${arrowmove})`,
                                            maskImage: `url(${arrowmove})`,
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskSize: 'contain',
                                            maskSize: 'contain',
                                            position: 'absolute',
                                            top: '60%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            animation: 'arrow_moving 3s linear infinite',
                                        }}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurGames;
