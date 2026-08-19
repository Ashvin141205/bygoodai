import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import { getImageUrl } from '../../utils/getImageUrl'; // Use helper function for background images
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Title from '../Title';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HotGameData } from '../../redux/slice/authSlice';
import { ApiHandler } from '../../helper/ApiHandler';
import { slugify } from '../../utils/slugify'; // Import the slugify function
import { GAME_ENDPOINTS } from '../../config/apiEndpoints';

const HotGames = () => {
  const hotGames = useSelector((state) => state.auth.hotGames);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isBgLoaded, setIsBgLoaded] = useState(false); // State to track background image loading
  const divRef = useRef(null); // Reference for background image lazy loading

  const backgroundImageUrl = getImageUrl('/assets/image/leaderboardBg.png'); // Use the helper function

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await ApiHandler(GAME_ENDPOINTS.LIST, 'POST', { gameID: "", filter: 'hot', limit: '6' }, undefined, dispatch, navigate);
        if (response.data.status.code === '1') {
          dispatch(HotGameData({ hotGames: response.data.data }));
        } else {
          console.error('Failed to fetch games:', response.data.status.message);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, [dispatch, navigate]);

  // Use IntersectionObserver to implement lazy loading for the background image
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsBgLoaded(true); // Load background image when in view
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      if (divRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const settings = {
    centerMode: true,
    centerPadding: '0',
    slidesToShow: 3,
    infinite: false,
    speed: 500,
    arrows: true,
    focusOnSelect: true,
    dots: true,
    lazyLoad: 'progressive',
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto">
      <div
        ref={divRef} // Attach ref for lazy loading
        style={{
          backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none', // Load background image only when in view
        }}
        className="flex flex-col items-center border border-[#ffdc156c] rounded-2xl pb-20 h-auto gap-5 mt-10"
      >
        <Title title="HOT" continueTitle="GAMES" />
        <div className="w-full px-3">
          <Slider {...settings} className="custom-slick-slider">
            {hotGames?.map((game) => (
              <div key={game.id} className="!flex justify-center end-image">
                <Link to={`/games/description/${slugify(game.game_name)}`}>
                  <img
                    src={game.game_image}
                    alt={game.game_name}
                    className="game-image"
                    loading="lazy" // Add lazy loading for game images
                  />
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default HotGames;
