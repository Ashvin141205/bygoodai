import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import GamesDescriptionBg from '../../../assets/image/gamesDescriptionBg.png'; // Ensure path is correct
import MainContent from '../../../components/gamesDescription/MainContent';
import Hero from '../../../components/Hero';
import Loading from '../../../components/Common/Loading';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';
import { slugify } from '../../../utils/slugify'; // Assuming you have this utility

const DiamondShotGame = () => {
    const { game_slug } = useParams();
    const [gameDetails, setGameDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = useSelector((state) => state.auth.token); // Added token for API calls if needed
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Construct the canonical URL dynamically
    // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
    const canonicalUrl = game_slug ? `https://www.luckycharmsweep.com/games/description/${game_slug}` : "https://www.luckycharmsweep.com/games";

    useEffect(() => {
        const fetchGameDetails = async () => {
            if (!game_slug) {
                console.error("Game slug is undefined, cannot fetch details.");
                setLoading(false);
                navigate('/404'); // Or to a generic games listing page
                return;
            }
            setLoading(true); // Ensure loading is true at the start of fetch
            try {
                const response = await ApiHandler(API_ENDPOINTS.GAME.LIST, 'POST', { game_slug: game_slug }, token, dispatch, navigate);

                if (response.data.status.code === '1' && response.data.data.length > 0) {
                    const details = response.data.data[0];
                    // Basic check for essential details before setting
                    if (details.game_name && details.game_description) {
                        setGameDetails(details);
                    } else {
                         console.warn('Game details fetched but missing essential fields (name or description) for slug:', game_slug);
                         // Decide if you want to navigate away or show a partial page
                         // For now, we'll allow it to render with what it has, Helmet will use defaults.
                         setGameDetails(details); // Still set details to allow Hero title to show
                    }
                } else {
                    console.error('Game not found for slug:', game_slug);
                    setGameDetails(null);
                    navigate('/404'); // Navigate to 404 if game not found
                }
            } catch (error) {
                console.error('Failed to fetch game details:', error);
                setGameDetails(null); // Set to null on error
                // Optionally navigate to an error page or show an error message
            } finally {
                setLoading(false);
            }
        };

        fetchGameDetails();
    }, [game_slug, dispatch, navigate, token]);

    if (loading) {
        return <Loading />;
    }

    // If gameDetails is null after loading and not navigating away (e.g. due to missing fields but not a 404)
    // This check can be made more robust based on your requirements
    if (!gameDetails && !loading) {
        // This case might have already been handled by navigate('/404') in useEffect
        // but as a fallback:
        return (
            <>
                <Helmet>
                    <title>Game Not Found - Lucky Charm Sweep</title>
                    <meta name="description" content="The game you are looking for could not be found on Lucky Charm Sweep." />
                </Helmet>
                <Hero title={"Game Not Found"} bgImg={GamesDescriptionBg} backgroundColor='#290A47' />
                <div className="text-center text-white py-10">
                    <h1>Game not found</h1>
                    <p>Sorry, the game you're looking for does not exist or may have been removed.</p>
                </div>
            </>
        );
    }

    // Prepare meta description (truncate if too long)
    const metaDescription = gameDetails?.game_description
        ? gameDetails.game_description.substring(0, 160) + (gameDetails.game_description.length > 160 ? '...' : '')
        : `Learn more about ${gameDetails?.game_name || 'this game'} on Lucky Charm Sweep. Enjoy exciting gameplay and chances to win!`;

    const pageTitle = gameDetails?.game_name ? `${gameDetails.game_name} - Lucky Charm Sweep` : "Game Details - Lucky Charm Sweep";
    const ogImageUrl = gameDetails?.game_image || "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Fallback OG image

    return (
        <>
            <Helmet>
                {/* --- Primary Meta Tags --- */}
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* --- Open Graph / Facebook --- */}
                <meta property="og:type" content="article" /> {/* Could be 'product' or other relevant type */}
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />
                {gameDetails?.platform_name && <meta property="article:section" content={gameDetails.platform_name} />}


                {/* --- Twitter --- */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                {/* --- Optional: Additional Meta Tags --- */}
                <meta name="keywords" content={`${gameDetails?.game_name || ''}, ${gameDetails?.platform_name || ''}, online game, sweepstakes, casino game, Lucky Charm Sweep`} />
            </Helmet>

            <Hero title={gameDetails?.game_name || "Game Details"} bgImg={GamesDescriptionBg} backgroundColor='#290A47' />
            {gameDetails && <MainContent gameDetails={gameDetails} />}
        </>
    );
};

export default DiamondShotGame;