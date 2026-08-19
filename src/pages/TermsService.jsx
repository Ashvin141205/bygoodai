import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Terms from '../assets/image/blogBg.png'; // Ensure this path is correct
import Hero from '../components/Hero';
import MainContent from '../components/TermsService/MainContent';

const TermsService = () => {
  // Define the canonical URL for this page
  const canonicalUrl = "https://www.luckycharmsweep.com/terms-of-service"; // Replace with your actual domain
  const pageTitle = "Terms of Service - Lucky Charm Sweep";
  const pageDescription = "Review the Terms of Service for Lucky Charm Sweep. Understand the rules and guidelines for using our online gaming platform and accessing services like Orion Stars, Juwa, and Milky Way.";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image or a general site image

  return (
    <>
      <Helmet>
        {/* --- Primary Meta Tags --- */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* --- Open Graph / Facebook --- */}
        <meta property="og:type" content="website" /> {/* Could be 'article' if content-heavy */}
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
        {/* If you have a Twitter handle: <meta name="twitter:site" content="@YourTwitterHandle" /> */}

        {/* --- Optional: Additional Meta Tags --- */}
        <meta name="keywords" content="terms of service, terms of use, lucky charm sweep, user agreement, online gaming rules, platform guidelines" />
        <meta name="author" content="Lucky Charm Sweep" />
        {/* Instructs search engines to index this page and follow links on it */}
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Hero bgImg={Terms} title={"Terms Of Use"} />
      <MainContent />
    </>
  )
}

export default TermsService;