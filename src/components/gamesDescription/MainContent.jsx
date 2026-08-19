import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl'; // Helper function for background image

const MainContent = ({ gameDetails }) => {
    const navigate = useNavigate();
    const [isBgLoaded, setIsBgLoaded] = useState(false); // State for background image loading
    const divRef = useRef(null); // Ref for lazy loading the background image

    // Get the background image URL using the helper function
    const backgroundImageUrl = getImageUrl('/assets/image/testimonials.png');

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
        // Print gameDetails in the console to see its attributes
        useEffect(() => {
        }, [gameDetails]); // Run this effect when gameDetails changes
    

    return (
        <div className="container mx-auto flex justify-center items-center">
            <div
                ref={divRef} // Attach ref for lazy loading
                style={{
                    backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none', // Load background image when in view
                }}
                className="flex flex-col items-center border border-[#ffdc156c] rounded-2xl h-auto gap-5 mt-10 md:mb-40"
            >
                <div className="flex justify-center items-center px-5 py-5 flex-col">
                    <div className="flex items-center flex-col md:flex-row justify-center gap-5">
                        <div className="w-[200px] md:w-[25%] flex items-center justify-center">
                            <img
                                src={gameDetails.game_image}
                                alt={gameDetails.game_name}
                                className="w-full object-contain"
                                loading="lazy" // Add lazy loading for the main image
                            />
                        </div>
                        <div className="text-white flex flex-col gap-3 w-full md:w-[70%]">
                            <h1 className="font-bold text-3xl uppercase">{gameDetails.game_name}</h1>
                            {/* Platform Name with improved styling */}
                            {/* Platform Name with adjusted styling */}
                            <div className="w-fit">
                                <span className="bg-[#FFDD15] text-[#0E0E0E] text-sm px-2 py-1 rounded-md font-semibold">
                                Available on: {gameDetails.platform_name}
                                </span>
                            </div>
                            <p className="text-[#CACACA]">
                                {gameDetails.game_description.replace(/\\r\\n/g, ' ')}
                            </p>
                            <div className="mt-3">
                                <button
                                    className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base"
                                    onClick={() => navigate('/deposit')}
                                >
                                    DEPOSIT NOW
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Uncomment if additional images are needed */}
                    {/* 
                    <div className="mt-16 mb-10 flex flex-wrap gap-5">
                        {gameDetails.additional_images && gameDetails.additional_images.map((img, index) => (
                            <img key={index} src={img} className="w-[350px]" alt={`Game Image ${index}`} loading="lazy" />
                        ))}
                    </div> 
                    */}
                </div>
            </div>
        </div>
    );
};

export default MainContent;
