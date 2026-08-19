const TextSkeleton = ({ lines = 3, className = "" }) => {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-700 rounded"
          style={{ width: index === lines - 1 ? "60%" : "100%" }}
        ></div>
      ))}
    </div>
  )
}

export default TextSkeleton
