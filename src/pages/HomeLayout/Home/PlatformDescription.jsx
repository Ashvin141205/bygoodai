import React, { useEffect, useState, Suspense, lazy, memo } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Hero from '../../../components/Hero';
import GamesDescriptionBg from '../../../assets/image/gamesDescriptionBg.png'; // Ensure path is correct
import MilkyWayCasino from '../../../components/gamesDescription/MilkyWayCasino';
import Juwa777Casino from "../../../components/gamesDescription/Juwa777Casino";
import FireKirin from "../../../components/gamesDescription/FireKirin";
import SkeletonSection from '../../../components/Common/SkeletonSection';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import Loading from '../../../components/Common/Loading';

const MainContent = lazy(() => import('../../../components/gamesDescription/MainContent'));
// import { slugify } from '../../../utils/slugify'; // Assuming you might need it for canonical or keywords

const PlatformDescription = () => {
    const { platform_slug } = useParams();
    const [platformDetails, setPlatformDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const canonicalUrl = platform_slug ? `https://www.luckycharmsweep.com/platform/description/${platform_slug}` : "https://www.luckycharmsweep.com/platform";

    useEffect(() => {
        if (!platform_slug) {
            console.error('Platform slug is undefined');
            setLoading(false);
            navigate('/404');
            return;
        }

        const fetchPlatformDetails = async () => {
            setLoading(true);
            try {
                const response = await ApiHandler(
                    API_ENDPOINTS.GAME.LIST,
                    'POST',
                    { platform_slug: platform_slug, is_platform: "1" },
                    token,
                    dispatch,
                    navigate
                );
                const platformData = response.data?.data?.[0];
                if (platformData) {
                    if (platformData.platform_name && platformData.game_description) {
                        setPlatformDetails(platformData);
                    } else if (platformData.platform_name && !platformData.game_description && platform_slug !== 'milky-way' && platform_slug !== 'juwa' && platform_slug !== 'fire-kirin') {
                        console.warn('Platform description is empty for:', platform_slug, 'and not a special case. Redirecting.');
                        navigate('/deposit');
                    } else {
                        setPlatformDetails(platformData);
                         console.warn('Platform details fetched but missing description for special case or other issue:', platform_slug);
                    }
                } else {
                    console.error('Platform details not found for platform slug:', platform_slug);
                    setPlatformDetails(null);
                    navigate('/404');
                }
            } catch (error) {
                console.error('Failed to fetch platform details:', error);
                setPlatformDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPlatformDetails();
    }, [platform_slug, dispatch, navigate, token]);

    if (loading) {
        return <Loading />;
    }

    if (!platformDetails && !loading) {
        return (
             <>
                <Helmet>
                    <title>Platform Not Found - Lucky Charm Sweep</title>
                    <meta name="description" content="The platform you are looking for could not be found on Lucky Charm Sweep." />
                </Helmet>
                <Hero title={"Platform Not Found"} bgImg={GamesDescriptionBg} backgroundColor='#290A47' />
                <div className="text-center text-white py-10">
                    <h1>Platform not found</h1>
                    <p>Sorry, the platform you're looking for does not exist or may have been removed.</p>
                </div>
            </>
        );
    }

    const metaDescription = platformDetails?.game_description
        ? platformDetails.game_description.substring(0, 160) + (platformDetails.game_description.length > 160 ? '...' : '')
        : `Explore the ${platformDetails?.platform_name || 'gaming platform'} on Lucky Charm Sweep. Discover exciting games, features, and more!`;

    const pageTitle = platformDetails?.platform_name ? `About ${platformDetails.platform_name} Platform - Lucky Charm Sweep` : "Platform Details - Lucky Charm Sweep";
    const ogImageUrl = platformDetails?.game_image || platformDetails?.image || "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg";


    const renderPlatformSpecificComponent = () => {
        switch (platform_slug) {
            case 'milky-way':
                return <MilkyWayCasino gameDetails={platformDetails} />;
            case "juwa":
                return <Juwa777Casino gameDetails={platformDetails} />;
            case "fire-kirin":
                return <FireKirin gameDetails={platformDetails} />;
            default:
                if (platformDetails?.game_description) {
                    // Pass platformDetails as 'gameDetails' prop to MainContent
                    // Ensure MainContent can handle this data structure or adapt it
                                        return (
                                            <Suspense fallback={<div className='container mx-auto px-4 my-8'><SkeletonSection heightClass='h-64' /></div>}>
                                                <MainContent gameDetails={platformDetails} />
                                            </Suspense>
                                        );
                }
                navigate('/deposit');
                return <p className="text-white text-center p-4">Detailed information for this platform is being updated. Please check our deposit page for available games.</p>;
        }
    };

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:site_name" content="Lucky Charm Sweep" />
                <meta property="og:locale" content="en_US" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImageUrl} />
                <meta name="keywords" content={`${platformDetails?.platform_name || ''}, online gaming platform, ${platform_slug}, sweepstakes, casino, Lucky Charm Sweep`} />
            </Helmet>

            <Hero
                title={platformDetails?.platform_name || 'Platform Details'}
                bgImg={GamesDescriptionBg}
                backgroundColor='#290A47'
            />
            {platformDetails ? renderPlatformSpecificComponent() : (
                <div className="text-center text-white py-10">
                     <h1>Platform not found</h1>
                     <p>Sorry, the platform you're looking for does not exist or may have been removed.</p>
                 </div>
            )}
        </>
    );
};

export default memo(PlatformDescription);