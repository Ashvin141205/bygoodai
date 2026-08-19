import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import Loading from '../../../components/Common/Loading'
import { Link, useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../../helper/ApiHandler';
import { useDispatch, useSelector } from 'react-redux';
import { EXTRA_ENDPOINTS, GAME_ENDPOINTS } from '../../../config/apiEndpoints';

const Games = () => {
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20); // <<< NEW: Windowed rendering
  const sentinelRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#290A47',
        color: '#FFFFFF',
        fontSize: '17px',
        fontWeight: '700',
        textAlign: 'start',
      },
    },
    rows: {
      style: {
        backgroundColor: '#0E0E0E',
        color: '#FFFFFF',
        fontSize: '15px',
        fontWeight: '400'
      },
    },
    pagination: {
      style: {
        backgroundColor: '#222222',
        color: '#FFFFFF',
      },
    },
    noData: {
      style: {
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#0E0E0E',
        color: '#FFFFFF',
        fontSize: '16px',
      },
    },
  };

  const columns = [
    {
      name: 'Game Id',
      selector: row => row.game_id,
      sortable: true,
    },
    {
      name: 'Game Name',
      selector: row => row.game_name,
      sortable: true,
    },
    {
      name: 'User Name',
      selector: row => row.username,
      sortable: true,
    },
    {
      name: 'Password',
      selector: row => row.password,
      sortable: true,
    },
{
  name: 'Game Url',
  selector: row => (
    <a href={row.game_url} target="_blank" rel="noopener noreferrer">
      {row.game_url}
    </a>
  ),
  sortable: true,
},
 
    {
      name: 'Reset',
      selector: (row) =>
        !row.username && !row.password ? (
          <>
            <div className='px-2 py-2 rounded-md text-[#F8924F] text-sm font-semibold tracking-normal cursor-pointer'
              style={{ backgroundColor: 'rgba(248, 146, 79, 0.2)' }}>
              Pending
            </div>
          </>
        ) : (
          row.reset_password === "1" ? (
            <>
              <div className='px-2 py-2 rounded-md bg-[#FF2B62] text-white text-sm font-semibold tracking-normal cursor-pointer'
                onClick={() => handleResetClick(row)}>
                Reqeusted
              </div>
            </>
          ) : row.reset_password === "0" ? (
            <>
    <div 
  className="px-2 py-1 md:px-4 md:py-2 rounded-md bg-[#EC29FC] text-white text-sm md:text-base font-bold tracking-normal cursor-pointer w-full md:w-auto text-center" 
  onClick={() => handleResetClick(row)}
>
  Reset Password
</div>
            </>
          ) : (
            <></>
          )
        ),
      sortable: true,
    },
  ];

  const fetchMessages = async () => {
    try {
      const response = await ApiHandler(GAME_ENDPOINTS.MY_GAMES, 'GET', undefined, token, dispatch, navigate);
      if (response.data.status.code === 1) {
        const rawData = response.data.data;

        // Filter and handle duplicates based on game_id
        const uniqueGames = rawData.reduce((acc, current) => {
          const existingGameIndex = acc.findIndex(game => game.game_id === current.game_id);

          // If no previous entry for this game_id, add it directly
          if (existingGameIndex === -1) {
            acc.push(current);
          } else {
            const existingGame = acc[existingGameIndex];

            // Check if current game has username and password, if not, keep the existing one
            if (!existingGame.username && !existingGame.password) {
              acc[existingGameIndex] = current;
            }
          }

          return acc;
        }, []);

        setGameData(uniqueGames);
      }
    } catch (error) {
      console.error('Error fetching system messages:', error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    try {
      if (window.$crisp) {
        if (gameData && gameData.length > 0) {
          // Combine all game data into a single, valid object for Crisp
          const sessionData = gameData.reduce((acc, game) => {
            acc[`game_id_${game.game_id}`] = game.game_id;
            acc[`game_name_${game.game_id}`] = game.game_name;
            acc[`username_${game.game_id}`] = game.username;
            acc[`password_${game.game_id}`] = game.password;
            return acc;
          }, {});

          // FIX: Iterate and push each key-value pair individually. 
          // This fixes the "Error: Invalid data" by adhering to Crisp's expected API format.
          Object.entries(sessionData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              // Ensure the value is a string as required by Crisp session data
              window.$crisp.push(["set", "session:data", [key, String(value)]]);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error setting Crisp user data:', error);
    }
  }, [gameData]);

  useEffect(() => {
    fetchMessages();
  }, []);

  // <<< NEW: Incremental loading with IntersectionObserver >>>
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || gameData.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < gameData.length) {
          setVisibleCount((prev) => Math.min(prev + 20, gameData.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [gameData.length, visibleCount]);

  const handleResetClick = (row) => {
    if (row.reset_password === "1") {
      toast.error("Reset request for this game has already been submitted");
    } else if (row.reset_password === "0") {
      setSelectedGame(row);
      setIsModalOpen(true);
    }
  };

 const handleConfirmReset = async () => {

    try {
      const response = await ApiHandler(EXTRA_ENDPOINTS.GAME_RESET_PASSWORD, 'POST', { gameId: selectedGame.game_id }, token, dispatch, navigate);
      if (response?.data?.status.code === 1) {
        setGameData((prevData) =>
          prevData.map((game) =>
            game.game_id === selectedGame.game_id ? { ...game, reset_password: "1" } : game
          )
        );
        toast.success("Password reset request has been submitted");
        setIsModalOpen(false);
      } else {
        toast.success(response?.data?.status.message);
      }
    } catch (error) {
      console.error(error); // Keep the console log for debugging
      toast.error("An error occurred. Please try again."); // Provide user feedback
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Show loading state if data is still being fetched
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 main-dot-bg text-white rounded-lg shadow-lg min-h-screen my-games">
      <h2 className="text-2xl mb-4">My Games</h2>
      <div className='py-10'>
        {gameData.length > 0 ? (
          <>
            <DataTable
              data={gameData.slice(0, visibleCount)}
              columns={columns}
              customStyles={customStyles}
              className="table-bordered table-responsive"
              responsive
              progressPending={loading}
              progressComponent={<h6 className='py-10 bg-[#0E0E0E] text-white font-bold w-full flex items-center justify-center border'>Processing data..........</h6>}
              pagination={false}
            />
            {visibleCount < gameData.length && (
              <div ref={sentinelRef} className="text-center py-4 bg-[#0E0E0E] text-gray-400">
                <div className="animate-pulse">Loading more games...</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className='relative bg-[#222222] text-[16px]'>
              <table className='w-full' >
                <thead className='h-[50px]'>
                  <tr className='bg-[#290A47] text-white py-4'>
                    {columns.map((column) => (

                      !column.omit &&
                      <th key={column.name} className='text-[16px]'>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className='h-[50vh]'>
                  <tr style={{ textAlign: 'center', backgroundColor: '#0E0E0E' }}>
                    <td colSpan={columns.length} style={{ padding: '8px 5px' }}>No data available in table</td>
                  </tr>
                </tbody>
              </table>
              <div className="d_processing" style={{ display: loading ? 'block' : 'none' }}>Processing...</div>
            </div>
          </>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-5 rounded-lg shadow-lg">
            <h2 className="text-lg mb-4">Confirm Reset Password</h2>
            <p>Are you sure you want to reset the password for <strong>{selectedGame?.game_name}</strong>?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Close
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
