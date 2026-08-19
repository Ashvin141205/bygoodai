import React, { useState, useEffect } from 'react';
import BlogHead from './BlogHead';
import BlogMain from './BlogMain';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../Common/Loading';
import RelatedBlog from './RelatedBlog';
import { ApiHandler } from '../../helper/ApiHandler';
import { useDispatch, useSelector } from 'react-redux';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const Details = () => {
  const { id } = useParams(); // This will now receive slug instead of numeric id
  const [categories, setCategories] = useState([]);
  const [blogsDetails, setBlogsDetails] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadings, setLoadings] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {
      await fetchCategories();
      await fetchBlogsDetails();
    };

    fetchData();
  }, [id]); // Re-fetch when slug changes

  const fetchCategories = async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.BLOG.CATEGORIES_LIST, 'GET', undefined, token, dispatch, navigate);

      if (response.data && response.data.status.code === 1) {
        // Map the API response to the format you need
        const formattedCategories = response.data.data.map(cat => ({
          id: cat.id,
          name: cat.cat_name,
        }));
        setCategories(formattedCategories);
      } else {
        console.error('Error in response:', response.data.status.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadings(false);
    }
  };

  const fetchBlogsDetails = async () => {
    // Try to send both slug and id to support backend flexibility
    const body = {
      slug: id,  // Send as slug parameter (SEO-friendly)
      id: id     // Also send as id for backward compatibility
    }
    try {
      const response = await ApiHandler(API_ENDPOINTS.BLOG.DETAILS_ALT, 'POST', body, token, dispatch, navigate);
      if (response.data.status.code === 1) {
        setBlogsDetails(response.data.data?.blog_detail);
        setRelatedBlogs(response.data.data?.related_blog);
      } else {
        setBlogsDetails([]);
        setRelatedBlogs([]);
      }
    } catch (error) {
      setBlogsDetails([]);
      setRelatedBlogs([]);
    } finally {
      setLoadings(false);
    }
  };

  if (loadings) return <Loading />;

  return (
    <>
      <section className='mx-auto container mt-10 md:mt-20 mb-10 text-white relative block'>
        <BlogHead blogsDetails={blogsDetails} />
        <BlogMain categories={categories} blogsDetails={blogsDetails} />
        <RelatedBlog relatedBlogs={relatedBlogs} />
      </section>
    </>
  )
}

export default Details
