"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/AxiosInstance"
import { FaSearch } from "react-icons/fa"
import { useDebounce } from "../../hooks/useDebounce"
import { handleApiError } from "../../utils/errorHandler"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const GameSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const searchContainerRef = useRef(null)

  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    axiosInstance
      .get(`${EXTRA_ENDPOINTS.SEARCH_GAMES}?q=${debouncedSearchTerm}`)
      .then((response) => {
        if (response.data.status) {
          setResults(response.data.data)
        } else {
          setResults([])
        }
      })
      .catch((error) => {
        handleApiError(error, "Failed to search games. Please try again.")
        setResults([])
      })
      .finally(() => setIsLoading(false))
  }, [debouncedSearchTerm])

  // Effect to handle clicks outside the search component to close results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setResults([])
        setSearchTerm("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchContainerRef])

  const handleResultClick = () => {
    setResults([])
    setSearchTerm("")
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchTerm.trim())}`)
      handleResultClick()
    }
  }

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-xs mx-auto">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a game..."
            className="w-full px-4 py-2 text-gray-800 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-yellow-400 transition"
          />
          <button type="submit" className="absolute top-0 right-0 mt-2 mr-4">
            <FaSearch className="text-gray-500" />
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((game) => (
            <li key={game.id}>
              <Link
                to={`/games/description/${game.game_slug}`}
                onClick={handleResultClick}
                className="flex items-center p-3 hover:bg-gray-100 transition"
              >
                <img
                  src={game.game_image || "/placeholder.svg"}
                  alt={game.game_name}
                  className="w-12 h-12 object-cover rounded-md mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-800">{game.game_name}</p>
                  <p className="text-sm text-gray-500">{game.platform_name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GameSearch
