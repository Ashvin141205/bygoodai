"use client"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { DownArrow2, UpArrow } from "../../utils/Icons"
import {
  addToCart,
  removeFromCart,
  confirmCartOperation,
  rollbackCartOperation,
} from "../../redux/slice/gamesSlice"
import { ApiHandler } from "../../helper/ApiHandler"
import GameBadges from "./../GameBadges"
import { logger } from "../../utils/logger"
import { handleApiError } from "../../utils/errorHandler"
import { EXTRA_ENDPOINTS } from "../../config/apiEndpoints"

const DepositCard = ({ depositItem, index, counter, setCounter, favorites, toggleFavorite, userGame, onPlayGame }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const cart = useSelector((state) => state.games.cart)

  // Generate Product Schema for SEO
  const generateProductSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": depositItem.game_name,
    "description": `Play ${depositItem.game_name} with instant deposits starting at $${depositItem.game_price}. Secure gaming with 24/7 support and fast payouts.`,
    "image": depositItem.game_image || "https://ik.imagekit.io/luckycharm/default-game.jpg",
    "brand": {
      "@type": "Brand",
      "name": "Lucky Charm Sweep"
    },
    "category": "Online Gaming",
    "sku": `game-${depositItem.id}`,
    "offers": {
      "@type": "Offer",
      "url": `https://www.luckycharmsweep.com/deposit?game=${depositItem.id}`,
      "priceCurrency": "USD",
      "price": depositItem.game_price,
      "priceValidUntil": "2025-12-31",
      "availability": depositItem.status === "online" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Lucky Charm Sweep",
        "url": "https://www.luckycharmsweep.com"
      },
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
          },
          "transitTime": {
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
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
        "merchantReturnDays": 0,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Gaming Player"
        },
        "reviewBody": `Great experience playing ${depositItem.game_name}. Fast deposits and reliable payouts.`
      }
    ]
  });

  // Lightweight JWT expiry check; returns true if token is missing or expired
  const isTokenExpired = (jwt) => {
    if (!jwt || typeof jwt !== "string") return true
    const parts = jwt.split(".")
    if (parts.length !== 3) return false // Not a JWT; avoid blocking, let API validate
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
      if (!payload || !payload.exp) return false
      const nowSec = Math.floor(Date.now() / 1000)
      return payload.exp <= nowSec
    } catch (e) {
      return false
    }
  }

  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "")

    if (raw.length > 3) {
      raw = raw.slice(0, 3)
    }

    if (raw === "") {
      setCounter("")
    } else {
      setCounter(Number.parseInt(raw, 10))
    }
  }

  const handleBlur = (e) => {
    let value = Number.parseInt(e.target.value.replace(/\D/g, ""), 10)

    if (isNaN(value) || value < 10) {
      value = 10
    }

    setCounter(value)
  }

  const increment = () => {
    let currentValue = Number.parseInt(counter, 10)
    if (isNaN(currentValue)) currentValue = 0
    setCounter(currentValue + 1)
  }

  const decrement = () => {
    let currentValue = Number.parseInt(counter, 10)
    if (isNaN(currentValue)) currentValue = 10
    setCounter(Math.max(currentValue - 1, 10))
  }

  const viewCart = () => {
    navigate("/cart")
  }

  const AddToCart = async () => {
    if (depositItem && depositItem.status === "offline") {
      toast.error(`${depositItem.game_name} is currently offline and cannot be added to cart.`, {
        toastId: `offline-${depositItem.id}`, // Prevent duplicate toasts
      })
      return
    }

    const quantity = counter
    if (quantity < 10) {
      toast.error("Minimum deposit amount is $10.", {
        toastId: 'minimum-deposit-error', // Prevent duplicate toasts
      })
      return
    }

    const itemDetails = {
      gameID: depositItem.id,
      item_name: depositItem.game_name,
      quantity: quantity,
      price: depositItem.game_price,
    }

    // If no token, redirect to login page with guest checkout option
    if (!token) {
      navigate('/login', { state: { from: '/cart', guestCheckout: true } })
      return
    }

    const activeToken = token
    const shouldSyncWithApi = Boolean(activeToken) && !isTokenExpired(activeToken)

    try {
      // Optimistic update for both guest and authenticated flows.
      dispatch(addToCart({ id: depositItem.id, quantity }))

      if (shouldSyncWithApi) {
      await ApiHandler(
        EXTRA_ENDPOINTS.CART_ADD_ABANDONED,
        "POST",
        JSON.stringify(itemDetails),
        activeToken,
        dispatch,
        navigate,
        { autoLogout: true }
      )
      }

      // Confirm operation on success
      dispatch(confirmCartOperation({ id: depositItem.id }))

      toast.success(
        <div className="flex items-center">
          <span>Added to Cart: {depositItem.game_name}</span>
          <button
            className="ml-auto text-[#FFDD15] border border-[#FFDD15] flex justify-center items-center gap-2 px-5 font-semibold py-1 rounded-md bg-transparent hover:bg-[#FFDD15] hover:text-black transition-colors"
            onClick={viewCart}
          >
            View Cart
          </button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
          toastId: `add-to-cart-${depositItem.id}`, // Prevent duplicate toasts
        },
      )
    } catch (error) {
      // Rollback optimistic update
      dispatch(rollbackCartOperation({ id: depositItem.id, operation: "adding" }))
      handleApiError(error, "Failed to add item to cart. Please try again.", { autoLogout: true })
    }
  }

  const RemoveFromCart = async () => {
    // Capture previous cart item for rollback
    const previousItem = cart.find((g) => g && g.id === depositItem.id)
    try {
      dispatch(removeFromCart({ id: depositItem.id }))
      await ApiHandler(
        EXTRA_ENDPOINTS.CART_REMOVE_ABANDONED,
        "POST",
        JSON.stringify({ gameID: [depositItem.id] }),
        token,
        dispatch,
        navigate,
        { autoLogout: true }
      )
      dispatch(confirmCartOperation({ id: depositItem.id }))
      toast.success("Item removed from cart successfully!", {
        toastId: `remove-from-cart-${depositItem.id}`, // Prevent duplicate toasts
      })
    } catch (error) {
      // Rollback on failure
      dispatch(
        rollbackCartOperation({ id: depositItem.id, operation: "removing", previousState: previousItem })
      )
      handleApiError(error, "Failed to remove item from cart. Please try again.", { autoLogout: true })
    }
  }

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success(`${fieldName} copied to clipboard!`, {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
          })
        })
        .catch((err) => {
          logger.error("Failed to copy text: ", err)
          toast.error(`Failed to copy ${fieldName}. Please try again.`, {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          })
        })
    } else {
      // Fallback for older browsers 
      try {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textarea)

        if (successful) {
          toast.success(`${fieldName} copied to clipboard!`, {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
          })
        } else {
          throw new Error("Copy command failed")
        }
      } catch (err) {
        logger.error("Fallback copy failed: ", err)
        toast.error(`Failed to copy ${fieldName}. Please copy manually.`, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        })
      }
    }
  }

  const hasCredentials = userGame && userGame.username && userGame.password

  return (
    <>
      {/* Product Schema for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateProductSchema())}
        </script>
      </Helmet>

      <div 
        className="rounded-3xl w-full h-[470px] flex flex-col shadow-lg"
        itemScope
        itemType="https://schema.org/Product"
      >
        <meta itemProp="name" content={depositItem.game_name} />
        <meta itemProp="description" content={`Play ${depositItem.game_name} with instant deposits starting at $${depositItem.game_price}`} />
        <meta itemProp="sku" content={`game-${depositItem.id}`} />
        
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="url" content={`https://www.luckycharmsweep.com/deposit?game=${depositItem.id}`} />
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="price" content={depositItem.game_price} />
          <meta itemProp="availability" content={depositItem.status === "online" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
        </div>

        <div
          className="w-full h-[200px] overflow-hidden rounded-t-3xl border-t-2 border-r-2 border-l-2 border-[#FFDD15]"
          style={{
            background: "linear-gradient(164deg, rgb(80 26 198) 0%, rgb(140 83 222) 100%)",
          }}
        >
          <img
          src={depositItem.game_image || "/placeholder.svg"}
          alt={`${depositItem.game_name} - Online Sweepstakes Game`}
          className="w-full h-full object-contain"
          itemProp="image"
          loading="lazy"
        />
      </div>
<div className="bg-[#222222] flex flex-col justify-between flex-grow gap-3 py-3 px-3 rounded-bl-2xl rounded-br-2xl border-b-[3px] border-x-2 border-[#FFDD15] relative">
{depositItem.bonus_percent > 0 && (
    <div className="absolute top-0 right-3 bg-[#FFC700] text-[#0E0E0E] text-sm font-extrabold px-3 py-1 rounded-full shadow-xl transform rotate-3 animate-bounce z-10">
        +{depositItem.bonus_percent}% BONUS!
    </div>
)}   
    <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col justify-center text-left flex-grow min-w-0">
            <p className="text-white font-semibold text-lg leading-tight truncate" title={depositItem.game_name}>
              {depositItem.game_name}
            </p>
            <div
              className="flex items-center mt-1 mb-1 cursor-default"
              title={
                depositItem.status === "online"
                  ? "This game is online, fully functional, and ready to play."
                  : "This game is currently offline and temporarily unavailable."
              }
            >
              <span
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  depositItem.status === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span
                className={`text-xs font-medium ${depositItem.status === "online" ? "text-green-400" : "text-red-400"}`}
              >
                {depositItem.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
            <p className="text-[#01D370] font-bold text-xl leading-snug">${depositItem.game_price}</p>
          </div>

          <div
            onClick={() => toggleFavorite(depositItem.id)}
            className="flex flex-col items-center justify-center bg-[#121212] border border-[#2a2a2a] rounded-lg px-2 py-2 cursor-pointer hover:bg-[#1e1e1e] transition w-16 h-[64px] flex-shrink-0"
          >
            <span className="text-white text-lg leading-none">
              {favorites.includes(String(depositItem.id)) ? "❤️" : "🤍"}
            </span>
            <span className="text-[#9e9e9e] text-[10px] mt-1 whitespace-nowrap leading-none text-center">
              {favorites.includes(String(depositItem.id)) ? "Favourited" : "Add to fav"}
            </span>
          </div>
        </div>

        <GameBadges
          offers={{
            limited_offer: depositItem.limited_offer,
            bonus_percent: depositItem.bonus_percent,
            top_pick: depositItem.top_pick,
            fan_favorite: depositItem.fan_favorite,
            new_and_hot: depositItem.new_and_hot,
            high_win_rate: depositItem.high_win_rate,
            mystery_bonus: depositItem.mystery_bonus,
            popular_today: depositItem.popular_today,
            trending: depositItem.trending,
            platform_name: depositItem.platform_name,
            total_games: depositItem.total_games,
          }}
        />

        {token && hasCredentials && (
          <div className="flex flex-col gap-2 text-white text-sm bg-[#1A1A1A] p-3 rounded-md border border-[#FFC700]">
            <div className="flex items-center justify-between">
              <p>
                <strong className="text-[#FFDD15]">Username:</strong> {userGame.username}
              </p>
              <button
                onClick={() => copyToClipboard(userGame.username, "Username")}
                className="ml-2 p-1 rounded hover:bg-[#333333] transition"
                title="Copy username"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v1.006a1.125 1.125 0 0 1-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m1.5 0V5.25A1.125 1.125 0 0 1 9.375 4.125h5.25a1.125 1.125 0 0 1 1.125 1.125v3.625m-7.5 0H7.5m7.5 0H12m-7.5 0h-1.5M12 9h.008v.008H12zM12 12h.008v.008H12zM12 15h.008v.008H12z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p>
                <strong className="text-[#FFDD15]">Password:</strong> {userGame.password}
              </p>
              <button
                onClick={() => copyToClipboard(userGame.password, "Password")}
                className="ml-2 p-1 rounded hover:bg-[#333333] transition"
                title="Copy password"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v1.006a1.125 1.125 0 0 1-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m1.5 0V5.25A1.125 1.125 0 0 1 9.375 4.125h5.25a1.125 1.125 0 0 1 1.125 1.125v3.625m-7.5 0H7.5m7.5 0H12m-7.5 0h-1.5M12 9h.008v.008H12zM12 12h.008v.008H12zM12 15h.008v.008H12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center bg-[#1A1A1A] border border-[#FFC700] rounded-md w-28 h-10 px-2">
          <input
            type="text"
            value={counter === "" ? "" : String(counter)}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={depositItem.is_game_add || depositItem.status === "offline"}
            className={`bg-transparent text-white text-center outline-none w-full font-semibold ${
              depositItem.is_game_add || depositItem.status === "offline" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <div className="flex flex-col justify-center items-center border-l border-[#FFC700] pl-2">
            <UpArrow
              className={`w-4 mb-[2px] cursor-pointer ${
                depositItem.is_game_add || depositItem.status === "offline"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-75"
              }`}
              onClick={() => !(depositItem.is_game_add || depositItem.status === "offline") && increment()}
            />
            <DownArrow2
              className={`w-4 mt-[2px] cursor-pointer ${
                depositItem.is_game_add || depositItem.status === "offline"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-75"
              }`}
              onClick={() => !(depositItem.is_game_add || depositItem.status === "offline") && decrement()}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {depositItem.is_game_add ? (
            <button
              className="text-[#FFDD15] border border-[#FFDD15] flex justify-center items-center gap-2 px-5 font-semibold py-2 rounded-md bg-transparent hover:bg-[#FFDD15] hover:text-black transition-colors"
              onClick={RemoveFromCart}
            >
              <span>Remove From Cart</span>
            </button>
          ) : (
            <button
              className={`bg-[#FFDD15] text-[#0E0E0E] flex justify-center items-center gap-2 px-5 font-semibold py-2 rounded-md transition-colors ${
                depositItem.status === "offline" ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d4b000]"
              }`}
              onClick={AddToCart}
              disabled={depositItem.status === "offline"}
              itemProp="potentialAction"
              itemScope
              itemType="https://schema.org/BuyAction"
            >
              <meta itemProp="target" content={`https://www.luckycharmsweep.com/deposit?game=${depositItem.id}`} />
              <meta itemProp="price" content={depositItem.game_price} />
              <meta itemProp="priceCurrency" content="USD" />
              <span>Add To Cart</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              if (depositItem.status !== "offline") {
                onPlayGame(depositItem.game_url, depositItem.game_name);
              }
            }}
            className={`text-[#f3efefba] font-semibold text-sm text-center ${
              depositItem.status === "offline"
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-[#FFDD15] cursor-pointer"
            }`}
            disabled={depositItem.status === "offline"}
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default DepositCard
