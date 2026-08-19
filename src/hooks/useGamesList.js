import { useSelector } from "react-redux"
import { useApiCache } from "./useApiCache"
import { GAME_ENDPOINTS } from "../config/apiEndpoints"

export const useGamesList = (options = {}) => {
  const token = useSelector((state) => state.auth.token)

  const { data, error, isLoading, isValidating, mutate, revalidate } = useApiCache(
    GAME_ENDPOINTS.MY_GAMES,
    "GET",
    undefined,
    token,
    {
      revalidateOnFocus: false,
      revalidateInterval: 0, // Don't auto-revalidate
      cacheTime: 10 * 60000, // Cache for 10 minutes
      ...options,
    },
  )

  return {
    games: data?.data || [],
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  }
}
