"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ApiHandler } from "../../../../helper/ApiHandler"
import { useDispatch, useSelector } from "react-redux"
import MessageSkeleton from "../../../../components/Skeletons/MessageSkeleton"
import { EXTRA_ENDPOINTS } from "../../../../config/apiEndpoints"

const PromotionMessageView = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [promotionData, setPromotionData] = useState({})
  const token = useSelector((state) => state.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const markPromotionAsRead = async () => {
      try {
        await ApiHandler(EXTRA_ENDPOINTS.PROMOTIONS_MESSAGE_READ, "POST", { id: id }, token, dispatch, navigate)
      } catch (error) {
        setError("An error occurred while marking the message as read")
        console.error("Error marking promotion as read:", error)
      }
    }

    const fetchPromotionMessage = async () => {
      try {
        const response = await ApiHandler(EXTRA_ENDPOINTS.PROMOTIONS_MESSAGE, "POST", { id: id }, token, dispatch, navigate)
        if (response.data.status.code === 1) {
          setPromotionData(response.data.data)
        } else {
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
      markPromotionAsRead()
      fetchPromotionMessage()
    }
  }, [id])

  if (loading) {
    return (
      <div className="main-dot-bg h-screen p-8">
        <MessageSkeleton count={1} />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>
  }

  return (
    <div className="main-dot-bg h-screen">
      <div className="flex flex-col text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold">
          {promotionData.title || "Promotion Title"}
          {/* <span role="img" aria-label="money bag">🤑</span> */}
        </h1>
        <p className="bg-[#484c64] text-white text-sm px-1 w-fit rounded-md mb-2">
          {promotionData.created_date || "Date"}
        </p>
        <p className="text-xl my-3">
          Hi <span className="font-bold">User</span>,
        </p>
        <p className="text-lg mb-4">{promotionData.message || "Promotion message content goes here."}</p>
      </div>
    </div>
  )
}

export default PromotionMessageView
