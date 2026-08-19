"use client"

const FilterButtons = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: "ALL", label: "ALL" },
    { id: "TRENDING", label: "TRENDING" },
    { id: "NEW_AND_HOT", label: "NEW" },
    { id: "TOP_PICK", label: "TOP PICK" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 px-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
            activeFilter === filter.id ? "bg-[#FFDD15] text-[#0E0E0E]" : "bg-[#222222] text-white hover:bg-[#333333]"
          }`}
          onClick={() => setActiveFilter(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default FilterButtons
