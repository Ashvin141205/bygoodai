"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ApiHandler } from "../../../../helper/ApiHandler"
import { useDispatch, useSelector } from "react-redux"
import MessageSkeleton from "../../../../components/Skeletons/MessageSkeleton"
import { EXTRA_ENDPOINTS } from "../../../../config/apiEndpoints"

const SystemMessagesView = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [promotionData, setPromotionData] = useState(null)
  const [paymnet_detail, setPaymnet_detail] = useState(null)
  const [game_data, setGame_data] = useState([])
  const userData = useSelector((state) => state.auth.user)

  const token = useSelector((state) => state.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const markSystemAsRead = async () => {
      try {
        await ApiHandler(EXTRA_ENDPOINTS.SYSTEM_MESSAGE_READ, "POST", { id: id }, token, dispatch, navigate)
      } catch (error) {
        setError("An error occurred while marking the message as read")
        console.error("Error marking promotion as read:", error)
      }
    }

    const fetchPromotionMessage = async () => {
      try {
        const response = await ApiHandler(EXTRA_ENDPOINTS.SYSTEM_MESSAGES, "POST", { id: id }, token, dispatch, navigate)
        if (response.data.status.code === 1) {
          const res = response.data.data
          setPromotionData(res)
          setPaymnet_detail(res.paymnet_detail ? res.paymnet_detail : null)
          setGame_data(res.paymnet_detail?.game_data || [])
        } else {
          setPromotionData(null)
          setPaymnet_detail(null)
          setGame_data([])
          setError("Failed to fetch promotion message")
        }
      } catch (error) {
        setError("An error occurred while fetching promotion message")
        console.error("Error fetching promotion message:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      markSystemAsRead()
      fetchPromotionMessage()
    }
  }, [id])

  // Helper function to group game data by two items per row
  const groupGameData = (data) => {
    const grouped = []
    for (let i = 0; i < data.length; i += 2) {
      grouped.push(data.slice(i, i + 2))
    }
    return grouped
  }

  if (loading) {
    return (
      <div className="main-dot-bg min-h-screen p-8">
        <MessageSkeleton count={1} />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>
  }

  return (
    <div className="main-dot-bg min-h-screen">
      <div className="flex flex-col text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold">
          {promotionData.title || "Promotion Title"}
          {/* <span role="img" aria-label="money bag">🤑</span> */}
        </h1>
        <p className="bg-[#484c64] text-white text-sm px-1 w-fit rounded-md mb-2">
          {promotionData.created_date || "Date"}
        </p>
        <p className="text-xl my-3">
          Hi <span className="font-bold">{userData.first_name || "User"}</span>, {/* Display username if available */}
        </p>
        <p className="text-lg mb-4">{promotionData?.message}</p>
      </div>
      {paymnet_detail && (
        <div className="bg-[#2d3748] p-4 md:p-6 rounded-lg shadow-inner text-white w-[60%] mx-auto mb-5">
          <p className="text-lg font-bold text-white mb-4">Details:</p>
          <div className="grid grid-cols-1 gap-4">
            {paymnet_detail?.user_balance && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Deposit Amount:</p>
                <p className="font-medium">{paymnet_detail?.user_balance}</p>
              </div>
            )}
            {paymnet_detail?.amount && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Amount:</p>
                <p className="font-medium">{paymnet_detail?.amount}</p>
              </div>
            )}
            {paymnet_detail?.created_date && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Approved On:</p>
                <p className="font-medium">{paymnet_detail?.created_date}</p>
              </div>
            )}

            {paymnet_detail?.payment_method && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Mode Of Payment:</p>
                <p className="font-medium">{paymnet_detail?.payment_method}</p>
              </div>
            )}

            {paymnet_detail?.payment_type && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Mode Of Payment:</p>
                <p className="font-medium">{paymnet_detail?.payment_type}</p>
              </div>
            )}

            {paymnet_detail?.order_id && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Transaction Id:</p>
                <p className="font-medium">{paymnet_detail?.order_id}</p>
              </div>
            )}

            {paymnet_detail?.crypto_user_id && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Crypto User Id:</p>
                <p className="font-medium">{paymnet_detail?.crypto_user_id}</p>
              </div>
            )}

            {paymnet_detail?.payment_reference_id && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">PaymentRefrence Id</p>
                <p className="font-medium">{paymnet_detail?.payment_reference_id}</p>
              </div>
            )}

            {paymnet_detail?.game_name && (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Redeem Platform</p>
                <p className="font-medium">{paymnet_detail?.game_name}</p>
              </div>
            )}

            {game_data.length > 0 && (
              <div className="flex items-start justify-between">
                <p className="text-gray-400">Deposit Platform:</p>
                <div className="font-medium">
                  {groupGameData(game_data).map((group, index) => (
                    <p key={index}>{group.map((game) => game.game_name).join(", ")}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemMessagesView
