import React from "react";
import { Link } from "react-router-dom"; // Assuming you're using react-router

const Error404 = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0E0E] text-white">
        <h1 className="text-9xl font-extrabold text-red-600">404</h1>
        <p className="text-2xl md:text-3xl font-semibold mt-4 text-gray-300">
        Oops! Page not found.
        </p>
        <p className="mt-2 text-gray-500">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link to="/" className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 ease-in-out">
          Go Back Home
        </Link>
      </div>
    </>
  );
};

export default Error404;
