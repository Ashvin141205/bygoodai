import { useSelector } from "react-redux"
import { useApiCache } from "./useApiCache"
import { EXTRA_ENDPOINTS } from "../config/apiEndpoints"

export const useLevelData = (options = {}) => {
  const token = useSelector((state) => state.auth.token)

  const { data, error, isLoading, isValidating, mutate, revalidate } = useApiCache(
    EXTRA_ENDPOINTS.LEVEL_PROGRESS,
    "POST",
    undefined,
    token,
    {
      revalidateOnFocus: false,
      revalidateInterval: 60000, // Revalidate every minute
      cacheTime: 5 * 60000, // Cache for 5 minutes
      ...options,
    },
  )

  return {
    levelData: data?.data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  }
}
