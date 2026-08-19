"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useLocation } from "react-router-dom"
import Loading from "../../components/Common/Loading"
import axios from "axios"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const BotHostedPayment = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [loadingStep, setLoadingStep] = useState("Initializing...")
  const [error, setError] = useState(null)

  const order_id = searchParams.get("order_id")
  const pathParts = location.pathname.split("/")
  const method = searchParams.get("method") || pathParts[pathParts.length - 1]

  const telegramUrl = "https://t.me/LuckyCharmSweepBot"

  useEffect(() => {
    if (!order_id || !method) {
      setError("Invalid payment link. Redirecting...")
      setTimeout(() => {
        window.location.href = telegramUrl
      }, 1500)
      return
    }

    const generateHostedLink = async () => {
      try {
        // Step 1: Generating link
        setLoadingStep("Generating secure payment link...")

        const response = await axios.post(
          EXTRA_ENDPOINTS.BOT_GENERATE_HOSTED_PAYMENT,
          { order_id, payment_method: method },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 20000, // 20s timeout
          }
        )

        if (response.data.status.code === 1) {
          const cashierUrl = response.data.data.cashierUrl

          // Step 2: Redirecting
          setLoadingStep("Redirecting to secure checkout...")
          setTimeout(() => {
            window.location.href = cashierUrl
          }, 1000)
        } else {
          throw new Error(response.data.status.message || "Failed to generate payment link")
        }
      } catch (err) {
        console.error("[v3] Error generating hosted payment:", err)
        setError("Failed to generate payment. Redirecting to Telegram...")
        setTimeout(() => {
          window.location.href = telegramUrl
        }, 1500)
      }
    }

    generateHostedLink()
  }, [order_id, method])

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
        {/* Spinner / Loading Animation */}
        {!error && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 text-sm">{loadingStep}</p>
          </div>
        )}

        {/* Error UI */}
        {error && (
          <>
            <div className="text-red-500 text-5xl mb-2">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a
              href={telegramUrl}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Return to Bot
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default BotHostedPayment
