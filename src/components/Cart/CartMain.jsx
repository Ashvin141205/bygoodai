"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Helmet } from "react-helmet-async"
import { DownArrow2, RemoveCartIcon, UpArrow } from "../../utils/Icons"
import {
  updateCartQuantity,
  removeFromCart,
  confirmCartOperation,
  rollbackCartOperation,
} from "../../redux/slice/gamesSlice"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ApiHandler } from "../../helper/ApiHandler"
import { logger } from "../../utils/logger"
import { toast } from "react-toastify"
import ConfirmDialog from "../ConfirmDialog"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const CartItem = ({ game, index, isLast }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const location = useLocation()
  const [quantity, setQuantity] = useState(game.quantity)
  const gameprice = game.game_price

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const updateCart = async (newQuantity, previousQuantity) => {
    try {
      await ApiHandler(
        EXTRA_ENDPOINTS.CART_UPDATE,
        "POST",
        JSON.stringify({ gameID: game.id, quantity: newQuantity, price: gameprice }),
        token,
        dispatch,
        navigate,
      )
      dispatch(confirmCartOperation({ id: game.id }))
    } catch (error) {
      logger.error("API error during updateCart:", error)
      dispatch(
        rollbackCartOperation({
          id: game.id,
          operation: "updating",
          previousState: { quantity: previousQuantity },
        }),
      )
      setQuantity(previousQuantity)
      toast.error("Failed to update cart. Please try again.")
    }
  }

  const increment = async () => {
    const previousQuantity = quantity
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    dispatch(updateCartQuantity({ id: game.id, quantity: newQuantity }))
    await updateCart(newQuantity, previousQuantity)
  }

  const decrement = async () => {
    if (quantity > 10) {
      const previousQuantity = quantity
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      dispatch(updateCartQuantity({ id: game.id, quantity: newQuantity }))
      await updateCart(newQuantity, previousQuantity)
    }
  }

  const handleChange = async (e) => {
    const newQuantity = Number.parseInt(e.target.value, 10)

    if (!isNaN(newQuantity) && newQuantity >= 10) {
      const previousQuantity = quantity
      setQuantity(newQuantity)
      dispatch(updateCartQuantity({ id: game.id, quantity: newQuantity }))
      await updateCart(newQuantity, previousQuantity)
    }
  }

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true)
  }

  const handleConfirmedRemove = async () => {
    setIsRemoving(true)
    const previousState = { ...game }

    dispatch(removeFromCart({ id: game.id }))

    try {
      await ApiHandler(
        EXTRA_ENDPOINTS.CART_REMOVE_ABANDONED,
        "POST",
        JSON.stringify({ gameID: [game.id] }),
        token,
        dispatch,
        navigate,
      )
      dispatch(confirmCartOperation({ id: game.id }))
      toast.success("Item removed from cart")
      setShowRemoveConfirm(false)
    } catch (error) {
      logger.error("API error during removeFromCart:", error)
      dispatch(
        rollbackCartOperation({
          id: game.id,
          operation: "removing",
          previousState,
        }),
      )
      toast.error("Failed to remove item. Please try again.")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div
        className={`flex justify-between items-center my-2 w-full flex-col sm:flex-row space-y-6 ${!isLast ? "border-b-2 border-gray-700 pb-6" : ""}`}
      >
        <div className="flex items-center gap-6 w-full">
          <div className="w-20 h-20 overflow-hidden rounded-md  border-2 border-[#FFDD15] ">
            <img src={game.game_image || "/placeholder.svg"} alt={game.game_name} className="w-full h-full" />
          </div>
          <div className="text-white text-lg font-semibold">{game.game_name}</div>
        </div>
        <div className="flex items-center w-full justify-between flex-row-reverse sm:flex-row">
          <div className="flex justify-between items-center bg-[#0E0E0E] border border-white rounded w-20 h-8">
            <input
              type="text"
              value={quantity}
              onChange={handleChange}
              className="w-10 bg-[#0E0E0E] text-white text-center outline-none flex-1"
            />
            <div className="flex flex-col justify-center items-center gap-1 border-l flex-1">
              <UpArrow className="w-4 cursor-pointer hover:opacity-80" onClick={increment} />
              <DownArrow2 className="w-4 cursor-pointer hover:opacity-80" onClick={decrement} />
            </div>
          </div>
          <div className="text-[#01D370] font-bold text-lg">${game.game_price}</div>
          <button
            onClick={handleRemoveClick}
            className="text-red-500 text-lg font-semibold bg-transparent hover:opacity-80"
          >
            <RemoveCartIcon />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleConfirmedRemove}
        title="Remove Item from Cart"
        message={`Are you sure you want to remove "${game.game_name}" from your cart?`}
        confirmText="Remove"
        cancelText="Keep in Cart"
        type="danger"
        isLoading={isRemoving}
      />
    </>
  )
}

