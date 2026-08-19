"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from 'react-helmet-async'
import PaymentButton from "../PaymentButtontwo"
import BitCoinLogo from "../../assets/image/bitcoin.png"
import WalletLogo from "../../assets/image/wallet.png"
import DogeCoinLogo from "../../assets/image/dogecoin.png"
import DollarIcon from "../../assets/image/dollarIcon.png"
import LitecoinLogo from "../../assets/image/Litecoin.png"
import cashAppLogo from "../../assets/image/cashApp.png"
// Note: Add USDT logo image to assets/image folder if you have one
// For now, we'll use DollarIcon as placeholder for USDT
import CryptoInstructionsModal from "../CryptoInstructionsModal"
import SEOComponent from "../Common/SEOComponent"
import { API_ENDPOINTS } from "../../config/apiEndpoints"

import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { setLevelDataState } from "../../redux/slice/authSlice"
import Loading from "../Common/Loading"
import { ApiHandler } from "../../helper/ApiHandler"
import PaypalCheckoutButton from "../../components/PaypalCheckoutButton"
import PayPalErrorBoundary from "../../components/PayPalErrorBoundary"
import Cookies from "js-cookie"

const CheckOutMain = ({ cartData, userData }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoCodeData, setPromoCodeData] = useState({
    promoCodeAmount: "",
    promoCodePercentage: "",
  })
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false)
const [showGameBonusTooltip, setShowGameBonusTooltip] = useState(false)
  const [bonuses, setBonuses] = useState({
    weeklyChallengePercentage: 0,
    depositBonuses: {},
    registrationBonusPercentage: 0,
    gameSpecificBonuses: {},
  })

  const { main_balance, bonus_balance, activeLevel, token, user } = useSelector((state) => state.auth)

  const mainBalance = main_balance
  const bonusBalance = bonus_balance
  const bonusLevel = activeLevel

  const FindGetActiveLevel = async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.BONUS.GET_LEVEL, "POST", undefined, token, dispatch, navigate)
      if (response.data && response.data.status.code === 1) {
        const enrichedData = response.data.data
        dispatch(setLevelDataState(enrichedData))
      } else {
        console.error("Failed to fetch bonus levels: Invalid response")
      }
    } catch (error) {
      console.error("Failed to fetch bonus levels:", error)
    }
  }

  useEffect(() => {
    if (!bonusLevel) {
      if (token) {
        FindGetActiveLevel()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bonusLevel, token])

  const fetchBonuses = async () => {
    try {
      setLoading(true)
      const response = await ApiHandler(
        API_ENDPOINTS.GAME.VALIDATE,
        "POST",
        {
          game_data: cartData.map((game) => ({
            game_id: game.id,
          })),
        },
        token,
        dispatch,
        navigate,
      )

      const depositBonuses = {}

      response?.data?.data?.coupons?.forEach((coupon) => {
        const gameId = coupon.game_id
        const couponBalance = Number.parseFloat(coupon.coupon_balance)

        if (depositBonuses[gameId]) {
          depositBonuses[gameId] += couponBalance
        } else {
          depositBonuses[gameId] = couponBalance
        }
      })

      cartData.forEach((game) => {
        if (depositBonuses[game.id] !== undefined) {
          game.bonus = depositBonuses[game.id]
        }
      })

      const weeklyChallengePercentage = response?.data?.data?.weekly?.bonus_percentage / 100 || 0

      setBonuses({
        weeklyChallengePercentage,
        depositBonuses,
        registrationBonusPercentage: response?.data?.data?.first_deposit_bonus
          ? response?.data?.data?.first_deposit_bonus
          : 0,
          // FIX 2: Store the fetched game specific bonuses
        gameSpecificBonuses: response?.data?.data?.game_specific_bonuses || {},
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching bonuses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBonuses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData])

  const totalAmount = cartData.reduce((acc, game) => acc + game.game_price * game.quantity, 0)

  const weeklyChallengeBonusAmount = totalAmount * bonuses.weeklyChallengePercentage

  const bonusPercentage = Number.parseFloat(bonusLevel?.bonus) || 0
  const BonusLevelAmount = (totalAmount * bonusPercentage) / 100

  const totalDepositBonusAmount = Object.values(bonuses.depositBonuses).reduce((acc, bonus) => acc + bonus, 0)
// FIX 3: Calculate the total amount for game-specific percentage bonuses
  const totalGameSpecificBonusAmount = cartData.reduce((acc, game) => {
      const gameSpecificPercentage = Number.parseFloat(bonuses.gameSpecificBonuses[game.id]) || 0
      const gameTotal = game.game_price * game.quantity
      return acc + (gameTotal * (gameSpecificPercentage / 100))
  }, 0)
// Logic to generate content for the custom tooltip
const gameBonusDetailsContent = cartData
    .map(game => {
        const gameSpecificPercentage = Number.parseFloat(bonuses.gameSpecificBonuses[game.id]) || 0;
        if (gameSpecificPercentage > 0) {
            const gameTotal = game.game_price * game.quantity;
            const gameSpecificAmount = gameTotal * (gameSpecificPercentage / 100);
            // Return a JSX element for rendering in the popup
            return (
                <div key={game.id} className="mt-1">
                    - {game.game_name}: {gameSpecificPercentage}% (${gameSpecificAmount.toFixed(2)})
                </div>
            );
        }
        return null;
    })
    .filter(detail => detail !== null);

// Handle case where no bonuses are applied for the custom tooltip content
const finalGameBonusContent = gameBonusDetailsContent.length > 0 ? (
    <>
        <p className="font-semibold mb-1 border-b border-gray-700 pb-1">Bonus Breakdown:</p>
        {gameBonusDetailsContent}
    </>
) : (
    <p>No game specific bonuses applied.</p>
);

  const adjustedTotalAmount = totalAmount + totalDepositBonusAmount

  const totalAfterBonuses = adjustedTotalAmount + weeklyChallengeBonusAmount

  const originalAmount =
    totalAmount +
    totalDepositBonusAmount +
    weeklyChallengeBonusAmount +
    BonusLevelAmount +
    bonuses.registrationBonusPercentage +
    totalGameSpecificBonusAmount

  const discountAmount = totalAmount * (discount || 0)
  const finalTotal = totalAmount - discountAmount
  const isCashAppDisabled = finalTotal < 20.00

const allowedAmounts = [19.99, 24.99, 30.99, 39.99, 49.99, 59.99, 99.99, 124.99, 129.99, 149.99, 199.99, 300.00, 400.00, 500.00]
//const allowedAmounts = [20000]
  const findClosestAmount = (amount) => {
    let closest = allowedAmounts[0]
    let minDiff = Math.abs(amount - closest)

    for (const allowedAmount of allowedAmounts) {
      const diff = Math.abs(amount - allowedAmount)
      if (diff < minDiff) {
        minDiff = diff
        closest = allowedAmount
      }
    }

    return { closest, diff: minDiff }
  }

  const { closest: closestAmount, diff: amountDiff } = findClosestAmount(finalTotal)
  const canUseAppleGooglePay = amountDiff <= 1
  const adjustedPayAmount = canUseAppleGooglePay ? closestAmount : finalTotal

  const handlePromoCodeSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.VERIFY_PROMOCODE,
        "POST",
        { promocode: promoCode },
        token,
        dispatch,
        navigate,
      )

      if (response?.data?.status?.code === 1) {
        const promocodeData = response?.data?.data
        const discountPercentage = Number.parseFloat(promocodeData?.promocode_percentage) / 100

        setPromoCodeData({
          promoCodeAmount: totalAmount * discountPercentage,
          promoCodePercentage: promocodeData?.promocode_percentage,
        })

        setDiscount(discountPercentage)
        setPromoCode(promocodeData?.promocode)

        toast.success(`Promo code applied: ${promocodeData?.promocode_percentage}% discount`)
      } else {
        const apiMessage = response?.data?.status?.message
        if (apiMessage) {
          toast.error(apiMessage)
        }
        setPromoCodeData({
          promoCodeAmount: 0,
          promoCodePercentage: 0,
        })
        setDiscount(0)
        setPromoCode("")
      }
    } catch (error) {
      console.error("Error applying promo code:", error)
      const apiMessage = error?.response?.data?.status?.message
      if (apiMessage) {
        toast.error(apiMessage)
      }
    }
  }

  const handlePayment = (method) => {
    const cryptoBonusAmount = method === "BTC" || method === "BTCLN" || method === "LTC" || method === "DOGE" || method === "USDT" ? totalAmount * 0.1 : 0

    navigate("/user/deposits/amount", {
      state: {
        isCheckoutAllowed: true,
        cartDataState: cartData,
        totalAmountState: originalAmount,
        method: method,
        discountamount: totalAmount * Number.parseFloat(discount),
        discount: discount,
        bonuses: bonuses,
        totalDepositBonusAmount: totalDepositBonusAmount,
        weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
        totalAfterBonuses: totalAfterBonuses,
        finalTotal: finalTotal,
        promoCode: promoCode,
        promoCodeData: promoCodeData,
        BonusLevelAmount: BonusLevelAmount,
        registrationBonusPercentage: bonuses.registrationBonusPercentage,
        cryptoBonusAmount: cryptoBonusAmount,
        totalAmount: totalAmount,
      },
    })
  }

  const handleSuccess = async (orderId, sellerProtectionData) => {
    console.log("=== PayPal Payment Processing Started ===");
    console.log("PayPal Order ID:", orderId);
    
    const amount = finalTotal
    const totalAmount = originalAmount
    const baseTotalAmount = totalAmount
    const gameDetails = cartData.map((game) => ({
      game_name: game.game_name || "",
      game_id: game.id || "",
      price: game.game_price ? Number.parseFloat(game.game_price) : "",
      quantity: game.quantity ? Number.parseFloat(game.quantity) : "",
      total: Number.parseFloat(game.quantity * (game.game_price || game.price)),
      deposit_bonus: game.bonus ? Number.parseFloat(game.bonus) : "",
      platformsID: game.platforms_id || "",
    }))

    const payload = {
      email: userData?.email || '',
      phone: userData?.phone || '',
      amount: amount,
      promocode: promoCode,
      promocodeDiscount: promoCodeData.promoCodePercentage
        ? Number.parseFloat(promoCodeData.promoCodePercentage)
        : "",
      discountamount: promoCodeData.promoCodeAmount ? Number.parseFloat(promoCodeData.promoCodeAmount) : "",
      totalamount: totalAmount,
      payment_type: "PayPal",
      paypal_order_id: orderId,
      weekly_challenge_bonus: weeklyChallengeBonusAmount ? Number.parseFloat(weeklyChallengeBonusAmount) : "",
      base_total_amount: baseTotalAmount ? Number.parseFloat(baseTotalAmount) : 0,
      game_detail: gameDetails,
      account_level_bonus: BonusLevelAmount ? Number.parseFloat(BonusLevelAmount) : "",
      totalDepositBonusAmount: totalDepositBonusAmount ? Number.parseFloat(totalDepositBonusAmount) : "",
      registration_bonus_for_new_users: bonuses.registrationBonusPercentage
        ? Number.parseFloat(bonuses.registrationBonusPercentage)
        : "",
      totalAmount: totalAmount,
      utm_source: Cookies.get("utm_source") || null,
      utm_medium: Cookies.get("utm_medium") || null,
      utm_campaign: Cookies.get("utm_campaign") || null,
      // 🔒 SELLER PROTECTION: Add device/session data
      ...sellerProtectionData,
      terms_accepted_at: new Date().toISOString(),
    };

    console.log("Payload being sent to backend:", payload);

    try {
      const response = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.CREATE_NEW,
        "POST",
        payload,
        token,
        dispatch,
        navigate,
      )
      
      console.log("Backend API Response:", response);
      
      if (response?.data?.status?.code === 1) {
        console.log("✅ Order successfully saved to database");
        toast.success("Order received! Processing your payment via PayPal...")
        navigate('/user/deposits') // Navigate to deposits page to view PENDING status
      } else {
        console.error("❌ Backend returned error:", response?.data?.status);
        toast.error(response?.data?.status?.message || "Failed to save order to database")
        throw new Error(response?.data?.status?.message || "Database save failed");
      }
      return response
    } catch (error) {
      console.error("=== PayPal Payment Processing Failed ===");
      console.error("Error details:", error);
      console.error("Error response:", error?.response);
      toast.error("Failed to process deposit. Please contact support with PayPal Order ID: " + orderId)
      throw error
    }
  }

  const handleError = (error) => {
    toast.error("Payment failed. Please try again.")
  }


  const handleWalletClick = (method) => {
    if (mainBalance && mainBalance >= finalTotal) {
      navigate("/user/deposits/amount", {
        state: {
          isCheckoutAllowed: true,
          cartDataState: cartData,
          totalAmountState: originalAmount,
          method: method,
          discountamount: totalAmount * Number.parseFloat(discount),
          discount: discount,
          bonuses: bonuses,
          totalDepositBonusAmount: totalDepositBonusAmount,
          weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
          totalAfterBonuses: totalAfterBonuses,
          finalTotal: finalTotal,
          promoCode: promoCode,
          promoCodeData: promoCodeData,
          BonusLevelAmount: BonusLevelAmount,
          registrationBonusPercentage: bonuses.registrationBonusPercentage,
          totalAmount: totalAmount,
        },
      })
    } else {
      toast.error("Insufficient balance in wallet")
    }
  }

  const handleBonusClick = () => {
    if (bonusBalance && bonusBalance >= finalTotal) {
      navigate("/user/deposits/amount", {
        state: {
          isCheckoutAllowed: true,
          cartDataState: cartData,
          totalAmountState: originalAmount,
          method: "Bonus",
          discountamount: totalAmount * Number.parseFloat(discount),
          discount: discount,
          bonuses: bonuses,
          totalDepositBonusAmount: totalDepositBonusAmount,
          weeklyChallengeBonusAmount: weeklyChallengeBonusAmount,
          totalAfterBonuses: totalAfterBonuses,
          finalTotal: finalTotal,
          promoCode: promoCode,
          promoCodeData: promoCodeData,
          BonusLevelAmount: BonusLevelAmount,
          registrationBonusPercentage: bonuses.registrationBonusPercentage,
          totalAmount: totalAmount,
        },
      })
    } else {
      toast.error("Insufficient balance in bonus")
    }
  }
const handleCashAppClick = async () => {
    if (isCashAppDisabled) {
        toast.info("A minimum of $20.00 is required for Cash App payments.")
        return
    }

    try {
        setLoading(true)
        const amount = Number.parseFloat(finalTotal.toFixed(2))

        const gameDetails = cartData.map((game) => ({
            game_name: game.game_name || "",
            game_id: game.id || "",
            price: game.game_price ? Number.parseFloat(game.game_price) : 0,
            quantity: game.quantity ? Number.parseInt(game.quantity) : 0,
            total: Number.parseFloat(game.quantity * (game.game_price || game.price)),
            deposit_bonus: game.bonus ? Number.parseFloat(game.bonus) : 0,
            platformsID: game.platforms_id || "",
        }))

        // Step 1: Create the Order ID and initial payment entry
        const orderResponse = await ApiHandler(
            API_ENDPOINTS.DEPOSIT.CREATE_NEW,
            "POST",
            {
                email: userData?.email || '',
                phone: userData?.phone || '',
                amount: amount,
                promocode: promoCode,
                promocodeDiscount: promoCodeData.promoCodePercentage ? Number.parseFloat(promoCodeData.promoCodePercentage) : "",
                discountamount: promoCodeData.promoCodeAmount ? Number.parseFloat(promoCodeData.promoCodeAmount) : "",
                totalamount: originalAmount,
                payment_type: "CashApp", // Use "CashApp" here
                weekly_challenge_bonus: weeklyChallengeBonusAmount ? Number.parseFloat(weeklyChallengeBonusAmount) : "",
                base_total_amount: totalAmount ? Number.parseFloat(totalAmount) : 0,
                game_detail: gameDetails,
                account_level_bonus: BonusLevelAmount ? Number.parseFloat(BonusLevelAmount) : "",
                totalDepositBonusAmount: totalDepositBonusAmount ? Number.parseFloat(totalDepositBonusAmount) : "",
                registration_bonus_for_new_users: bonuses.registrationBonusPercentage ? Number.parseFloat(bonuses.registrationBonusPercentage) : "",
                utm_source: Cookies.get("utm_source") || null,
                utm_medium: Cookies.get("utm_medium") || null,
                utm_campaign: Cookies.get("utm_campaign") || null,
            },
            token,
            dispatch,
            navigate,
        )

        if (orderResponse?.data?.status?.code !== 1) {
            toast.error(orderResponse?.data?.status?.message || "Failed to create CashApp order")
            setLoading(false)
            return
        }
        
        const internalOrderId = orderResponse?.data?.data?.order_id;

        // Step 2: Generate the payment link using the unified hosted endpoint
        const paymentResponse = await ApiHandler(
            API_ENDPOINTS.DEPOSIT.GENERATE_HOSTED_PAYMENT,
            "POST",
            {
                amount: amount,
                wayCode: "ecashapp", // CRITICAL: Use the configured CashApp code
                items: gameDetails,
                internal_order_id: internalOrderId, // Pass the server-generated ID
            },
            token,
            dispatch,
            navigate,
        )

        if (paymentResponse?.data?.status?.code === 1 && paymentResponse?.data?.data?.cashierUrl) {
            toast.success("Redirecting to Cash App checkout...")
            // Step 3: Redirect the user directly
            window.location.href = paymentResponse.data.data.cashierUrl
        } else {
            const errorMsg = paymentResponse?.data?.status?.message || "Failed to generate Cash App payment link. Please try again."
            toast.error(errorMsg)
            setLoading(false)
        }
    } catch (error) {
        console.error("Error processing CashApp hosted payment:", error)
        toast.error("Failed to process Cash App payment. Please try again.")
        setLoading(false)
    }
}
  const handleApplePay = async () => {
    if (!canUseAppleGooglePay) {
      toast.error("Amount not supported for Apple Pay")
      return
    }

    try {
      setLoading(true)
      const amount = Number.parseFloat(adjustedPayAmount.toFixed(2))

      const gameDetails = cartData.map((game) => ({
        game_name: game.game_name || "",
        game_id: game.id || "",
        price: game.game_price ? Number.parseFloat(game.game_price) : 0,
        quantity: game.quantity ? Number.parseInt(game.quantity) : 0,
        total: Number.parseFloat(game.quantity * (game.game_price || game.price)),
        deposit_bonus: game.bonus ? Number.parseFloat(game.bonus) : 0,
        platformsID: game.platforms_id || "",
      }))

      const cryptoBonusAmount = 0 // No crypto bonus for Apple Pay

      // Submit the full order first
      const orderResponse = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.CREATE_NEW,
        "POST",
        {
          email: userData?.email || '',
          phone: userData?.phone || '',
          amount: amount,
          promocode: promoCode,
          promocodeDiscount: promoCodeData.promoCodePercentage
            ? Number.parseFloat(promoCodeData.promoCodePercentage)
            : "",
          discountamount: promoCodeData.promoCodeAmount ? Number.parseFloat(promoCodeData.promoCodeAmount) : "",
          totalamount: originalAmount,
          payment_type: "Apple Pay",
          weekly_challenge_bonus: weeklyChallengeBonusAmount ? Number.parseFloat(weeklyChallengeBonusAmount) : "",
          base_total_amount: totalAmount ? Number.parseFloat(totalAmount) : 0,
          game_detail: gameDetails,
          account_level_bonus: BonusLevelAmount ? Number.parseFloat(BonusLevelAmount) : "",
          totalDepositBonusAmount: totalDepositBonusAmount ? Number.parseFloat(totalDepositBonusAmount) : "",
          registration_bonus_for_new_users: bonuses.registrationBonusPercentage
            ? Number.parseFloat(bonuses.registrationBonusPercentage)
            : "",
          crypto_bonus: cryptoBonusAmount,
          utm_source: Cookies.get("utm_source") || null,
          utm_medium: Cookies.get("utm_medium") || null,
          utm_campaign: Cookies.get("utm_campaign") || null,
        },
        token,
        dispatch,
        navigate,
      )

      if (orderResponse?.data?.status?.code !== 1) {
        toast.error(orderResponse?.data?.status?.message || "Failed to create order")
        setLoading(false)
        return
      }
// 1. CAPTURE THE INTERNAL ORDER ID from the server's response
            const internalOrderId = orderResponse?.data?.data?.order_id;
            if (!internalOrderId) {
                toast.error("Order created but no ID returned for payment link.")
                setLoading(false)
                return;
            }
            
      // Now generate the payment link
      const paymentResponse = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.GENERATE_HOSTED_PAYMENT,
        "POST",
        {
          amount: amount,
          wayCode: "applepay",
          items: gameDetails,
          internal_order_id: internalOrderId,
        },
        token,
        dispatch,
        navigate,
      )

      if (paymentResponse?.data?.status?.code === 1 && paymentResponse?.data?.data?.cashierUrl) {
        toast.success("Redirecting to Apple Pay...")
        // Redirect to payment provider
        window.location.href = paymentResponse.data.data.cashierUrl
      } else {
        const errorMsg = paymentResponse?.data?.status?.message || "Failed to generate payment link. Please try again."
        toast.error(errorMsg)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error processing Apple Pay:", error)
      toast.error("Failed to process Apple Pay. Please try again.")
      setLoading(false)
    }
  }

