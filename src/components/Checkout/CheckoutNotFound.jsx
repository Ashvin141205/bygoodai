import React from 'react'
import { useNavigate } from 'react-router-dom';

const CheckoutNotFound = () => {
    const navigate = useNavigate();

  return (
    <>
       <div className='text-center bg-black'>
        <div className="flex flex-col items-center justify-center h-screen text-white mx-auto container">
          <div className="mb-4">
            <svg
              className="w-24 h-24 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 9.172a4 4 0 015.656 5.656m-6.828-6.828a4 4 0 000 5.656m0 0a4 4 0 005.656 0m-5.656 5.656a4 4 0 010-5.656"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Items Found</h2>
          <p className="text-gray-400 mb-6 px-8 lg:w-[70%]">
            Your checkout is empty. It looks like you haven't added any games to your cart. Head over to the deposit page to explore and add your favorite games.
          </p>
          <button
            onClick={() => navigate('/deposit')}
            className="px-6 py-2 bg-[#FFDD15] text-black rounded-lg"
          >
            Deposit
          </button>
        </div>
      </div>
    </>
  )
}

export default CheckoutNotFound
