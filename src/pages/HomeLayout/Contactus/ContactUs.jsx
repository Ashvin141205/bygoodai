import React from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Hero from '../../../components/Hero';
import ContactBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import ContactUsDetails from '../../../components/Contact/index.js'; // Corrected import path

const ContactUs = () => {
  // Define the canonical URL for this page
  // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
  const canonicalUrl = "https://www.luckycharmsweep.com/contact-us";
  const pageTitle = "Contact Us - Lucky Charm Sweep Support";
  const pageDescription = "Get in touch with Lucky Charm Sweep. Contact our support team for any questions about our games, platforms like Orion Stars, Juwa, Milky Way, account assistance, or feedback.";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Replace with a relevant OG image or a general site image

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
        <meta name="keywords" content="contact lucky charm sweep, customer service, support, help, gaming assistance, online casino contact" />
        <meta name="author" content="Lucky Charm Sweep" />

        {/* --- Structured Data for Contact Page (Optional but Recommended) --- */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Lucky Charm Sweep",
            "description": "Contact information and support channels for Lucky Charm Sweep.",
            "url": canonicalUrl,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            "publisher": { // Re-iterate organization for context on this page
              "@type": "Organization",
              "name": "Lucky Charm Sweep",
              "url": "https://www.luckycharmsweep.com", // Replace with your domain
              "logo": "https://luckycharmsweep.com/static/media/luckcharmsweep.f21c2e25755694222604.png" // Your logo URL
            }
          })}
        </script>
      </Helmet>

      <Hero title={"Contact Us"} bgImg={ContactBg} backgroundColor='#290A47' />
      <ContactUsDetails />
    </>
  )
}

export default ContactUs;