const handleGooglePay = async () => {
    if (!canUseAppleGooglePay) {
      toast.error("Amount not supported for Google Pay")
      return
    }

    try {
      setLoading(true)
      const amount = Number.parseFloat(adjustedPayAmount.toFixed(2))

      const gameDetails = cartData.map((game) => ({
        game_name: game.game_name || "",
        game_id: game.id || "",
        price: game.game_price ? Number.parseFloat(game.game_price) : 0,
        quantity: game.quantity ? Number.parseInt(game.quantity) : 0,
        total: Number.parseFloat(game.quantity * (game.game_price || game.price)),
        deposit_bonus: game.bonus ? Number.parseFloat(game.bonus) : 0,
        platformsID: game.platforms_id || "",
      }))

      const cryptoBonusAmount = 0 // No crypto bonus for Google Pay

      // Submit the full order first
      const orderResponse = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.CREATE_NEW,
        "POST",
        {
          email: userData?.email || '',
          phone: userData?.phone || '',
          amount: amount,
          promocode: promoCode,
          promocodeDiscount: promoCodeData.promoCodePercentage
            ? Number.parseFloat(promoCodeData.promoCodePercentage)
            : "",
          discountamount: promoCodeData.promoCodeAmount ? Number.parseFloat(promoCodeData.promoCodeAmount) : "",
          totalamount: originalAmount,
          payment_type: "Google Pay",
          weekly_challenge_bonus: weeklyChallengeBonusAmount ? Number.parseFloat(weeklyChallengeBonusAmount) : "",
          base_total_amount: totalAmount ? Number.parseFloat(totalAmount) : 0,
          game_detail: gameDetails,
          account_level_bonus: BonusLevelAmount ? Number.parseFloat(BonusLevelAmount) : "",
          totalDepositBonusAmount: totalDepositBonusAmount ? Number.parseFloat(totalDepositBonusAmount) : "",
          registration_bonus_for_new_users: bonuses.registrationBonusPercentage
            ? Number.parseFloat(bonuses.registrationBonusPercentage)
            : "",
          crypto_bonus: cryptoBonusAmount,
          utm_source: Cookies.get("utm_source") || null,
          utm_medium: Cookies.get("utm_medium") || null,
          utm_campaign: Cookies.get("utm_campaign") || null,
        },
        token,
        dispatch,
        navigate,
      )

      if (orderResponse?.data?.status?.code !== 1) {
        toast.error(orderResponse?.data?.status?.message || "Failed to create order")
        setLoading(false)
        return
      }
      
      // 1. CAPTURE THE INTERNAL ORDER ID from the server's response
      const internalOrderId = orderResponse?.data?.data?.order_id; // <-- ADD THIS
      if (!internalOrderId) { // <-- ADD THIS BLOCK
          toast.error("Order created but no ID returned for payment link.")
          setLoading(false)
          return;
      }

      // Now generate the payment link
      const paymentResponse = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.GENERATE_HOSTED_PAYMENT,
        "POST",
        {
          amount: amount,
          wayCode: "googlepay",
          items: gameDetails,
          internal_order_id: internalOrderId, // This will now be correctly defined
        },
        token,
        dispatch,
        navigate,
      )

      if (paymentResponse?.data?.status?.code === 1 && paymentResponse?.data?.data?.cashierUrl) {
        toast.success("Redirecting to Google Pay...")
        // Redirect to payment provider
        window.location.href = paymentResponse.data.data.cashierUrl
      } else {
        const errorMsg = paymentResponse?.data?.status?.message || "Failed to generate payment link. Please try again."
        toast.error(errorMsg)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error processing Google Pay:", error)
      toast.error("Failed to process Google Pay. Please try again.")
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }
  const paypalPrice = Number.parseFloat(((finalTotal + 0.0) / (1 - 0.0)).toFixed(2))

  // Generate Order schema for checkout
  const generateOrderSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Order",
      "orderNumber": `ORDER-${Date.now()}`,
      "orderStatus": "https://schema.org/OrderProcessing",
      "orderDate": new Date().toISOString(),
      "customer": {
        "@type": "Person",
        "name": userData?.name || "Customer"
      },
      "merchant": {
        "@type": "Organization",
        "name": "LuckCharm",
        "url": "https://luckcharm.com"
      },
      "orderedItem": cartData.map(game => ({
        "@type": "OrderItem",
        "orderItemNumber": game.id,
        "orderQuantity": game.quantity,
        "orderedItem": {
          "@type": "Product",
          "name": game.game_name,
          "category": "Gaming Credits",
          "offers": {
            "@type": "Offer",
            "price": game.game_price,
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
            "reviewCount": "95"
          }
        },
        "orderItemStatus": "https://schema.org/OrderProcessing",
        "price": game.game_price,
        "priceCurrency": "USD"
      })),
      "totalPaymentDue": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": finalTotal.toFixed(2)
      },
      "paymentMethod": [
        {
          "@type": "PaymentMethod",
          "name": "Credit Card"
        },
        {
          "@type": "PaymentMethod", 
          "name": "PayPal"
        },
        {
          "@type": "PaymentMethod",
          "name": "Cryptocurrency"
        }
      ]
    };
  };

  return (
    <>
      <SEOComponent
        title="Checkout - Complete Your Order | LuckCharm Gaming"
        description="Secure checkout for your gaming credits. Multiple payment options including credit card, PayPal, and cryptocurrency."
        keywords="checkout, secure payment, gaming credits, order summary, PayPal, cryptocurrency"
        ogType="website"
        structuredData={generateOrderSchema()}
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateOrderSchema())}
        </script>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

    <div className="flex flex-wrap justify-between p-4 md:p-8 items-start">
      <CryptoInstructionsModal isOpen={isCryptoModalOpen} onClose={() => setIsCryptoModalOpen(false)} />

      <div
        className="w-full lgs:w-[50%] bg-[#1f2937] p-3 md:p-6 rounded-lg"
        style={{ borderColor: "rgba(255, 255, 255, 0.16)", borderWidth: "1px" }}
      >
        <h2 className="text-white text-2xl md:text-4xl font-bold mb-4">Checkout</h2>
        <table className="w-full text-white">
          <thead>
            <tr className="text-sm md:text-lg font-semibold">
              <th className="text-left p-2">NAME</th>
              <th className="text-left p-2">PRICE</th>
              <th className="text-left p-2">QUANTITY</th>
              <th className="p-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {cartData.map((game, index) => {
              const gameTotal = game.game_price * game.quantity
              const depositBonusAmount = bonuses.depositBonuses[game.id] || 0
              // FIX 5: Get and calculate the game-specific bonus amount
              const gameSpecificPercentage = bonuses.gameSpecificBonuses[game.id] || 0
              // eslint-disable-next-line no-unused-vars
              const gameSpecificAmount = gameTotal * (Number.parseFloat(gameSpecificPercentage) / 100)
              return (
                <tr key={index} className="border-b border-gray-700 text-sm md:text-base font-semibold md:font-medium">
                  <td className="p-2">{game.game_name}</td>
                  <td className="p-2">${Number.parseFloat(game.game_price).toFixed(2)}</td>
                  <td className="p-2">{game.quantity}</td>
                  <td className="p-2 text-right">
                    ${gameTotal.toFixed(2)} <br />
                    {depositBonusAmount ? (
                      <p className="text-yellow-400">Deposit Bonus ${depositBonusAmount.toFixed(2)}</p>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="text-right text-white text-sm md:text-base mt-4 font-bold">
          Total: ${totalAmount.toFixed(2)}
        </div>
        {totalDepositBonusAmount > 0 && (
          <div className="text-right text-yellow-400 font-bold">
            Total Deposit Bonuses: ${totalDepositBonusAmount?.toFixed(2)}
          </div>
        )}
      
{totalGameSpecificBonusAmount > 0 && (
    <div className="text-right text-yellow-400 font-bold relative">
        <span className="flex justify-end items-center">
            Total Game Specific Bonuses: ${totalGameSpecificBonusAmount.toFixed(2)}

            {/* Info Icon with hover events */}
            <span
                className="ml-2 cursor-pointer text-white/50 hover:text-white"
                onMouseEnter={() => setShowGameBonusTooltip(true)}
                onMouseLeave={() => setShowGameBonusTooltip(false)}
                aria-label="Show bonus breakdown info"
            >
                {/* Improved Info Circle SVG */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                             10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 
                             0-8-3.59-8-8s3.59-8 8-8 8 3.59 
                             8 8-3.59 8-8 8zm-.75-4.5h1.5v-6h-1.5v6zm0-8h1.5v-1.5h-1.5V7.5z"/>
                </svg>
            </span>
        </span>

        {/* Custom Tooltip/Popup */}
        {showGameBonusTooltip && (
            <div className="absolute right-0 top-full mt-2 w-max max-w-xs p-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs text-left z-10 shadow-xl">
                {finalGameBonusContent}
            </div>
        )}
    </div>
)}

       
        {weeklyChallengeBonusAmount > 0 && (
          <div className="text-right text-yellow-400 font-bold">
            Weekly Challenge Bonus: ${weeklyChallengeBonusAmount.toFixed(2)}
          </div>
        )}
        {bonuses?.registrationBonusPercentage > 0 && (
          <div className="text-right text-yellow-400 font-bold">
            Registration Bonus: ${bonuses?.registrationBonusPercentage.toFixed(2)}
          </div>
        )}
        {BonusLevelAmount > 0 && (
          <div className="text-right text-yellow-400 font-bold">
            Bonus Level discount: ${BonusLevelAmount.toFixed(2)}
          </div>
        )}
        {discount > 0 && (
          <div className="text-right text-green-400 font-bold">
            Discount: ${discountAmount.toFixed(2)} ({discount * 100}% Promo Code Applied)
          </div>
        )}
        <div className="text-right text-white font-bold mt-4">Final Total: ${finalTotal.toFixed(2)}</div>
      </div>

      <div
        className="w-full lgs:w-[48%] bg-[#1f2937] py-6 px-4 rounded-lg mt-4 lgs:mt-0"
        style={{ borderColor: "rgba(255, 255, 255, 0.16)", borderWidth: "1px" }}
      >
        <h3 className="text-white text-2xl sm:text-3xl font-semibold mb-4">Order Details</h3>
        <div className="text-white mb-4">
          <div className="css-17ejtfq text-sm md:text-base font-medium">
            <p>Order Total</p>
            <p className="text-right break-words">${finalTotal?.toFixed(2)}</p>
            <p>Name</p>
            <p className="text-right break-words">{userData?.first_name}</p>
            <p>Email</p>
            <p className="text-right break-words">{userData?.email}</p>
            <p>Phone</p>
            <p className="text-right break-words">{userData?.phone}</p>
          </div>
        </div>
        <div>
          <form onSubmit={handlePromoCodeSubmit}>
            <p className="text-white font-semibold text-base mb-4">Coupon Code</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Coupon Code"
                className="w-full px-2 py-3 rounded bg-[#0e1629] text-white flex-[2]"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 rounded bg-[#290a47] border border-white/15 text-white font-bold shadow-lg flex-1"
              >
                APPLY
              </button>
            </div>
          </form>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white text-lg font-semibold">Crypto Payments</h4>
            <button
              onClick={() => setIsCryptoModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Payment Guide
            </button>
          </div>

          <div className="my-3 p-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-yellow-500/40 relative overflow-hidden group">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Sparkle decoration */}
            <div className="absolute top-2 right-2 text-yellow-600 text-lg">✨</div>
            <div className="absolute bottom-2 left-2 text-yellow-600 text-lg">✨</div>
            
            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2.5 mb-1.5">
                <span className="text-3xl">💰</span>
                <p className="text-black font-black text-2xl md:text-3xl tracking-tight drop-shadow-sm">+10% BONUS</p>
                <span className="text-3xl">🚀</span>
              </div>
              <p className="text-gray-900 font-bold text-sm md:text-base tracking-wide">
                Instant Extra Value on All Crypto Deposits
              </p>
            </div>
          </div>

          {/* Low-Fee Crypto Tip */}
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md">
            <p className="text-white font-semibold text-xs mb-1">💡 Low-Fee Options:</p>
            <div className="text-white text-[10px] space-y-0.5">
              <div className="flex items-center gap-1">
                <span>⚡️</span>
                <span><span className="font-semibold">BTC Lightning</span> - Instant & ultra-low fees</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🐕</span>
                <span><span className="font-semibold">Dogecoin</span> - Very low fees & fast</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <PaymentButton
              bgColor={"#F7931A"}
              logo={BitCoinLogo}
              title={"Bitcoin"}
              onClick={() => handlePayment("BTC")}
            />
            <button
              onClick={() => handlePayment("BTCLN")}
              className="relative overflow-hidden rounded-lg p-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              style={{ backgroundColor: "#7B3FF2" }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <svg className="w-7 h-7 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Bitcoin B */}
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
                  <path d="M12 9v14M12 9h4c1.5 0 3 1 3 2.5S17.5 14 16 14M12 14h4.5c1.5 0 3 1 3 2.5S18 19 16.5 19H12M12 14v5" 
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Lightning bolt */}
                  <path d="M20 10l-3.5 5h2l-3.5 6 3.5-6h-2l3.5-5z" fill="#FFD700" stroke="#FFA500" strokeWidth="0.8"/>
                </svg>
                <span className="text-white text-[11px] font-semibold leading-tight">BTC Lightning</span>
              </div>
            </button>
            <PaymentButton
              bgColor={"#345D9D"}
              logo={LitecoinLogo}
              title={"Litecoin"}
              onClick={() => handlePayment("LTC")}
            />
            <PaymentButton
              bgColor={"#C2A633"}
              logo={DogeCoinLogo}
              title={"Dogecoin"}
              onClick={() => handlePayment("DOGE")}
            />
            <button
              onClick={() => handlePayment("USDT")}
              className="relative overflow-hidden rounded-lg p-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              style={{ backgroundColor: "#26A17B" }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <svg className="w-7 h-7 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tether symbol */}
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
                  {/* USDT ₮ */}
                  <path d="M10 11h12M16 11v11M13 15h6a2 2 0 0 1 0 4h-6" 
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Small dollar accent */}
                  <circle cx="22" cy="22" r="4" fill="#50D890" opacity="0.9"/>
                  <path d="M22 19.5v5M20.5 21h3M20.5 23h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="text-white text-[11px] font-semibold leading-tight">USDT</span>
              </div>
            </button>
          </div>
        </div>

        <hr className="border-gray-700 my-4" />

        <div>
          <h4 className="text-white text-lg font-semibold mb-3">Other Methods</h4>
          <div className="grid grid-cols-3 gap-2">
            <PaymentButton
              bgColor={"#8CC43E"}
              logo={WalletLogo}
              title={"Wallet"}
              onClick={() => handleWalletClick("Wallet")}
            />
            <PaymentButton
              bgColor={"#FF5F66"}
              logo={DollarIcon}
              title={"Bonus"}
              onClick={() => {
                handleBonusClick("Bonus")
              }}
            />
            <div className="relative group">
              <PaymentButton
                bgColor={isCashAppDisabled ? "#A0AEC0" : "#FF9085"}
                logo={cashAppLogo}
                title={"Cashapp"}
                onClick={handleCashAppClick}
                disabled={isCashAppDisabled}
              />
              {isCashAppDisabled && (
                <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Minimum deposit is $20.00
                </div>
              )}
            </div>
          </div>
        </div>

        {canUseAppleGooglePay && (
          <>
            <hr className="border-gray-700 my-4" />
            <div>
              <h4 className="text-white text-lg font-semibold mb-3">Digital Wallets</h4>
              {amountDiff > 0 && (
                <div className="mb-3 p-2 bg-blue-500 bg-opacity-20 border border-blue-500 rounded text-xs text-blue-300">
                  Amount adjusted to ${adjustedPayAmount.toFixed(2)} for payment processing
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleApplePay}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  {loading ? "Processing..." : "Apple Pay"}
                </button>
                <button
                  onClick={handleGooglePay}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C6.51 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  {loading ? "Processing..." : "Google Pay"}
                </button>
              </div>
            </div>
            <hr className="border-gray-700 my-4" />
          </>
        )}

        <div className="mt-4">
          <h4 className="text-white text-lg font-semibold mb-3">Pay with Card (via PayPal)</h4>
          
          <div className="bg-white p-4 rounded shadow">
            <PayPalErrorBoundary>
              <PaypalCheckoutButton
                key={paypalPrice}
                product={{ 
                  description: `${paypalPrice.toFixed(2)} Cloud-Based Software Access Credits - LuckyCharmSweep Platform. Non-tangible software access credits for cloud-based digital platform. Instantaneous server-side account update for User ID: ${user?.id || userData?.email || 'account'}. Credits are for virtual usage only, have no cash value, and are consumed immediately upon access. No physical goods shipped.`,
                  price: paypalPrice 
                }}
                onSuccess={handleSuccess}
                onError={handleError}
                userDataForPrefill={userData}
              />
            </PayPalErrorBoundary>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default CheckOutMain
