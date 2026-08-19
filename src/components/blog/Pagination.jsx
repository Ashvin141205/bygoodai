import React from 'react';

const Pagination = ({ currentPage, isNextDisabled, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 0) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (!isNextDisabled) {
            onPageChange(currentPage + 1);
        }
    };

    const newCurrentPage = currentPage + 1;
    return (
        <div className="flex justify-center items-center mt-4 space-x-2">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className={`px-4 py-2 border rounded-lg flex items-center justify-center space-x-2 ${currentPage === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-300 cursor-pointer'
                    }`}
            >
                Previous
            </button>

            {/* First Page Button - Always show */}
            {currentPage > 2 && (
                <>
                    <button
                        className="px-4 py-2 border rounded bg-[#1a1f2c] text-white"
                        onClick={() => onPageChange(1)}>
                        1
                    </button>
                    {currentPage > 2 && <span>...</span>} {/* Ellipsis for skipped pages */}
                </>
            )}

            {/* Show currentPage - 2 if currentPage is greater than 3 */}
            {currentPage > 2 && (
                <button
                    className="px-4 py-2 border rounded bg-[#1a1f2c] text-white"
                    onClick={() => onPageChange(currentPage - 2)}>
                    {newCurrentPage - 2}
                </button>
            )}

            {/* Show currentPage - 1 if currentPage is greater than 2 */}
            {currentPage > 1 && (
                <button className="px-4 py-2 border rounded bg-[#1a1f2c] text-white"
                    onClick={() => onPageChange(currentPage - 1)}>
                    {newCurrentPage - 1}
                </button>
            )}

            <button
                className="px-4 py-2 border rounded bg-[#FFDD15] text-black"
            >
                {newCurrentPage}
            </button>


            <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`px-4 py-2 border rounded-lg flex items-center justify-center space-x-2 ${isNextDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-300 cursor-pointer'
                    }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
