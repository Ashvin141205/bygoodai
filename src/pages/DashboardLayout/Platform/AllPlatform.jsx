import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../components/Common/Loading";
import { ApiHandler } from "../../../helper/ApiHandler";
import { API_ENDPOINTS } from "../../../config/apiEndpoints";

const AllPlatform = () => {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [gameData, setGameData] = useState([]);
    const [filteredData, setFilteredData] = useState([]); // New state to store filtered data
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(50); // Windowed rendering count
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { total_deposit } = useSelector(state => state.auth);
    const modalRef = useRef(); // Create a ref to track the modal

    // Fetch the game account data once when the component mounts
    const fetchMessages = async () => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.PLATFORM.GET_ACCOUNTS, 'GET', undefined, token, dispatch, navigate);
            if (response.data.status.code === '1') {

                //console.log(response.data)
                setGameData(response.data.data);

                // Filter data: only where is_requested === 2 and username, password are not null
                const filtered = response.data.data.filter(
                    item => item.is_requested === "2" && item.username && item.password
                );
                setFilteredData(filtered); // Set the filtered data
            } else {
                toast.error("Failed to fetch platform accounts");
            }
        } catch (error) {
            console.error('Error fetching platform accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ensure the API call only happens once
    useEffect(() => {
        fetchMessages();
    }, []);

    // Handle the reset click action based on the item's status
    const handleResetClick = (item) => {
        if (item.is_requested === "1" || item.is_requested === "2") {
            toast.error("Request for this game has already been submitted");
        } else if (item.is_requested === "0") {
            if (parseFloat(total_deposit) >= 20) {
                handleConfirmReset(item);
            } else {
                setIsModalOpen(true);
                return;
            }
        }
    };

    // Handle the password reset confirmation request
    const handleConfirmReset = async (item) => {
        try {
            const response = await ApiHandler(API_ENDPOINTS.PLATFORM.LINK_ACCOUNT, 'POST', { platformsID: item.id }, token, dispatch, navigate);
            if (response?.data?.status.code === 1) {
                setGameData((prevData) =>
                    prevData.map((game) =>
                        game.id === item.id ? { ...game, is_requested: "1" } : game
                    )
                );
                toast.success(response?.data?.status.message);
                setIsModalOpen(false);
            } else {
                toast.error(response?.data?.status.message);
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            toast.error("Error submitting request");
        }
    };

    // Handle closing the deposit modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate('/deposit');
    };

    // Detect outside clicks to close the modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsModalOpen(false); // Close modal when clicking outside
            }
        };

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);


    // Incrementally reveal more rows when sentinel enters viewport
    const sentinelRef = useRef(null);
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setVisibleCount((prev) => Math.min(prev + 50, gameData.length));
            }
        }, { rootMargin: '200px' });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [gameData.length]);

    // Show loading state if data is still being fetched
    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto p-6 bg-[#222222] rounded-lg shadow-lg">
   {
  filteredData.length > 0 && (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Platform Accounts</h2>
      <table className="min-w-full">
        <thead>
          <tr className='bg-[#290A47]'> {/* Header row with your color */}
            <th className="px-4 py-2 text-left font-medium text-white">Platform</th>
            <th className="px-4 py-2 text-left font-medium text-white">Username</th>
            <th className="px-4 py-2 text-left font-medium text-white">Password</th>
            <th className="px-4 py-2 text-left font-medium text-white">URL</th>

          </tr>
        </thead>
        <tbody>
          {filteredData?.map((item, index) => (
            <tr key={index} className="bg-[#1F2937]"> {/* Row background color */}
              <td className="px-4 py-2 text-white">{item.name}</td>
              <td className="px-4 py-2 text-white">{item.username ? item.username : 'Not Provided'}</td>
              <td className="px-4 py-2 text-white">{item.password ? item.password : 'Not Provided'}</td>
              <td className="px-4 py-2 text-white">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {item.url}
                  </a>
                ) : 'Not Provided'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
            <h2 className="text-2xl font-bold text-white mb-4">All Platforms</h2>

            <div className="flex flex-col text-base font-semibold">
                <div className="flex flex-row justify-between items-center p-4 text-white">
                    <p>Name</p>
                    <p>Status</p>
                </div>
                {
                    gameData?.slice(0, visibleCount).map((item, index) => (
                        <div
                            key={index}
                            className={`flex flex-row justify-between items-center  p-4 text-white rounded-md ${index % 2 === 0 ? 'bg-[#290A47] main-border' : 'bg-transparent'}`}
                        >
                            <p>{item.name}</p> {/* Updated to use item.name */}
                            {item.is_requested === "2" ? (
                                <button
                                    className="text-[#4AFFA9] py-1 px-4 rounded-[10px] main-border"
                                    style={{ backgroundColor: 'rgba(74, 255, 169, 0.2)' }}
                                >
                                    Created
                                </button>
                            ) : item.is_requested === "1" ? (
                                <button
                                    className="text-[#F8924F] py-1 px-4 rounded-[10px] main-border"
                                    style={{ backgroundColor: 'rgba(248, 146, 79, 0.2)' }}
                                >
                                    Pending
                                </button>
                            ) : (
                                <button
                                    className="text-white py-1 px-4 rounded-[10px] main-border"
                                    style={{ backgroundColor: 'rgba(255, 43, 98, 1)' }}
                                    onClick={() => handleResetClick(item)}
                                >
                                    Request
                                </button>
                            )}
                        </div>
                    ))
                }
                {/* Sentinel for incremental loading */}
                {visibleCount < gameData.length && (
                  <div ref={sentinelRef} className="py-6 text-center text-gray-400">Loading more...</div>
                )}
            </div>

            {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
    <div ref={modalRef} className="bg-white text-black p-5 rounded-lg shadow-lg w-full max-w-md"> {/* Changed width */}
    <h2 className="text-xl mb-4 text-center font-bold">Deposit now!</h2>
    <p className="text-sm"> {/* Changed font size */}
    For your request to be approved, you must make a minimum deposit ($10) on this platform. The deposit made will be uploaded to the platform of your choice.
                        </p>
                        <div className="mt-4 flex justify-center space-x-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-[#7066e0] text-white rounded-md"
                                >
                                Make a new deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPlatform;
