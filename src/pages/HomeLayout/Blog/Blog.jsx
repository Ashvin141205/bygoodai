import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import MainContent from '../../../components/blog/MainContent';
import BlogBg from '../../../assets/image/blogBg.png'; // Ensure this path is correct
import Hero from '../../../components/Hero';
import { useParams } from 'react-router-dom';
import { ApiHandler } from '../../../helper/ApiHandler'; // Assuming you might need this for category details
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux'; // Assuming you might need this

const Blog = () => {
  const { id: categoryId } = useParams(); // categoryId from URL
  const [categoryName, setCategoryName] = useState(''); // State to store category name
  const [loadingCategory, setLoadingCategory] = useState(false); // Loading state for category details
  const token = useSelector((state) => state.auth.token); // If API requires token
  const dispatch = useDispatch(); // If ApiHandler uses dispatch

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (categoryId) {
        setLoadingCategory(true);
        try {
          // Assuming you have an endpoint to get category details by ID
          // Adjust category details endpoint and payload as needed
          const response = await ApiHandler(
            API_ENDPOINTS.BLOG.CATEGORIES_LIST, // Or your endpoint for a single category
            'POST', // or 'GET' depending on your API
            { cat_id: categoryId }, // Example payload
            token,
            dispatch
          );
          // Assuming the response for a single category by ID might be different
          // This part needs to be adapted based on your actual API response structure
          if (response.data.status.code === 1) {
            // If the endpoint returns a list, find the category
            const category = response.data.data.find(cat => String(cat.id) === String(categoryId));
            if (category) {
              setCategoryName(category.cat_name);
            } else {
              setCategoryName('Blog Category'); // Fallback if specific category not found
            }
          } else {
            setCategoryName('Blog'); // Fallback title
          }
        } catch (error) {
          console.error("Error fetching category details:", error);
          setCategoryName('Blog'); // Fallback title on error
        } finally {
          setLoadingCategory(false);
        }
      }
    };

    fetchCategoryDetails();
  }, [categoryId, token, dispatch]);


  // Define meta tags based on whether it's a general blog page or a specific category
  const pageTitle = categoryId && categoryName ? `${categoryName} - Blog | Lucky Charm Sweep` : "Blog - Latest News & Updates | Lucky Charm Sweep";
  const pageDescription = categoryId && categoryName ? `Explore articles in the ${categoryName} category. Get the latest news, tips, and updates from Lucky Charm Sweep.` : "Stay updated with the latest news, game releases, tips, and promotions from Lucky Charm Sweep. Your source for all things online sweepstakes!";
  const canonicalUrl = categoryId ? `https://www.luckycharmsweep.com/blog/category/${categoryId}` : "https://www.luckycharmsweep.com/blog"; // Replace with your actual domain
  const ogImageUrl = "https://d1txq81lrc562k.cloudfront.net/luckycharm.jpg"; // General blog OG image

  // The Hero title could also be dynamic
  const heroTitle = loadingCategory ? "Loading..." : (categoryId && categoryName ? categoryName.toUpperCase() : "BLOG");


  return (
    <>
      <Helmet>
        {/* --- Primary Meta Tags --- */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* --- Open Graph / Facebook --- */}
        <meta property="og:type" content={categoryId ? "article.section" : "website"} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="Lucky Charm Sweep" />
        <meta property="og:locale" content="en_US" />
        {categoryId && categoryName && <meta property="article:section" content={categoryName} />}


        {/* --- Twitter --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

        {/* --- Optional: Additional Meta Tags --- */}
        <meta name="keywords" content={`lucky charm sweep blog, online gaming news, sweepstakes tips, casino updates, ${categoryName ? categoryName + ',' : ''} gaming articles`} />
      </Helmet>

      <Hero bgImg={BlogBg} title={heroTitle} />
      <MainContent id={categoryId} /> {/* Pass categoryId to MainContent */}
    </>
  )
}

export default Blog;