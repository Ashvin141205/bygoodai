import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import Loading from '../../../components/Common/Loading';
import { useSelector } from 'react-redux';
import CartNotFound from '../../../components/Cart/CartNotFound';
import CartMain from '../../../components/Cart/CartMain';
import Hero from '../../../components/Hero'; // Assuming you might want a Hero banner
import CartBg from '../../../assets/image/blogBg.png'; // Or a specific background for Cart page


const Cart = () => {
    const cartData = useSelector((state) => state.games.cart);
    const [loading, setLoading] = useState(false); // Initially false, can be true if fetching cart related data

    // Define the canonical URL for this page
    // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
    const canonicalUrl = "https://www.luckycharmsweep.com/cart";
    const pageTitle = "Your Shopping Cart - Lucky Charm Sweep";
    const pageDescription = "Review items in your shopping cart at Lucky Charm Sweep. Proceed to checkout to complete your game deposits and access exciting online sweepstakes games.";
    const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // General site OG image or a cart-specific one

    // If cart is empty, render CartNotFound with Helmet tags
    if (!cartData || cartData.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Your Cart is Empty - Lucky Charm Sweep</title>
                    <meta name="description" content="Your shopping cart at Lucky Charm Sweep is currently empty. Explore our games and add items to your cart!" />
                    <link rel="canonical" href={canonicalUrl} /> {/* Still good to have canonical */}
                    <meta property="og:title" content="Your Cart is Empty - Lucky Charm Sweep" />
                    <meta property="og:description" content="Your shopping cart at Lucky Charm Sweep is currently empty. Explore our games and add items to your cart!" />
                    <meta property="og:url" content={canonicalUrl} />
                    <meta property="og:image" content={ogImageUrl} />
                    <meta name="robots" content="noindex, follow" /> {/* Cart pages are often noindexed */}
                </Helmet>
                {/* Optional Hero for CartNotFound page */}
                {/* <Hero title={"Shopping Cart"} bgImg={CartBg} backgroundColor='#290A47' /> */}
                <CartNotFound />
            </>
        );
    }

    // If loading is true (e.g., if fetching additional cart details)
    if (loading) {
        return <Loading />;
    }

    // Main cart view with items
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

                {/* Cart pages are often noindexed as their content is user-specific and temporary */}
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            {/* Optional Hero for Cart page */}
            {/* <Hero title={"Your Shopping Cart"} bgImg={CartBg} backgroundColor='#290A47' /> */}
            <div className='container mx-auto py-12 lgs:pt-40 lgs:pb-12 min-h-[70vh]'>
                <CartMain cartData={cartData} />
            </div>
        </>
    );
}

export default Cart;