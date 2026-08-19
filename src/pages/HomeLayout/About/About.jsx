import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Hero from '../../../components/Hero';
import AboutBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import AboutusComponent from '../../../components/about/index.jsx'; // Renamed for clarity

const About = () => {
    // Define the canonical URL for this page
    const canonicalUrl = "https://www.luckycharmsweep.com/about"; // Replace with your actual domain
    const pageTitle = "About Lucky Charm Sweep - Your Trusted Online Gaming Platform";
    const pageDescription = "Learn more about Lucky Charm Sweep, your premier destination for online sweepstakes games like Orion Stars, Juwa, and Milky Way. Discover our commitment to security, fast payouts, and 24/7 support.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // A general image for 'About Us'

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
                {/* If you have a Twitter handle, add it here: <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                 {/* --- Optional: Additional Meta Tags --- */}
                 <meta name="keywords" content="about lucky charm sweep, online sweepstakes, trusted casino, orion stars, juwa, milky way, gamevault, secure gaming, online casino information" />
                 <meta name="author" content="Lucky Charm Sweep" />
            </Helmet>

            <Hero title={"About Us"} bgImg={AboutBg} backgroundColor='#290A47' />
            <AboutusComponent /> {/* Changed to avoid naming conflict with the page component */}
        </>
    )
}

export default About;