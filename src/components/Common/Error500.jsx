import React from 'react'
import { Link } from 'react-router-dom'

const Error500 = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0E0E] text-white">
        <h1 className="text-9xl font-extrabold text-yellow-600">500</h1>
        <p className="text-2xl md:text-3xl font-semibold mt-4 text-gray-300">
          Internal Server Error
        </p>
        <p className="mt-2 text-gray-500">
          Oops! Something went wrong on our end.
        </p>
        <Link to="/" className="mt-6 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-300 ease-in-out">
          Go Back Home
        </Link>
      </div>
    </>
  )
}

export default Error500
