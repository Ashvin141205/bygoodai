"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { ApiHandler } from "../../helper/ApiHandler"
import { logger } from "../../utils/logger"
import DepositCard from "./DepositCard"
import FilterButtons from "./FilterButtons"
import { handleApiError } from "../../utils/errorHandler"
import { EXTRA_ENDPOINTS, GAME_ENDPOINTS } from "../../config/apiEndpoints"

const MainContent = ({ depositItems, counters, setCounters, fetchPlatforms, onPlayGame }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const location = useLocation()
  const [favorites, setFavorites] = useState([])
  const [userGames, setUserGames] = useState([])
  const [activeFilter, setActiveFilter] = useState("ALL")

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return

      try {
        const response = await ApiHandler(EXTRA_ENDPOINTS.FAVORITES_GET, "POST", "{}", token, dispatch, navigate)

        const favoritesList = response?.data?.data?.favorites || []

        if (Array.isArray(favoritesList)) {
          const favoriteIds = favoritesList.map((fav) => String(fav.game_id))
          setFavorites(favoriteIds)
        } else {
          logger.warn("Unexpected format for favorites:", favoritesList)
          setFavorites([])
        }
      } catch (error) {
        handleApiError(error, "Failed to load favorites")
        setFavorites([])
      }
    }

    fetchFavorites()
  }, [token, dispatch, navigate])

  const toggleFavorite = async (gameID) => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } })
      toast.error("Please sign in to add favorites.")
      return
    }

    const isFavorite = favorites.includes(String(gameID))
    const endpoint = isFavorite ? EXTRA_ENDPOINTS.FAVORITES_REMOVE : EXTRA_ENDPOINTS.FAVORITES_ADD

    try {
      await ApiHandler(endpoint, "POST", JSON.stringify({ gameID: String(gameID) }), token, dispatch, navigate)
      setFavorites((prev) => (isFavorite ? prev.filter((id) => id !== String(gameID)) : [...prev, String(gameID)]))

      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
    } catch (error) {
      handleApiError(error, "Failed to update favorites. Please try again.")
    }
  }

  useEffect(() => {
    const fetchUserGames = async () => {
      if (!token) {
        setUserGames([])
        return
      }

      try {
        const response = await ApiHandler(GAME_ENDPOINTS.MY_GAMES, "GET", undefined, token, dispatch, navigate)
        if (response.data.status.code === 1) {
          setUserGames(response.data.data)
        } else {
          setUserGames([])
        }
      } catch (error) {
        handleApiError(error, "Failed to load your games")
        setUserGames([])
      }
    }

    fetchUserGames()
  }, [token, dispatch, navigate])

  const platformDepositItems = depositItems.filter((item) => item.tags === "platform")

  const filteredGames = platformDepositItems.filter((item) => {
    if (activeFilter === "ALL") {
      return true
    } else if (activeFilter === "TRENDING") {
      return item.trending === "1"
    } else if (activeFilter === "NEW_AND_HOT") {
      return item.new_and_hot === "1"
    } else if (activeFilter === "TOP_PICK") {
      return item.top_pick === "1"
    }
    return true
  })

  return (
    <div className="py-10" style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
      <div className="container mx-auto">
        <FilterButtons activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-16 px-5 sm:px-0">
          {filteredGames.map((depositItem, index) => {
            const userGame = userGames.find((game) => String(game.game_id) === String(depositItem.id))

            return (
              <DepositCard
                key={depositItem.id}
                depositItem={depositItem}
                index={index}
                counter={counters[index]}
                setCounter={(value) => {
                  const updatedCounters = [...counters]
                  updatedCounters[index] = value
                  setCounters(updatedCounters)
                }}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                userGame={userGame}
                onPlayGame={onPlayGame}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MainContent
