"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams, useNavigate } from "react-router-dom"
import Loading from "../../components/Common/Loading"
import axios from "axios"
import QRCode from "qrcode.react"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const BotCryptoPayment = () => {
  const [searchParams] = useSearchParams()
  const { coin } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progressMessage, setProgressMessage] = useState("Generating payment link...")
  const [error, setError] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [copied, setCopied] = useState(false)

  const order_id = searchParams.get("order_id")
  const guestToken = searchParams.get("guest_token") || localStorage.getItem("guest_checkout_token")

  // Generate invoice
  useEffect(() => {
    if (!order_id || !coin) {
      setError("Invalid payment link")
      setLoading(false)
      return
    }

    const generateInvoice = async () => {
      try {
        setProgressMessage("Generating payment link...")
        const response = await axios.post(
          EXTRA_ENDPOINTS.BOT_GENERATE_CRYPTO_INVOICE,
          { order_id, coin: coin.toUpperCase() },
          { timeout: 20000 }
        )

        if (response.data.status.code === 1) {
          setInvoiceData(response.data.data.invoice)
          setOrderDetails(response.data.data.order)
          setProgressMessage("Redirecting to payment...")
        } else {
          setError(response.data.status.message || "Failed to generate payment invoice")
        }
      } catch (err) {
        console.error("[v0] Error generating invoice:", err)
        setError("Failed to generate payment. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    generateInvoice()
  }, [order_id, coin])

  // Poll payment status
  useEffect(() => {
    if (!order_id || paymentStatus !== "pending") return

    const pollStatus = async () => {
      try {
        const response = await axios.post(
          EXTRA_ENDPOINTS.BOT_CHECK_PAYMENT,
          { order_id },
          { timeout: 10000 }
        )

        if (response.data.status.code === 1) {
          const status = response.data.data.payment_status
          if (status === "1") setPaymentStatus("completed")
          else if (status === "2") setPaymentStatus("failed")
          else if (status === "3") setPaymentStatus("expired")
        }
      } catch (err) {
        console.error("[v0] Error checking payment status:", err)
      }
    }

    const interval = setInterval(pollStatus, 10000)
    return () => clearInterval(interval)
  }, [order_id, paymentStatus])

  useEffect(() => {
    if (paymentStatus !== "completed") {
      return
    }

    const successQuery = new URLSearchParams({ order_id: String(order_id || "") })
    if (guestToken) {
      successQuery.set("guest_token", guestToken)
    }

    navigate(`/payment/complete?${successQuery.toString()}`, { replace: true })
  }, [guestToken, navigate, order_id, paymentStatus])

  // Handle copy feedback
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loading />
          <p className="mt-4 text-gray-600">{progressMessage}</p>
        </div>
      </div>
    )
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

  if (paymentStatus === "completed") {
    return <Loading />
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Pay with {coin.toUpperCase()}</h1>

        {orderDetails && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Game:</span> {orderDetails.game_name}</p>
              <p><span className="font-medium">Amount:</span> ${orderDetails.amount}</p>
              <p><span className="font-medium">Order ID:</span> {order_id}</p>
            </div>
          </div>
        )}

        {invoiceData && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <QRCode value={invoiceData.payment_url} size={256} />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white rounded text-xs break-all">{invoiceData.crypto_address}</code>
                <button
                  onClick={() => handleCopy(invoiceData.crypto_address)}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Amount to Send:</p>
              <p className="text-2xl font-bold text-gray-800">
                {invoiceData.crypto_amount} {coin.toUpperCase()}
              </p>
            </div>

            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>Waiting for payment...</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center space-y-1 mt-2">
              <p>Send the exact amount to the address above.</p>
              <p>Payment will be confirmed automatically.</p>
              <p>This page will update when payment is received.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BotCryptoPayment
