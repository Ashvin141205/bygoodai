import React, { useEffect, useState } from 'react';
import Title from '../Title';
import { Link, useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../helper/ApiHandler';
import arrowmove from '../../assets/image/arrowmove.svg';
import { slugify } from '../../utils/slugify'; // Import the slugify function
import { GAME_ENDPOINTS } from '../../config/apiEndpoints';

const OurPlatform = () => {
    const [ourPlatform, setOurPlatform] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const response = await ApiHandler(GAME_ENDPOINTS.PLATFORMS, 'GET');
                if (response.status === 200 && Number(response?.data?.status?.code) === 1) {
                    
                    setOurPlatform(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching platforms:', error);
            }
        };

        fetchPlatforms();
    }, []);

    const platformsToShow = ourPlatform.slice(0, 9);

    return (
        <div className='container mx-auto text-white mt-5'>
            <Title title={"TOP"} continueTitle={"PLATFORMS"} />
            <p className="text-center text-gray-300 text-sm mt-2">
    Play Top Industry Games in One Place
</p>
            <div className='flex justify-center'>
                <div className='mt-10 grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7'>
                    {platformsToShow.map((platform) => (
                        <div key={platform.id} className="game-card relative overflow-hidden">
                        {/* Badge (only show if bonus exists) */}
                        {platform.total_games && (
      
  <div className="absolute top-[12px] left-[-28px] w-[110px] rotate-[-45deg] bg-[rgb(255_221_21/1)] text-black text-[10px] font-bold text-center py-[4px] leading-[1.0] shadow z-10">
                          {platform.total_games} Games  
                       </div>
                    )}
                      
                        {/* Game Image */}
                        <img
                            src={platform.image}
                            alt={`${platform.name} img`}
                            className='object-cover w-full h-auto'
                        />
                    
                        {/* Button */}
                        <button
                         onClick={() => navigate('/deposit')}
                            className='button'
                        >
                            {platform.name}
                        </button>
                    </div>
                    ))}

                    {ourPlatform.length > 9 && (
                        <div className='game-card'>
                            <button
                              onClick={() => navigate(`/deposit`)}
                                className='w-full h-full flex items-center justify-center bg-[#FFDD15] text-black font-bold text-lg rounded-2xl border-2 border-[#FFDD15] hover:bg-[#f0c015] transition duration-300 py-2 relative overflow-hidden'
                            >
                                View More
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#ffffff4d',
                                        WebkitMaskImage: `url(${arrowmove})`,
                                        maskImage: `url(${arrowmove})`,
                                        WebkitMaskRepeat: 'no-repeat',
                                        maskRepeat: 'no-repeat',
                                        WebkitMaskSize: 'contain',
                                        maskSize: 'contain',
                                        position: 'absolute',
                                        top: '25%',
    
                                        transform: 'translate(-50%, -50%)',
                                        animation: 'arrow_moving 3s linear infinite',
                                    }}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OurPlatform;
