import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import CheckoutNotFound from '../../../components/Checkout/CheckoutNotFound';
import CheckOutMain from '../../../components/Checkout/CheckOutMain';
import { useSelector } from 'react-redux';
import Loading from '../../../components/Common/Loading';
import Hero from '../../../components/Hero'; // Assuming you might want a Hero banner
import CheckoutBg from '../../../assets/image/blogBg.png'; // Or a specific background for Checkout page

const CheckOut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartData = useSelector((state) => state.games.cart);
  const [loading, setLoading] = useState(false); // Can be used if fetching additional checkout data
  const userData = useSelector((state) => state.auth.user);

  // Define the canonical URL for this page
  // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
  const canonicalUrl = "https://www.luckycharmsweep.com/checkout";
  const pageTitle = "Checkout - Complete Your Order | Lucky Charm Sweep";
  const pageDescription = "Review your order and complete your game deposits at Lucky Charm Sweep. Securely pay for your selected games and get ready to play and win!";
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // General site OG image or a checkout-specific one

  useEffect(() => {
    if (!location.state?.isCheckoutAllowed) {
      // If no state or invalid state, redirect to the cart page
      navigate('/cart');
    } else {
      // This logic is to prevent re-accessing checkout via browser history manipulation
      // once checkout has been visited through the proper flow.
      const currentState = window.history.state;
      if (currentState && currentState.usr && currentState.usr.isCheckoutAllowed) {
        const updatedState = {
          ...currentState,
          usr: {
            ...currentState.usr,
            isCheckoutAllowed: false // Invalidate the flag after first load
          }
        };
        window.history.replaceState(updatedState, document.title);
      }
    }
  }, [location, navigate]);

  // Redirect to cart if checkout is allowed but cart becomes empty.
  useEffect(() => {
    if ((!cartData || cartData.length === 0) && location.state?.isCheckoutAllowed) {
      // If checkout was allowed but cart became empty (e.g. another tab), redirect to cart
      navigate('/cart');
    }
  }, [cartData, navigate, location.state]);

  // If cart is empty and checkout was not specifically allowed (or token is missing), show CheckoutNotFound
  if ((!cartData || cartData.length === 0)) {
    return (
        <>
            <Helmet>
                <title>Checkout Empty - Lucky Charm Sweep</title>
                <meta name="description" content="Your checkout is empty. Please add items to your cart before proceeding to checkout at Lucky Charm Sweep." />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="Checkout Empty - Lucky Charm Sweep" />
                <meta property="og:description" content="Your checkout is empty. Add games to your cart to proceed." />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImageUrl} />
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            {/* <Hero title={"Checkout"} bgImg={CheckoutBg} backgroundColor='#290A47' /> */}
            <CheckoutNotFound />
        </>
    );
  }

  // If there's a specific loading state for this page (e.g. fetching payment methods)
  if (loading) {
    return <Loading />;
  }

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

        {/* Checkout pages are typically noindexed */}
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Optional Hero for Checkout page */}
      {/* <Hero title={"Secure Checkout"} bgImg={CheckoutBg} backgroundColor='#290A47' /> */}
      <div className='container mx-auto py-12 lgs:pt-40 lgs:pb-12 min-h-[70vh] px-0'>
        <CheckOutMain cartData={cartData} userData={userData}/>
      </div>
    </>
  )
}

export default CheckOut;