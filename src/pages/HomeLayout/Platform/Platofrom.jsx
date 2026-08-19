import React, { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import BlogBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import Hero from '../../../components/Hero';
import SkeletonSection from '../../../components/Common/SkeletonSection';
// Removed useParams since it's not used directly in this specific component for meta tags
// import { useParams } from 'react-router-dom';

const MainContent = lazy(() => import("./MainContent")); // Lazy-load main list

const Platform = () => {
    // const { id } = useParams(); // 'id' from useParams is not directly used for meta tags here
                                // Meta tags for a general platform listing page.
                                // Specific platform details pages (/platform/description/:platform_slug) handle their own dynamic metas.

    // Define the canonical URL for this page
    // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
    const canonicalUrl = "https://www.luckycharmsweep.com/platform";
    const pageTitle = "Explore Gaming Platforms | Lucky Charm Sweep";
    const pageDescription = "Discover a wide variety of online gaming platforms at Lucky Charm Sweep. Find your favorite games from top providers like Orion Stars, Juwa, Milky Way, and more.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // A general image for your platforms page

    return (
        <>
            <Helmet>
                {/* --- Primary Meta Tags --- */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* --- Open Graph / Facebook --- */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />

                {/* --- Twitter --- */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                {/* --- Optional: Additional Meta Tags --- */}
                <meta name="keywords" content="gaming platforms, online casino platforms, orion stars, juwa, milky way, gamevault, sweepstakes platforms, lucky charm sweep" />
                <meta name="author" content="Lucky Charm Sweep" />
            </Helmet>

                        <Hero bgImg={BlogBg} title={"Gaming Platforms"} /> {/* Updated Hero title for clarity */}
                        <Suspense fallback={<div className='container mx-auto px-4 my-8'><SkeletonSection heightClass='h-80' /></div>}>
                            <MainContent /> {/* The MainContent component will list the platforms */}
                        </Suspense>
        </>
    )
}

export default Platform;