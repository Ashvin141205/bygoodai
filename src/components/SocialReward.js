import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { EXTRA_ENDPOINTS, getApiUrl } from '../config/apiEndpoints';

const SocialReward = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => !!state.auth.token); // Check for token existence

  useEffect(() => {
    const encodedUserId = searchParams.get('user');
    const action = searchParams.get('action');
    const timestamp = searchParams.get('t');


    // Validate query parameters
    if (!encodedUserId || !action || !timestamp) {
      console.warn('Missing query parameters'); // Debug log for missing parameters
      if (isLoggedIn) {
        toast.error('Invalid request.');
      }
      navigate('/home');
      return;
    }

    // Decoding logic
    try {
      const userId = atob(encodedUserId);
      const doubleEncodedUserId = searchParams.get('user');
      const doubleEncodedTimestamp = searchParams.get('t');
      const reversedUserId = atob(doubleEncodedUserId);
      const firstDecodeUserId = reversedUserId.split('').reverse().join('');
      const decodedUserId = atob(firstDecodeUserId);
      const reversedTimestamp = atob(doubleEncodedTimestamp);
      const firstDecodeTimestamp = reversedTimestamp.split('').reverse().join('');
      const decodedTimestamp = atob(firstDecodeTimestamp);


      const fetchData = async () => {
        try {
          const apiUrl = `${getApiUrl(EXTRA_ENDPOINTS.SOCIAL_REWARD)}?user=${encodeURIComponent(decodedUserId)}&action=${encodeURIComponent(action)}&t=${encodeURIComponent(decodedTimestamp)}`;

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const responseText = await response.text();

          let responseData;
          try {
            responseData = JSON.parse(responseText.trim());
          } catch (error) {
            console.error('Error parsing JSON:', error);
            if (isLoggedIn) {
              toast.error('An error occurred while processing the reward.');
            }
            return;
          }

          if (responseData.status && responseData.status.code === '1') {
            if (isLoggedIn) {
              toast.success('Reward added successfully!');
            }
          } else {
            const errorMessage = responseData.status?.message || 'Failed to add reward. Please try again later.';
            console.warn('Reward failed:', errorMessage); // Debug log for failure
            if (isLoggedIn) {
              toast.error(errorMessage);
            }
          }
        } catch (error) {
          console.error('Error adding reward:', error);
          if (isLoggedIn) {
            toast.error('An error occurred.');
          }
        } finally {
          navigate('/home');
        }
      };

      fetchData();
    } catch (decodeError) {
      console.error('Decoding error:', decodeError);
      if (isLoggedIn) {
        toast.error('Invalid encoding in request.');
      }
      navigate('/home');
    }
  }, [searchParams, navigate, isLoggedIn]);

  return null;
};

export default SocialReward;
