import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector

import Hero from '../../../components/Hero';
import BlogBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import Details from '../../../components/BlogDetails/Details'; // This component fetches its own data
import '../../../components/BlogDetails/blog.css';
import Loading from '../../../components/Common/Loading'; // Assuming you have a Loading component
import { ApiHandler } from '../../../helper/ApiHandler'; // If needed for any pre-fetching or context setting
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const BlogDetails = () => {
  const { id: blogId } = useParams(); // Get blogId from URL
  const [blogPostDetails, setBlogPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token); // If needed for API calls
  const dispatch = useDispatch(); // If ApiHandler uses it
  const navigate = useNavigate(); // For potential redirects

  // Construct the canonical URL dynamically
  // IMPORTANT: Replace "https://www.luckycharmsweep.com" with your actual domain
  const canonicalUrl = blogId ? `https://www.luckycharmsweep.com/blog/${blogId}` : "https://www.luckycharmsweep.com/blog";

  useEffect(() => {
    // The <Details /> component fetches its own data using the `id` from `useParams()`
    // However, we might want to fetch minimal data here for meta tags if <Details />
    // doesn't expose it easily or if we want to set meta tags before <Details /> fully loads.
    // For this example, we'll assume <Details /> handles its own data fetching internally
    // and we'll fetch a summary for meta tags here.

    if (!blogId) {
        console.error("Blog ID is undefined.");
        setLoading(false);
        navigate('/404'); // Or your blog listing page
        return;
    }

    const fetchBlogSummaryForMeta = async () => {
      setLoading(true);
      try {
        // Adjust endpoint and payload as needed to fetch title, description snippet, image for a specific blogId
        const response = await ApiHandler(
          API_ENDPOINTS.BLOG.DETAILS_ALT, // Assuming this endpoint can give summary or full details
          'POST',
          { id: blogId },
          token,
          dispatch
        );

        if (response.data.status.code === 1 && response.data.data?.blog_detail) {
          setBlogPostDetails(response.data.data.blog_detail);
        } else {
          console.error('Blog post not found for ID:', blogId);
          setBlogPostDetails(null);
          navigate('/404'); // Navigate to 404 if blog post not found
        }
      } catch (error) {
        console.error("Error fetching blog post summary:", error);
        setBlogPostDetails(null);
        // navigate('/error'); // Optionally navigate to a generic error page
      } finally {
        setLoading(false);
      }
    };

    fetchBlogSummaryForMeta();
  }, [blogId, token, dispatch, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!blogPostDetails && !loading) {
    // This case should ideally be handled by the navigate in useEffect
    return (
        <>
            <Helmet>
                <title>Blog Post Not Found - Lucky Charm Sweep</title>
                <meta name="description" content="The blog post you are looking for could not be found on Lucky Charm Sweep." />
            </Helmet>
            <Hero title={"Blog Post Not Found"} bgImg={BlogBg} backgroundColor='#290A47' />
            <div className="text-center text-white py-10">
                <h1>Blog Post Not Found</h1>
                <p>Sorry, the article you're looking for doesn't exist or may have been removed.</p>
            </div>
        </>
    );
  }

  // Prepare meta tags content
  const pageTitle = blogPostDetails?.title ? `${blogPostDetails.title} | Lucky Charm Sweep Blog` : "Blog Post | Lucky Charm Sweep";
  // Create a concise description from the blog content, avoid HTML tags
  const metaDescription = blogPostDetails?.description
    ? blogPostDetails.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + (blogPostDetails.description.length > 160 ? '...' : '')
    : "Read this interesting article from the Lucky Charm Sweep blog.";
  const ogImageUrl = blogPostDetails?.image || "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // Fallback OG image
  const author = blogPostDetails?.author || "Lucky Charm Sweep";
  const publishedTime = blogPostDetails?.created_date ? new Date(blogPostDetails.created_date).toISOString() : new Date().toISOString();
  // Assuming categories might be an array or a string; adjust as needed
  const keywordsFromCategories = blogPostDetails?.categories?.map(cat => cat.name).join(', ') || '';


  return (
    <>
      <Helmet>
        {/* --- Primary Meta Tags --- */}
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* --- Open Graph / Facebook --- */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:author" content={author} />
        {/* If you have blog categories, you can add them as article:section */}
        {/* Example: <meta property="article:section" content="Gaming Tips" /> */}
        {keywordsFromCategories && <meta property="article:tag" content={keywordsFromCategories} />}


        {/* --- Twitter --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        {/* <meta name="twitter:creator" content="@YourTwitterHandleForAuthor" /> */}
        {/* <meta name="twitter:site" content="@YourSiteTwitterHandle" /> */}

        {/* --- Optional: Additional Meta Tags --- */}
        <meta name="keywords" content={`${blogPostDetails?.title || ''}, blog, lucky charm sweep, ${keywordsFromCategories}, online gaming, sweepstakes articles`} />
        <meta name="author" content={author} />
      </Helmet>

      {/* The Hero title will be updated by the <Details /> component if it also uses Helmet,
          or you can pass the fetched blogPostDetails.title to it if Hero doesn't fetch */}
      <Hero title={loading ? "Loading Article..." : (blogPostDetails?.title || "Blog Post")} bgImg={BlogBg} backgroundColor='#290A47' />
      {/* The Details component should ideally take blogId or the fetched blogPostDetails as a prop
          to avoid fetching the same data twice if this parent fetch is comprehensive enough.
          For now, it uses useParams internally as per its structure. */}
      <Details />
    </>
  )
}

export default BlogDetails;