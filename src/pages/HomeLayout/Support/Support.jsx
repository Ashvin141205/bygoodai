import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Hero from '../../../components/Hero';
import SupportBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import SupportDetails from '../../../components/Support/index'; // Ensure this path is correct

const Support = () => {
  // Define the canonical URL for this page
  // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
  const canonicalUrl = "https://www.luckycharmsweep.com/support"; // Or /contact-us if that's the primary support page
  const pageTitle = "Customer Support - Lucky Charm Sweep";
  const pageDescription = "Need help with Lucky Charm Sweep? Contact our 24/7 customer support team for assistance with your account, games like Orion Stars, Juwa, Milky Way, deposits, or withdrawals.";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image for support or a general site image

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
        <meta name="keywords" content="customer support, lucky charm sweep help, contact us, game support, account help, technical assistance" />
        <meta name="author" content="Lucky Charm Sweep" />
      </Helmet>

      <Hero title={"Support"} bgImg={SupportBg} backgroundColor='#290A47' />
      <SupportDetails />
    </>
  )
}

export default Support;