import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import { useNavigate } from 'react-router-dom';
import HomeComp from '../../../components/home/index';
import HowItWorks from '../../../components/home/HowItWorks';
import PlayingNow from './PlayingNow';
import GamingSEO from '../../../components/Common/GamingSEO';
import HowItWorksButton from '../../../components/Common/HowItWorksButton';
import Spinner from '../../../assets/image/wheel-icon.png';
import SkeletonSection from '../../../components/Common/SkeletonSection';
import HeroFeatures from '../../../components/home/HeroFeatures';
import PlatformVariety from '../../../components/home/PlatformVariety';

// Lazy-load below-the-fold sections to reduce initial bundle and improve smoothness
const Testimonials = lazy(() => import('../../../components/home/Testimonials'));
const JoinToday = lazy(() => import('../../../components/home/JoinToday'));
const OurPlatform = lazy(() => import('../../../components/home/OurPlatform'));
const AboutUs = lazy(() => import('../../../components/home/AboutUs'));

// Assuming Popup is not conditionally rendered based on login state for SEO of its content.
// If it is, and its content is important for SEO, this approach needs SSR/Prerendering.
// For now, we'll assume the main Home content is what we are optimizing for the Home page.
// import Popup from '../../../components/Popup';
// import PopupBg from '../../../assets/image/popup-bg.webp';
// import PopupImg1 from '../../../assets/image/popup-img-1.png';
// import PopupImg2 from '../../../assets/image/popup-img-2.png';
// import PopupImg3 from '../../../assets/image/popup-img-3.webp';
// import PopupImg4 from '../../../assets/image/popup-img-4.webp';
// import PopupImg5 from '../../../assets/image/popup-img-5.webp';
// import PopupImg6 from '../../../assets/image/popup-img-6.webp';
// import PopupImgX from '../../../assets/image/popup-img-X.png';
// import OurGames from '../../../components/home/OurGames'; // Uncomment if you use it

const Home = () => {
  const navigate = useNavigate();
  const [shouldLoadLazy, setShouldLoadLazy] = useState(false);
  const preloadTriggerRef = useRef(null);

  // Preload lazy components when user scrolls near them (for fast scrolling on PC)
  useEffect(() => {
    const trigger = preloadTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadLazy(true);
        }
      },
      { rootMargin: '800px' } // Preload 800px before visible (for fast scrolling)
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  // const images = [PopupImg1, PopupImg2, PopupImg3, PopupImg4, PopupImg5, PopupImg6, PopupImgX];

  // Placeholder for your website's base URL - replace with your actual domain
  const canonicalUrl = "https://www.luckycharmsweep.com"; // Or your specific homepage URL if different
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg"; // Your default OG image for home

  return (
    <>
      <Helmet>
        {/* --- Primary Meta Tags --- */}
        <title>Lucky Charm Sweep - Play Orion Stars, Juwa, Milky Way & More!</title>
        <meta name="description" content="Join Lucky Charm Sweep for instant access to top online sweepstakes games like Orion Stars, Juwa, GameVault, and Milky Way. Enjoy fast payouts, 24/7 support, and exclusive bonuses!" />
        <link rel="canonical" href={canonicalUrl} />

        {/* --- Open Graph / Facebook --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Lucky Charm Sweep - Play Top Online Sweepstakes Games" />
        <meta property="og:description" content="Experience the thrill of Orion Stars, Juwa, GameVault, and more with Lucky Charm Sweep. Secure gaming, instant transactions, and 24/7 customer support." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />

        {/* --- Twitter --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Lucky Charm Sweep - Your Ultimate Online Gaming Destination" />
        <meta name="twitter:description" content="Play the best online sweepstakes games like Orion Stars, Juwa, and Milky Way. Fast, secure, and fun with Lucky Charm Sweep." />
        <meta name="twitter:image" content={ogImageUrl} />
        {/* If you have a Twitter handle, add it here: <meta name="twitter:site" content="@YourTwitterHandle" /> */}

        {/* --- Optional: Additional Meta Tags --- */}
        <meta name="keywords" content="Orion Stars, Juwa, Milky Way, Gamevault, online casino, sweepstakes, slots, instant deposits, instant withdrawals, online gaming, play online games" />
        <meta name="author" content="Lucky Charm Sweep" />

        {/* Performance: resource hints - HTTP/3 optimized */}
        <link rel="preconnect" href="https://d1txq81lrc562k.cloudfront.net" crossOrigin="" />
        <link rel="dns-prefetch" href="//d1txq81lrc562k.cloudfront.net" />
        <link rel="preconnect" href="https://v2.luckycharmsweep.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//v2.luckycharmsweep.com" />
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
        <link rel="dns-prefetch" href="//ik.imagekit.io" />
        <link rel="preconnect" href="https://widgets.trustpilot.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//widgets.trustpilot.com" />

        {/* Keep resource hints lightweight to avoid preload mismatch warnings on other routes */}

      </Helmet>

      <div className='relative'>
        {/* Enhanced Gaming SEO */}
        <GamingSEO 
          gameData={{
            game_name: "Premium Online Gaming",
            game_price: "10.00",
            game_image: "https://d1txq81lrc562k.cloudfront.net/Luck_Charm_BANNER_dollar10.jpg"
          }}
          pageType="homepage"
          includeGameSchema={true}
          includeFAQ={false}
          includeHowTo={false}
        />

        {/* Popup component - consider if its content needs to be SEO-friendly or if it's purely client-side interaction */}
        {/* <Popup images={images} isVisible={...} onClose={...} /> */}

      <div style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
        <HomeComp />
        <PlayingNow />
        {/* HOT GAMES section removed */}
        {/* Preload trigger - starts loading lazy components 800px before visible */}
        <div ref={preloadTriggerRef} style={{ height: 1 }} aria-hidden="true" />
        <Suspense fallback={<SkeletonSection heightClass="h-96" />}> 
          <OurPlatform />
        </Suspense>
        {/*<OurGames /> */}

        {/* Hide HowItWorks on mobile devices - This is a CSS/JS concern, not directly meta tags */}
        <HowItWorks />
        <HeroFeatures />
        <PlatformVariety />
        
        {shouldLoadLazy ? (
          <Suspense fallback={<SkeletonSection heightClass="h-80" />}> 
            <Testimonials />
          </Suspense>
        ) : (
          <SkeletonSection heightClass="h-80" />
        )}
        <div className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="67b1a207db89fc000f858141" data-style-height="52px" data-style-width="100%">
          <a href="https://www.trustpilot.com/review/luckycharmsweep.com" target="_blank" rel="noopener noreferrer">Trustpilot</a>
        </div>
        
        {shouldLoadLazy ? (
          <Suspense fallback={<SkeletonSection heightClass="h-48" />}> 
            <JoinToday />
          </Suspense>
        ) : (
          <SkeletonSection heightClass="h-48" />
        )}
        {shouldLoadLazy ? (
          <Suspense fallback={<SkeletonSection heightClass="h-96" />}> 
            <AboutUs />
          </Suspense>
        ) : (
          <SkeletonSection heightClass="h-96" />
        )}
        <div className='spinner cursor-pointer' onClick={() => {
          navigate('/wheel');
        }}>
          <img src={Spinner} alt="Spin the Wheel for Bonuses" className='w-full' loading='lazy' decoding='async' /> {/* Added alt text */}
        </div>
      </div>
      </div>
    </>
  );
};

export default Home;