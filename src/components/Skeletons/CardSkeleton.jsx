const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <div className="h-48 bg-gray-700 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </>
  )
}

export default CardSkeleton
