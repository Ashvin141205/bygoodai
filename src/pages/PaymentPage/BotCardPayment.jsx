"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import Loading from "../../components/Common/Loading"
import axios from "axios"
import PaypalCheckoutButton from "../../components/PaypalCheckoutButton" // Import the PayPal button
import PayPalErrorBoundary from "../../components/PayPalErrorBoundary"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const BotCardPayment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [processing, setProcessing] = useState(false)

  const order_id = searchParams.get("order_id")
  const method = searchParams.get("method")
  const guestToken = searchParams.get("guest_token") || localStorage.getItem("guest_checkout_token")

  useEffect(() => {
    if (!order_id) {
      setError("Invalid payment link")
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.post(EXTRA_ENDPOINTS.BOT_GET_ORDER_DETAILS, {
          order_id,
        })

        if (response.data.status.code === 1) {
          setOrderDetails(response.data.data)
        } else {
          setError(response.data.status.message || "Failed to load order details")
        }
      } catch (err) {
        console.error("[v0] Error fetching order details:", err)
        setError("Failed to load payment information. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [order_id])

  const paypalPrice = Number.parseFloat(orderDetails?.amount || 0).toFixed(2);


  // Handler function called on successful PayPal payment capture
  // This follows the same flow as CheckOut.jsx: create order entry with paypal_order_id,
  // then webhook will update status and perform auto-deposit
  const handlePaypalSuccess = async (paypalOrderId) => {
    setProcessing(true)
    try {
        // Call the same endpoint as CheckOut.jsx to create payment entry with PayPal order ID
        // The webhook will later find this entry by paypal_order_id and update status + auto-deposit
        const response = await axios.post(
          EXTRA_ENDPOINTS.BOT_RECORD_PAYPAL_PAYMENT,
            {
                order_id: order_id, // The internal order ID from bot
                paypal_order_id: paypalOrderId, // The PayPal transaction ID
                amount: paypalPrice // Amount for validation
            }
        )

        if (response.data.status.code === 1) {
            // Success - payment entry created with paypal_order_id
            // Webhook will handle the rest (update status + auto-deposit)
          // NOTE: Using a simple JS alert here for demonstration, replace with your toast/modal flow.
            alert("Payment recorded successfully! Your game is being processed and will be ready shortly.")
            const successQuery = new URLSearchParams({ order_id: String(order_id || "") })
            if (guestToken) {
              successQuery.set("guest_token", guestToken)
            }
            navigate(`/payment/complete?${successQuery.toString()}`, { replace: true })
            // --- END ADDED ---
               setProcessing(false)
            return true; 
        } else {
            // Backend failed to record the payment
            throw new Error(response.data.status.message || "Failed to record payment on server.");
        }
    } catch (err) {
        // Log error and allow the PayPal component's error handler to run
        console.error("[BotCardPayment] Error recording PayPal payment:", err)
        setProcessing(false);
        throw err;
    }
  }

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
        </div>
      </div>
    )
  }

  return (
    // UI structure modeled after CheckOutMain.jsx (using dark background)
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div 
        className="max-w-2xl mx-auto bg-[#1f2937] p-6 md:p-8 rounded-lg shadow-2xl" 
        style={{ borderColor: "rgba(255, 255, 255, 0.16)", borderWidth: "1px" }}
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Secure Checkout (Card / PayPal)
        </h1>

        {/* Order Summary Section */}
        {orderDetails && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-white text-xl mb-4 border-b border-gray-700 pb-2">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-400">
                <span>Game Name:</span>
                <span className="font-medium text-white">{orderDetails.game_name || "N/A"}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Payment Method:</span>
                <span className="font-medium text-white capitalize">{method || "Card"}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Order ID:</span>
                <span className="font-medium text-white">{order_id}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-gray-700 mt-4">
                <span>Total Amount:</span>
                <span className="text-yellow-400">${paypalPrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* PayPal/Credit Card Payment Section */}
        <div className="space-y-4">
          <h4 className="text-white text-lg font-semibold mb-3">Pay with Card or PayPal</h4>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            {processing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your payment...</p>
              </div>
            ) : (
              <PayPalErrorBoundary>
                <PaypalCheckoutButton
                  key={paypalPrice}
                  product={{ 
                    description: `Payment for Order: ${order_id}`, 
                    price: parseFloat(paypalPrice)
                  }}
                  onSuccess={handlePaypalSuccess}
                  // The PayPal component handles the error toast
                  onError={() => console.error("PayPal process failed.")} 
                />
              </PayPalErrorBoundary>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
             <p className="text-sm text-gray-400">
               Your payment is processed securely via PayPal. You can choose to pay with your PayPal account or directly with a Credit/Debit Card.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotCardPayment