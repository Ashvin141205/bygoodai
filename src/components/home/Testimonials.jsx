import React, { useEffect, useState, useRef } from 'react';
import { getImageUrl } from '../../utils/getImageUrl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../helper/ApiHandler';
import StarRatings from 'react-star-ratings';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

// Testimonial Item Component - Trustpilot Style
const TestimonialItem = ({ name, rating, reviewText, createdAt, formattedDate }) => {
    const validRating = typeof rating === 'number' ? rating : parseFloat(rating);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
            {/* Stars Display */
            <div className="flex items-center justify-center mb-3">
                <StarRatings
                    rating={validRating}
                    starRatedColor="#00b67a"
                    numberOfStars={5}
                    starDimension="24px"
                    starSpacing="2px"
                    name="rating"
                />
            </div>
}
            {/* Name and Date */}
            <div className="mb-3">
                <p className="font-bold text-gray-900">{name}, <span className="font-normal text-gray-600">{formattedDate}</span></p>
            </div>
            
            {/* Review Title/Text */}
            <h3 className="font-bold text-gray-900 text-lg mb-2">
                {reviewText.length > 50 ? reviewText.substring(0, 50) + '...' : reviewText}
            </h3>
            
            {/* Full Review Text */}
            <p className="text-gray-700 text-sm mb-4 flex-grow overflow-hidden">
                {reviewText}
            </p>
        </div>
    );
};

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [isBgLoaded, setIsBgLoaded] = useState(false);
    const divRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await ApiHandler(API_ENDPOINTS.REVIEW.GET_REVIEWS, 'GET', {}, token, dispatch, navigate);
                console.log('Reviews API Response:', response);
                
                // Extract data from nested response structure
                const reviewsData = response?.data?.data || response?.data || [];
                
                if (Array.isArray(reviewsData)) {
                    // Format date for each review
                    const reviewsWithFormattedDate = reviewsData.map(review => {
                        const reviewDate = new Date(review.created_at);
                        const formattedDate = reviewDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        return {
                            ...review,
                            formattedDate: formattedDate
                        };
                    });
                    
                    setTestimonials(reviewsWithFormattedDate);
                } else {
                    console.warn('Reviews data is not an array:', reviewsData);
                    setTestimonials([]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setTestimonials([]);
            }
        };

        fetchReviews();
    }, [dispatch, navigate, token]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsBgLoaded(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const backgroundImageUrl = getImageUrl('/assets/image/testimonials.png');

    return (
        <div
            ref={divRef}
            className="mt-16 pb-16"
            style={{
                backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#0A0E27'
            }}
        >
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Our Player L<span className="text-red-500">❤️</span>ve Us
                    </h2>
                    <p className="text-gray-300 text-lg">
                        See what real players have to say about our top-rated online casino experience.
                    </p>
                    
                    {/* Trustpilot Stars */}
                    <div className="flex items-center justify-center mt-6 gap-3">
                        <span className="text-gray-300">Great</span>
                        <div className="flex">
                            <StarRatings
                                rating={4.3}
                                starRatedColor="#00b67a"
                                starEmptyColor="#dcdce6"
                                numberOfStars={5}
                                starDimension="28px"
                                starSpacing="2px"
                                name="trustpilot-rating"
                            />
                        </div>
                        <span className="text-gray-300">
                            <span className="font-bold">4.3/5</span>
                        </span>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div className="px-4">
                    {testimonials.length > 0 ? (
                        <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={4}
                            slidesToScroll={4}
                            arrows={true}
                            autoplay={false}
                            responsive={[
                                {
                                    breakpoint: 1024,
                                    settings: {
                                        slidesToShow: 3,
                                        slidesToScroll: 3,
                                    }
                                },
                                {
                                    breakpoint: 768,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 2,
                                    }
                                },
                                {
                                    breakpoint: 480,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1,
                                    }
                                }
                            ]}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="px-2">
                                    <TestimonialItem
                                        name={testimonial.name}
                                        rating={testimonial.rating}
                                        reviewText={testimonial.review_text}
                                        createdAt={testimonial.created_at}
                                        formattedDate={testimonial.formattedDate}
                                    />
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <div className="w-full">
                            <p className="text-white text-center">Loading reviews...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;