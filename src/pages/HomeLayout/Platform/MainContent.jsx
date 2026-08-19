import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useSelector } from 'react-redux';
import Loading from '../../../components/Common/Loading';
import { slugify } from '../../../utils/slugify'; // Import the slugify function

const MainContent = () => {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const response = await ApiHandler(API_ENDPOINTS.GAME.PLATFORMS, 'GET', undefined, token, null, navigate);

                if (response?.status === 200) {
                    setPlatforms(response.data.data);
                } else {
                    toast.error("Failed to load platforms");
                }
            } catch (error) {
                console.error("Error fetching platforms:", error);
                toast.error("Error fetching platforms");
            } finally {
                setLoading(false);
            }
        };

        fetchPlatforms();
    }, [navigate]);

    //console.log('platforms:', platforms);

    if (loading) {
        return <Loading />;
    }

    return (
        
        <div className='container mx-auto text-white mt-5'>
            <div className='flex justify-center'>
                <div className='mt-10 grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7'>
                    {platforms?.map((platform) => (
                        <div
                            key={platform.id}
                            onClick={() => navigate(`/platform/description/${slugify(platform.name)}`)}
                            className='w-[140px] h-[230px] xs:w-[200px] xs:h-[280px] flex flex-col justify-center items-center gap-3 cursor-pointer'
                        >
                            <img
                                src={platform.image}
                                alt= {platform.name}
                                className='w-[180px] h-[180px] border border-[#FFDD15] rounded-2xl object-contain'
                            />
 <div className='ourPlatformDropShadow border w-full border-[#FFDD15] px-3 rounded-full py-1 text-sm text-center font-bold sm:line-clamp-1 hover:bg-[#FFDD15] hover:text-[#290A47] transition-colors duration-200'>
  {platform.name}
</div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainContent;
