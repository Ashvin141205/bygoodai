import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Ensure getImageUrl can apply ImageKit transformations dynamically
// You might need to modify or create a wrapper around getImageUrl to handle responsive transformations.
// Example: getImageUrl(path, { width: 768, height: 400 }) or getImageUrl(path, 'mobile')
import { getImageUrl } from '../../../utils/getImageUrl';

const PlayingNow = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false); // State to manage image loading
  const divRef = useRef(null); // Reference to the div element
  const [currentBackgroundImageUrl, setCurrentBackgroundImageUrl] = useState(''); // State for the transformed URL

  // Determine the correct ImageKit URL based on screen size
  useEffect(() => {
    const updateImageUrl = () => {
      const screenWidth = window.innerWidth;
      let transformedPath = '/assets/image/Intro-test.png';
      let width = 1920; // Default for desktop
      let height = 1080; // Default for desktop

      if (screenWidth < 640) { // Matches your 'sm' breakpoint for h-[200px]
        width = 768;  // Adjust width based on typical mobile full width
        height = 400; // Corresponds to h-[200px] actual pixel height with some buffer or aspect ratio
      } else { // For desktop and larger screens (sm:h-[400px])
        width = 1920; // Adjust width based on typical desktop full width
        height = 1080; // Corresponds to sm:h-[400px] actual pixel height with some buffer or aspect ratio
      }

      // Assuming getImageUrl can take width/height or a transformation string
      // You might need to adjust getImageUrl in utils/getImageUrl.js
      // to properly append the ImageKit transformation parameters.
      // Example modification in getImageUrl:
      // export const getImageUrl = (path, options = {}) => {
      //   const baseUrl = 'https://ik.imagekit.io/luckycharm'; // Your ImageKit base URL
      //   let url = `${baseUrl}${path}`;
      //   if (options.width && options.height) {
      //     url += `?tr=w-${options.width},h-${options.height}`;
      //   }
      //   return url;
      // };
      const imageUrl = getImageUrl(transformedPath, { width, height });
      setCurrentBackgroundImageUrl(imageUrl);
    };

    updateImageUrl(); // Set initial URL
    // Throttle resize to prevent excessive reflows on mobile address bar changes
    let resizeTimer;
    const throttledResize = () => {
      if (resizeTimer) return;
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        updateImageUrl();
      }, 150);
    };
    window.addEventListener('resize', throttledResize); // Update on resize

    return () => {
      window.removeEventListener('resize', throttledResize); // Cleanup
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []); // Only runs once to set up event listener, re-renders via state update

  // Use Intersection Observer to implement lazy loading for the background image
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoaded(true); // Load the image when the component is in view
          observer.disconnect(); // Disconnect the observer after loading
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the component is visible
    );

    if (divRef.current) {
      observer.observe(divRef.current); // Observe the div element
    }

    return () => {
      if (divRef.current) {
        observer.disconnect(); // Cleanup the observer on unmount
      }
    };
  }, []);

  const handleClick = () => {
    navigate('/deposit'); // Redirect to the Deposit page
  };

  return (
    <div
      ref={divRef} // Attach the ref to the div element
      className="mt-12 lgs:mt-0 text-yellow-400 py-8 text-center w-full"
      style={{
        // Only apply the background image when it's loaded (due to Intersection Observer)
        backgroundImage: isLoaded ? `url(${currentBackgroundImageUrl})` : 'none',
        backgroundPosition: 'bottom',
        backgroundSize: 'cover',
      }}
    >
      <h1 className="text-xl lgs:text-[27px] font-semibold mb-4">
        Our platform offers instant deposits and rapid withdrawals—no waiting, no stress.
      </h1>
      <button
        className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-[#ffd21e] transition-colors shadow-custom"
        onClick={handleClick} // Attach the click handler
      >
        Start Playing Now
      </button>
    </div>
  );
};

export default PlayingNow;