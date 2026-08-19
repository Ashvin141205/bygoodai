import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Privacy from '../assets/image/blogBg.png'; // Ensure this path is correct
import Hero from '../components/Hero';
import MainContent from '../components/PrivacyPolicy/MainContent';

const PrivacyPolicy = () => {
  // Define the canonical URL for this page
  const canonicalUrl = "https://www.luckycharmsweep.com/privacy-policy"; // Replace with your actual domain
  const pageTitle = "Privacy Policy - Lucky Charm Sweep";
  const pageDescription = "Read the Privacy Policy for Lucky Charm Sweep. Learn how we collect, use, maintain, and disclose information from our users to ensure a secure gaming experience.";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image for your privacy policy or a general site image

  return (
    <>
      <Helmet>
        {/* --- Primary Meta Tags --- */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* --- Open Graph / Facebook --- */}
        <meta property="og:type" content="website" /> {/* Could be 'article' if it's content-heavy */}
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
        <meta name="keywords" content="privacy policy, lucky charm sweep, data protection, user data, terms of service, online gaming privacy" />
        <meta name="author" content="Lucky Charm Sweep" />
         {/* Instructs search engines to index this page and follow links on it */}
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Hero bgImg={Privacy} title={"Privacy Policy"} />
      <MainContent />
    </>
  )
}

export default PrivacyPolicy;