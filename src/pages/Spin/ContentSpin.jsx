import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
// Updated import for Headless UI Disclosure components
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ApiHandler } from '../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getImageUrl } from '../../utils/getImageUrl';
import WheelBg from '../../assets/image/blogBg.png';

const ITEMS_PER_PAGE = 9;

const ContentSpin = () => {
  // const [openDropdown, setOpenDropdown] = useState(null); // No longer needed as Disclosure handles its state
  const [recentWinners, setRecentWinners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const divRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const token = useSelector((state) => state.auth.token); // Uncomment if API needs token

  const canonicalUrl = "https://www.luckycharmsweep.com/wheel"; // Replace with your actual domain
  const pageTitle = "Fortune Wheel - Spin & Win Rewards | Lucky Charm Sweep";
  const pageDescription = "Spin the Lucky Charm Sweep Fortune Wheel daily! Win coupon codes, free plays, and other exciting rewards to enhance your online gaming experience.";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image

  useEffect(() => {
    const fetchRecentWinners = async () => {
      setLoading(true);
      try {
        const response = await ApiHandler(
          API_ENDPOINTS.SPIN.GET_RECENT_WINNERS,
          'POST',
          undefined,
          undefined, // Pass token here if this endpoint is protected
          dispatch,
          navigate
        );
        if (response.data && response.data.data) {
          setRecentWinners(response.data.data);
        } else {
          setRecentWinners([]);
          console.warn('No recent winners data received or in unexpected format.');
        }
      } catch (error) {
        console.error('Error fetching recent winners:', error);
        setRecentWinners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentWinners();
  }, [dispatch, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsBgLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentDivRef = divRef.current;
    if (currentDivRef) {
      observer.observe(currentDivRef);
    }

    return () => {
      if (currentDivRef) {
        observer.unobserve(currentDivRef);
      }
    };
  }, []);


  const backgroundImageUrl = getImageUrl('/assets/image/leaderboardBg.png');

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentWinners = recentWinners.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(recentWinners.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="keywords" content="fortune wheel, spin and win, lucky charm sweep, daily rewards, free plays, coupon codes, online gaming bonus" />
      </Helmet>


      <div className="pt-5 pb-10">
        <div className="text-white container mx-auto gap-8 flex flex-col lg:flex-row">
          <div className="flex-1 px-4 lg:px-0">
            <div className="text-[15px] lg:text-[17px] leading-relaxed space-y-4">
              <p>Get ready for the adventure of your life as you spin the wheel of fortune and win immense wealth! Lucky Charm Sweep Fortune Wheel allows you to enhance your gaming experience.</p>
              <p>All you have to do is spin the Fortune Wheel daily and get incredible rewards, from coupon codes to free plays. Here's everything you need to know about Fortune Wheel.</p>
            </div>

            <div className="mt-6 text-[15px] lg:text-[17px] leading-relaxed space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-[#FFDD15]">Sign in Now, Spin the Wheel, and Win!</h2>
              <p>Sign in right now, spin the wheel, and win incredible rewards! Whether you win coupon codes or free plays, you can play free games and win real money every day. So don’t let this opportunity pass you by.</p>
              <p>Claim your rewards and start winning!</p>
              <p>Fortunes await you as you spin the wheel!</p>
            </div>
          </div>

          <div className="flex-1 px-4 lg:px-0">
            <div className="w-full mx-auto space-y-3">
              {/* Updated Disclosure usage */}
              <Disclosure as="div" className="mt-2">
                {({ open }) => (
                  <>
                    <DisclosureButton
                      className="bg-[#290A47] hover:bg-opacity-80 border border-[#EC29FC] text-white font-bold py-3 px-4 rounded-lg w-full flex justify-between items-center text-left transition-colors duration-200"
                    >
                      <span>How to Enter the Fortune Wheel Campaign</span>
                      <span className={`${open ? 'rotate-180' : ''} transition-transform duration-300 text-[#EC29FC]`}>▼</span>
                    </DisclosureButton>
                    <DisclosurePanel
                      className={`mt-2 bg-[#222831] text-gray-300 rounded-lg shadow-md p-4 text-sm transition-all duration-300 ease-out overflow-hidden ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        It’s very easy to enter the Fortune Wheel campaign. When you log in to Lucky Charm Sweep, you’ll see a spinning wheel icon usually at the bottom of your screen, whether on your PC, tablet, or smartphone. Click on it to navigate to the Fortune Wheel page. Once there, simply click the "Spin" button at the center of the wheel. Remember, eligibility rules may apply, such as a minimum deposit within the last 7 days.
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>

              <Disclosure as="div" className="mt-2">
                {({ open }) => (
                  <>
                    <DisclosureButton
                      className="bg-[#290A47] hover:bg-opacity-80 border border-[#EC29FC] text-white font-bold py-3 px-4 rounded-lg w-full flex justify-between items-center text-left transition-colors duration-200"
                    >
                      <span>What Can I Win?</span>
                      <span className={`${open ? 'rotate-180' : ''} transition-transform duration-300 text-[#EC29FC]`}>▼</span>
                    </DisclosureButton>
                    <DisclosurePanel
                      className={`mt-2 bg-[#222831] text-gray-300 rounded-lg shadow-md p-4 text-sm transition-all duration-300 ease-out overflow-hidden ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        The Fortune Wheel offers a variety of exciting prizes! You can win direct cash bonuses added to your account, valuable coupon codes for discounts on deposits, or even free spins to try your luck again. Each segment on the wheel represents a different potential reward.
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
              
            </div>
          </div>
        </div>

        <div
          ref={divRef}
          style={{
            backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="mt-10 py-10"
        >
          <h2 className="text-center text-2xl text-[#FFDD15] font-bold uppercase mb-8">
            Recent Winners
          </h2>

          {loading && recentWinners.length === 0 ? (
            <div className="text-center text-white">Loading recent winners...</div>
          ) : !loading && recentWinners.length === 0 ? (
            <div className="text-center text-white">No recent winners to display yet. Be the first!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-12 mt-10 container mx-auto px-4">
              {currentWinners.map((winner, index) => (
                <div
                  key={winner.id || index}
                  className="bg-[#222222] border border-gray-700 rounded-lg p-5 flex flex-col items-center relative min-h-[150px] justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <img
                    src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(winner.first_name || 'default')}`}
                    alt={`${winner.first_name || 'Winner'} ${winner.last_name || ''}`}
                    className="rounded-full w-20 h-20 mb-3 absolute -top-10 border-4 border-[#FFDD15]"
                    loading="lazy"
                  />
                  <span className="text-lg font-semibold text-white mb-1 mt-8 text-center line-clamp-1">
                    {winner.first_name || 'Anonymous'} {winner.last_name || ''}
                  </span>
                  <span className="text-[#26E9B1] text-md mb-1 text-center line-clamp-1">
                    Won: {winner.title || 'a prize'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {moment(winner.created_date).fromNow()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-10 space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    currentPage === index + 1
                      ? 'bg-[#EC29FC] text-white shadow-md'
                      : 'bg-[#290A47] text-white hover:bg-opacity-80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentSpin;