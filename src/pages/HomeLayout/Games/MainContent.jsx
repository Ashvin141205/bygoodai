"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ApiHandler } from "../../../helper/ApiHandler"
import { API_ENDPOINTS } from "../../../config/apiEndpoints"
import { OurPlatformData } from "../../../redux/slice/authSlice"
import { toast } from "react-toastify"
import { slugify } from "../../../../src/utils/slugify"
import CardSkeleton from "../../../components/Skeletons/CardSkeleton"

const MainContent = () => {
  const [categories, setCategories] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [categoryMap, setCategoryMap] = useState({})
  const [platformMap, setPlatformMap] = useState({})
  const [limit, setLimit] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") // <<< NEW: State for search term
  const [visibleCount, setVisibleCount] = useState(30) // <<< NEW: Windowed rendering
  const sentinelRef = useRef(null)

  const ourPlatform = useSelector((state) => state.auth.ourPlatform)
  const token = useSelector((state) => state.auth.token)

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await ApiHandler(
        API_ENDPOINTS.GAME.LIST,
        "POST",
        { gameID: "", filter: "latest", limit },
        undefined,
        dispatch,
        navigate,
      )
      if (response.data.status.code === "1") {
        dispatch(OurPlatformData({ ourPlatform: response.data.data }))
      }
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setIsLoading(false)
    }
  }, [limit, dispatch, navigate])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ApiHandler(API_ENDPOINTS.GAME.CATEGORIES, "GET", undefined, token, dispatch, navigate)
        if (response.status === 200) {
          setCategories(response.data.data)
          const map = {}
          response.data.data.forEach((category) => {
            map[category.cat_name.toLowerCase()] = category.id
          })
          setCategoryMap(map)
        } else {
          toast.error("Error fetching categories.")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [dispatch, navigate, token])

  useEffect(() => {
    const fetchPlatformsList = async () => {
      try {
        const response = await ApiHandler(API_ENDPOINTS.GAME.PLATFORMS, "GET", undefined, token, dispatch, navigate)
        if (response.status === 200) {
          setPlatforms(response.data.data)
          const map = {}
          response.data.data.forEach((platform) => {
            map[platform.name.toLowerCase()] = platform.id
          })
          setPlatformMap(map)
        } else {
          toast.error("Error fetching platforms.")
        }
      } catch (error) {
        console.error("Error fetching platforms:", error)
      }
    }
    fetchPlatformsList()
  }, [dispatch, navigate, token])

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const category = (queryParams.get("category") || "all").toLowerCase()
    const platform = (queryParams.get("platform") || "all").toLowerCase()
    const search = queryParams.get("search") || "" // <<< NEW: Get search term from URL
    setSelectedCategory(category)
    setSelectedPlatform(platform)
    setSearchTerm(search) // <<< NEW: Set search term from URL
  }, [location])

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    navigate(`/games?category=${category}&platform=${selectedPlatform}`)
  }

  const handlePlatformChange = (e) => {
    const platform = e.target.value
    setSelectedPlatform(platform)
    navigate(`/games?category=${selectedCategory}&platform=${platform}`)
  }

  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 10)
  }

  // <<< NEW: Combined filtering logic with search >>>
  const filteredGames = useMemo(() => {
    return ourPlatform?.filter((platform) => {
      const categoryMatch =
        selectedCategory === "all" || platform.cat_id === categoryMap[selectedCategory.toLowerCase()]
      const platformMatch =
        selectedPlatform === "all" || platform.platforms_id === platformMap[selectedPlatform.toLowerCase()]
      const searchMatch = !searchTerm || platform.game_name.toLowerCase().includes(searchTerm.toLowerCase())
      return categoryMatch && platformMatch && searchMatch
    })
  }, [ourPlatform, selectedCategory, selectedPlatform, searchTerm, categoryMap, platformMap])

  // <<< NEW: Incremental loading with IntersectionObserver >>>
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredGames && visibleCount < filteredGames.length) {
          setVisibleCount((prev) => Math.min(prev + 30, filteredGames.length))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredGames, visibleCount])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(30)
  }, [selectedCategory, selectedPlatform, searchTerm])

  return (
    <div className="container mx-auto text-white my-10">
      {/* <<<<---- START: UPDATED FILTERS AND SEARCH BAR ---->>>> */}
      <div className="mb-8 p-6 bg-gray-800/50 rounded-lg flex flex-col md:flex-row gap-6 items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <label htmlFor="game-search" className="block text-sm font-medium mb-1">
            Search Games
          </label>
          <input
            id="game-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by game name..."
            className="w-full bg-gray-900 text-white border-2 border-gray-700 rounded-full py-2 pl-5 pr-12 focus:outline-none focus:border-yellow-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex-grow flex flex-col sm:flex-row gap-6 w-full md:w-auto">
          <div className="flex-1">
            <label htmlFor="category-select" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full bg-gray-900 border-2 border-gray-700 text-white font-semibold p-2 rounded-lg focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.cat_name.toLowerCase()}>
                  {category.cat_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="platform-select" className="block text-sm font-medium mb-1">
              Platform
            </label>
            <select
              id="platform-select"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              className="w-full bg-gray-900 border-2 border-gray-700 text-white font-semibold p-2 rounded-lg focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.name.toLowerCase()}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* <<<<---- END: UPDATED FILTERS AND SEARCH BAR ---->>>> */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <CardSkeleton count={10} />
        ) : filteredGames?.length > 0 ? (
          <>
            {filteredGames.slice(0, visibleCount).map((game) => (
              <div key={game.id} className="flex justify-center">
                <Link to={`/games/description/${slugify(game.game_name || "")}`}>
                  <img
                    src={game.game_image || "/placeholder.svg"}
                    alt={game.game_name}
                    className="w-full h-[200px] object-cover border-2 border-[#FFDD15] rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>
            ))}
            {visibleCount < filteredGames.length && (
              <div ref={sentinelRef} className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 text-center py-4">
                <div className="animate-pulse text-gray-400">Loading more games...</div>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 text-center text-lg">
            No games match your search or filter criteria.
          </div>
        )}
      </div>

      {!isLoading && ourPlatform.length >= limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <span>Load More</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default MainContent
