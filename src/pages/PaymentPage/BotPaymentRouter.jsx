"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import Loading from "../../components/Common/Loading"
import axios from "axios"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const BotPaymentRouter = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)

  const order_id = searchParams.get("order_id")
  const guestToken = searchParams.get("guest_token")

  const buildQuery = (params) => {
    const query = new URLSearchParams(params)
    if (guestToken) {
      query.set("guest_token", guestToken)
      localStorage.setItem("guest_checkout_token", guestToken)
    }
    return query.toString()
  }

  useEffect(() => {
    if (!order_id) {
      setError("Invalid payment link. Order ID is missing.")
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        console.log("[v1] Fetching order details for:", order_id)

        // ✅ Use POST request (JSON body)
        const response = await axios.post(
          EXTRA_ENDPOINTS.BOT_GET_ORDER_DETAILS,
          { order_id },
          { headers: { "Content-Type": "application/json" } }
        )

        console.log("[v1] Order details response:", response.data)

        if (response.data.status.code === 1) {
          const order = response.data.data
          setOrderDetails(order)

          // ✅ Route dynamically based on payment method
          const method = order.payment_method.toLowerCase()

          if (["btc", "ltc", "doge"].includes(method)) {
            navigate(`/payment/crypto/${method}?${buildQuery({ order_id, coin: method })}`, { replace: true })
          } else if (["applepay", "googlepay", "cashapp"].includes(method)) {
            navigate(`/payment/hosted?${buildQuery({ order_id, method })}`, { replace: true })
          } else if (["paypal", "creditcard"].includes(method)) {
            navigate(`/payment/card?${buildQuery({ order_id, method })}`, { replace: true })
          } else {
            setError(`Unsupported payment method: ${order.payment_method}`)
          }
        } else {
          setError(response.data.status.message || "Failed to load order details.")
        }
      } catch (err) {
        console.error("[v1] Error fetching order details:", err)
        setError("Failed to load payment information. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [order_id, navigate])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="https://t.me/LuckyCharmSweepBot"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Return to Bot
          </a>
        </div>
      </div>
    )
  }

  return <Loading />
}

export default BotPaymentRouter
