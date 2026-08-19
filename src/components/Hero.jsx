import React, { useState, useEffect } from 'react';

const Hero = ({ bgImg, title, backgroundColor = "", tagline = "" }) => {
    const [currentBgImg, setCurrentBgImg] = useState('');

    useEffect(() => {
        const updateBackgroundImage = () => {
            const screenWidth = window.innerWidth;
            let transformedUrl = bgImg;

            // Check if the original bgImg already has query parameters to avoid adding ? multiple times
            const separator = bgImg.includes('?') ? '&' : '?';

            if (screenWidth < 640) { // Assuming 640px as the breakpoint for 'sm' from TailwindCSS
                // For mobile, apply w-768,h-400 transformation
                transformedUrl = `${bgImg}${separator}tr=w-768,h-400`;
            } else {
                // For desktop, apply w-1920,h-1080 transformation
                transformedUrl = `${bgImg}${separator}tr=w-1920,h-1080`;
            }
            setCurrentBgImg(transformedUrl);
        };

        // Set initial background image on component mount
        updateBackgroundImage();

        // Add throttled event listener for window resize to update background image
        let resizeTimer;
        const throttledResize = () => {
            if (resizeTimer) return;
            resizeTimer = setTimeout(() => {
                resizeTimer = null;
                updateBackgroundImage();
            }, 150);
        };
        window.addEventListener('resize', throttledResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', throttledResize);
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }
        };
    }, [bgImg]); // Re-run effect if the base bgImg prop changes

    return (
        <div
            className='h-[200px] sm:h-[400px] flex flex-col justify-center items-center text-[#FFDD15] text-4xl bg-cover bg-center relative'
            style={{
                backgroundImage: `url(${currentBgImg})`,
                backgroundColor: backgroundColor || '#0e0e0e'
            }}
        >
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Background color overlay */}
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}></div>
            
            <h1 className='font-semibold relative z-10 text-center px-4 underline'>{title}</h1>
            {tagline && (
                <p className="text-lg sm:text-xl text-white font-semibold relative z-10 text-center px-4 mt-3">
                    {tagline}
                </p>
            )}
        </div>
    );
};

export default Hero;