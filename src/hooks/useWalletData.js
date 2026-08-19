import { useSelector } from "react-redux"
import { useApiCache } from "./useApiCache"
import { USER_ENDPOINTS } from "../config/apiEndpoints"

export const useWalletData = (options = {}) => {
  const token = useSelector((state) => state.auth.token)

  const { data, error, isLoading, isValidating, mutate, revalidate } = useApiCache(
    USER_ENDPOINTS.BALANCE.GET,
    "GET",
    undefined,
    token,
    {
      revalidateOnFocus: true,
      revalidateInterval: 30000, // Revalidate every 30 seconds
      cacheTime: 60000, // Cache for 1 minute
      ...options,
    },
  )

  return {
    walletData: data?.data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  }
}