const CartMain = ({ cartData }) => {
  const navigate = useNavigate()
  const total = cartData.reduce((acc, game) => acc + game.game_price * game.quantity, 0)

  // Generate Shopping Cart Schema
  const generateCartSchema = () => ({
    "@context": "https://schema.org",
    "@type": "ShoppingCart",
    "name": "Shopping Cart - Lucky Charm Sweep",
    "description": "Review your selected games before checkout",
    "url": "https://www.luckycharmsweep.com/cart",
    "cartItem": cartData.map(item => ({
      "@type": "CartItem",
      "product": {
        "@type": "Product",
        "name": item.game_name,
        "offers": {
          "@type": "Offer",
          "price": item.game_price,
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "US"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 0,
                "unitCode": "MIN"
              }
            },
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0.00",
              "currency": "USD"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "US",
            "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "reviewCount": "120"
        }
      },
      "quantity": item.quantity,
      "price": item.game_price * item.quantity,
      "priceCurrency": "USD"
    })),
    "totalPrice": total,
    "priceCurrency": "USD"
  });

  const handleCheckout = () => {
    if (cartData.length > 0) {
      navigate("/checkout", { state: { isCheckoutAllowed: true } })
    } else {
      navigate("/")
    }
  }

  return (
    <>
      {/* Shopping Cart Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateCartSchema())}
        </script>
      </Helmet>

      <div 
        className="flex flex-wrap space-y-8 lg:space-y-0 justify-between items-start p-4"
        itemScope
        itemType="https://schema.org/ShoppingCart"
      >
      <div
        className="w-full lg:w-[70%] flex flex-col gap-2 items-start justify-between rounded-lg p-8 bg-[#1f2937]"
        style={{
          borderColor: "rgba(255, 255, 255, 0.16)",
          borderWidth: "1px",
        }}
      >
        <h2 className="text-white text-2xl font-semibold mb-6">Cart ({cartData.length} items)</h2>
        {cartData.map((game, index) => (
          <CartItem key={game.id} game={game} index={index} isLast={index === cartData.length - 1} />
        ))}
      </div>
      <div className="w-full lg:w-[25%]">
        <div className="w-full rounded-lg flex flex-col gap-5 text-white bg-[#290A47] border-l-[3px] border-b-[3px] border-[#EC29FC] py-6 px-6">
          <h3 className="text-xl font-semibold">Order Summary</h3>
          <div className="flex flex-row justify-between items-center font-semibold">
            <p>Subtotal:</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <div className="flex flex-row justify-between items-center font-semibold">
            <p>Total:</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="text-[#0E0E0E] bg-[#FFDD15] flex justify-center items-center gap-2 px-5 font-semibold py-2 rounded-md"
            itemProp="potentialAction"
            itemScope
            itemType="https://schema.org/CheckoutAction"
          >
            <meta itemProp="target" content="https://www.luckycharmsweep.com/checkout" />
            <meta itemProp="price" content={total.toFixed(2)} />
            <meta itemProp="priceCurrency" content="USD" />
            Checkout
          </button>
        </div>
        <div className="flex items-center justify-center mt-5 font-semibold text-white text-base">
          Or{" "}
          <Link
            to="/deposit"
            className="pl-3 text-[#FFDD15] font-extrabold hover:underline hover:text-white hover:font-black"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}

export default CartMain
