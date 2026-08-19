"use client"

import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import BitCoinLogo from "../../../assets/image/bitcoin.png"
import DogeCoinLogo from "../../../assets/image/dogecoin.png"
import LitecoinLogo from "../../../assets/image/Litecoin.png"
import PaymentButton from "../../../components/PaymentButton"
import { formatMoment, onBlurDate, onFocusDate, submitDATE, tableDATE } from "../../../helper/CommonFunction"
import DataFetching from "../../../helper/DataFetching"
import renderDataTable from "../../../helper/renderDataTable"
import { InfoIcon } from "../../../utils/Icons"
import { toast } from "react-toastify"
import Loading from "../../../components/Common/Loading"
import { ApiHandler } from "../../../helper/ApiHandler"
import { isMobile } from "react-device-detect" // Import isMobile
import paypalLogo from "../../../assets/image/paypal.png" // Import PayPal logo
import creditCardLogo from "../../../assets/image/credit-card.png" // Import Credit Card logo
import PaypalCheckoutButton from "../../../components/PaypalCheckoutButton" // Import your button component
import PayPalErrorBoundary from "../../../components/PayPalErrorBoundary"
import { formatBalance } from "../../../helper/CommonFunction"
import CryptoInstructionsModal from "../../../components/CryptoInstructionsModal" // Import CryptoInstructionsModal for crypto payment guide
import { DEPOSIT_ENDPOINTS, EXTRA_ENDPOINTS } from "../../../config/apiEndpoints"

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(0)
    const [selectedMethod, setSelectedMethod] = useState(null)
    const [filteredData, setFilteredData] = useState([])
    const [promoCode, setPromoCode] = useState("")
    const [promocodeDiscount, setPromocodeDiscount] = useState("")
    const [discountedAmount, setDiscountedAmount] = useState(0)
    const [totalamount, setTotalamount] = useState(0)
    const [finalTotal, setFinalTotal] = useState(0) // To hold the final amount after discount

    const [isPromoApplied, setIsPromoApplied] = useState(false)
    const [disabledTrue, setDisabledTrue] = useState(true)
    const [showTooltipOne, setShowTooltipOne] = useState(false)
    const [showTooltipTwo, setShowTooltipTwo] = useState(false)
    const [showCryptoModal, setShowCryptoModal] = useState(false) // Add state for crypto instructions modal

    const handleMouseEnterOne = () => {
        setShowTooltipOne(true)
    }

    const handleMouseLeaveOne = () => {
        setShowTooltipOne(false)
    }

    const handleMouseEnterTwo = () => {
        setShowTooltipTwo(true)
    }

    const handleMouseLeaveTwo = () => {
        setShowTooltipTwo(false)
    }

    const { main_balance, bonus_balance, token } = useSelector((state) => state.auth)

    const userDetails = useSelector((state) => state.auth.user)
    const userData = useSelector((state) => state.auth.user)
    const email = userDetails?.email

    const handlePromoApply = async () => {
        const response = await ApiHandler(
            DEPOSIT_ENDPOINTS.VERIFY_PROMOCODE,
            "POST",
            { promocode: promoCode },
            token,
            dispatch,
            navigate,
        )

        if (response?.data?.status?.code === 1) {
            toast.success("Great news! Your coupon code has been applied. Now, select the platform to complete your deposit.")
            const res = response.data.data
            const discount = amount * (Number.parseFloat(res.promocode_percentage) / 100) // Calculate discount amount

            setPromocodeDiscount(res.promocode_percentage)
            setDiscountedAmount(discount)
            setTotalamount(amount) // This is the total amount the user will receive
            setFinalTotal(amount - discount) // This is the final amount the user has to pay

            setIsPromoApplied(true)
        } else {
            toast.error(response?.data?.status?.message)
            setIsPromoApplied(false)
            setPromocodeDiscount("")
            setDiscountedAmount(0)
            setPromoCode("")
            setFinalTotal(amount)

            setTotalamount(amount)
        }
    }

    const handleAmountClick = (value) => {
        setAmount(value)
        setTotalamount(value)
        setFinalTotal(value)

        if (selectedMethod) {
            setDisabledTrue(false)
        }
    }

    const handleClick = (method) => {
        setSelectedMethod(method)
        if (amount) {
            setDisabledTrue(false)
        }
    }

    const handleError = (error) => {
        toast.error("Payment failed. Please try again.")
    }

    // --- NEW SUCCESS HANDLER FOR PAYPAL WALLET ---
const handlePayPalSuccess = async (paypalOrderId) => {
    console.log("=== PayPal Wallet Deposit Started ===");
    console.log("PayPal Order ID:", paypalOrderId);
    
    setLoading(true)
    try {
        if (!paypalOrderId) {
             toast.error("PayPal Order ID missing. Cannot process deposit.")
             setLoading(false)
             return;
        }

        const payload = {
            amount: finalTotal, // The final amount the user paid
            email: email,
            promocode: promoCode || "",
            promocodeDiscount: promocodeDiscount || "",
            discountamount: isPromoApplied ? discountedAmount : 0,
            totalamount: totalamount, // Total amount credited before discount
            payment_type: "PayPal", // Changed from PayPalWallet to match backend
            paypal_order_id: paypalOrderId, // CRITICAL FIX: Send PayPal Order ID
            cashAppScreenshot: "",
        };

        console.log("Payload being sent to backend:", payload);

        const response = await ApiHandler(
            DEPOSIT_ENDPOINTS.GET_WALLET_DETAIL,
            "POST",
            payload,
            token,
            dispatch,
            navigate,
        )

        console.log("Backend response:", response);

        if (response?.data?.status?.code === 1) {
            toast.success("Payment successful! Your wallet has been credited.")
            console.log("✅ Wallet deposit successful");
            navigate('/user/wallet')
            return response; // Return response for PaypalCheckoutButton
        } else {
            console.error("❌ Backend returned error:", response?.data?.status?.message);
            toast.error(response?.data?.status?.message || "Failed to process deposit.")
            return response; // Return response even on error
        }
    } catch (error) {
        console.error("❌ Error processing PayPal Wallet deposit:", error)
        toast.error("Payment processing failed: " + (error.message || "Unknown error"))
        throw error; // Re-throw for PaypalCheckoutButton error handling
    } finally {
        setLoading(false)
    }
}
    // --- END NEW SUCCESS HANDLER ---


    const handleTopUpSubmit = async () => {
        const body = {
            amount: finalTotal ? Number.parseFloat(finalTotal) : "",
            email: email,
            promocode: promoCode,
            promocodeDiscount: promocodeDiscount ? Number.parseFloat(promocodeDiscount) : "",
            discountamount: isPromoApplied ? (discountedAmount ? Number.parseFloat(discountedAmount) : "") : "",
            totalamount: totalamount ? Number.parseFloat(totalamount) : "",
            payment_type: selectedMethod,
            cashAppScreenshot: "",
        }

        if (selectedMethod === "CashApp") {
            try {
                setLoading(true)
                const response = await ApiHandler(
                    DEPOSIT_ENDPOINTS.GET_CASHAPP_BARCODE,
                    "POST",
                    undefined,
                    token,
                    dispatch,
                    navigate,
                )
                const barcodeImage = response.data?.data?.barcode_image
                const cashapplink = response.data?.data?.cashapplink

                if (response.data.status.code === 1 && barcodeImage && cashapplink) {
                    navigate("/cashapp", {
                        state: {
                            directPassPage: true,
                            isCheckoutAllowed: true,
                            totalAmountState: Number.parseFloat(totalamount),
                            method: selectedMethod,
                            promocodeDiscount: promocodeDiscount,
                            discountamount: isPromoApplied ? discountedAmount : "",
                            finalTotal: Number.parseFloat(amount),
                            promoCode: promoCode,
                            userData: userData,
                            proof_image: barcodeImage,
                            cashapp_url: cashapplink,
                            typeApi: true,
                            totalAmount: Number.parseFloat(amount),
                        },
                    })
                    setLoading(false)
                }
            } catch (error) {
                console.error("Error fetching CashApp barcode:", error)
                setLoading(false)
            }
        } else if (selectedMethod === "PayPal" || selectedMethod === "Credit Card") {
            // NOTE: The logic for PayPal/Credit Card is now handled directly by the PaypalCheckoutButton component's onSuccess prop.
            // This block remains as a fallback, but technically the button handles the submit.
            setLoading(true)
            // No operation needed here, just break out as the button is active below.
            setLoading(false); 
        } else if (["BTC", "LTC", "DOGE"].includes(selectedMethod)) {
            try {
                setLoading(true)
                const response = await ApiHandler(DEPOSIT_ENDPOINTS.GET_WALLET_DETAIL, "POST", body, token, dispatch, navigate)

                if (response?.data?.status?.code === 1 && response?.data?.data?.checkoutLink) {
                    setLoading(false)
                    // Redirect to crypto payment provider - order is already created by backend
                    window.location.href = response.data.data.checkoutLink
                } else {
                    setLoading(false)
                    const errorMessage =
                        response?.data?.status?.message ||
                        response?.data?.message ||
                        "Failed to generate cryptocurrency payment link. Please try again or contact support."

                    toast.error(errorMessage, {
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    })
                }
            } catch (error) {
                console.error("Error processing crypto payment:", error)
                setLoading(false)
                toast.error("An error occurred while processing your payment. Please try again or contact support.", {
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                })
            }
        } else {
            try {
                setLoading(true)
                const response = await ApiHandler(DEPOSIT_ENDPOINTS.GET_WALLET_DETAIL, "POST", body, token, dispatch, navigate)
                if (response?.data?.status === 401) {
                    toast.error(response?.data?.message)
                } else if (response?.data?.data?.checkoutLink) {
                    setLoading(false)
                    window.location.href = response?.data?.data?.checkoutLink
                } else {
                    setLoading(false)
                    toast.error("Failed to generate payment link. Please try again.")
                }
            } catch (error) {
                setLoading(false)
                toast.error("An error occurred. Please try again.")
            }
        }
    }

    const columns = [
        {
            name: "Date Created",
            selector: (row) => formatMoment(row.created_date),
            sortable: true,
        },
        {
            name: "Total Price",
            selector: (row) => row.user_balance,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) =>
                row.payment_status === "0" ? (
                    <p className="text-[#F8924F]">Pending</p>
                ) : row.payment_status === "3" ? (
                    <p className="text-[#FF2B62]">Expired</p>
                ) : row.payment_status === "2" ? (
                    <p className="text-[#FF2B62]">Cancelled</p>
                ) : row.payment_status === "1" ? (
                    <p className="text-[#4AFFA9]">Completed</p>
                ) : row.payment_status === "Paid" ? (
                    <p className="text-[#9EE2FF]">Paid</p>
                ) : row.payment_status === "Unpaid" ? (
                    <p className="text-[#8F96FF]">Unpaid</p>
                ) : (
                    <></>
                ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <Link to={`/user/wallet/${row.id}/${row.order_id}`} className="underline text-[#01D370] bg-[#0E0E0E]">
                    View
                </Link>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ]

    const [user, setUser] = useState({
        totalPrice: "",
        status: "",
    })
    const { totalPrice, status } = user

    const onInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    const location = useLocation()
    const [pending, setPending] = useState(true)
    const [resetSearch, setResetSearch] = useState(true)
    const [hide, setHide] = useState("")
    const [from, setFrom] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageLimit, setPageLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(0)

    const [form_date, setForm_date] = useState(null)
    const [end_date, setEnd_date] = useState(null)
    const [form_date1, setForm_date1] = useState("")
    const [end_date1, setEnd_date1] = useState("")

    const fetchData = async () => {
        setPending(true)

        const body = {
            fromDate: form_date1,
            toDate: end_date1,
            total_price: totalPrice,
            payment_status: status,
            page: currentPage - 1,
            total_record: pageLimit,
        }
        DataFetching(
            setPending,
            EXTRA_ENDPOINTS.WALLET_TRANSACTION_HISTORY,
            "POST",
            token,
            dispatch,
            navigate,
            setFilteredData,
            setTotalPages,
            body,
            setResetSearch,
            resetSearch,
        )
    }

    const handleSearchClick = () => {
        if (form_date) {
            if (!end_date) {
                setHide("This field is required")
                return
            }
        }
        if (hide || from) {
            return
        }
        setCurrentPage(1)
        setResetSearch((prevReset) => !prevReset)
    }

    const handleClearSearch = () => {
        setHide("")
        setFrom(false)
        clearSearchData()
        setResetSearch((prevReset) => !prevReset)
    }
    const clearSearchData = () => {
        setUser({
            totalPrice: "",
            status: "",
        })
        setForm_date(null)
        setForm_date1("")
        setEnd_date(null)
        setEnd_date1("")
    }

    // Render the DataTable component
    useEffect(() => {
        if (!resetSearch) {
            return
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageLimit, location, resetSearch])

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen text-white p-4 sm:p-8">
            <h1 className="text-center text-3xl md:text-5xl">Dashboard</h1>
            <h2 className="text-2xl md:text-3xl mt-4">Balance</h2>
            <div className="main-dot-bg flex flex-col sm:flex-row justify-between p-5 mt-4">
                <div className="mb-4 sm:mb-0">
                    <p className="text-2xl md:text-4xl">${+formatBalance(main_balance)}</p>
                    <p className="text-md md:text-xl tracking-wide text-[#FFDD15] flex items-center gap-2">
                        Main Balance
                        <span
                            className="relative cursor-pointer"
                            onMouseEnter={handleMouseEnterOne}
                            onMouseLeave={handleMouseLeaveOne}
                        >
                            <InfoIcon className="cursor-pointer" />
                            {/* Tooltip */}
                            {showTooltipOne && (
                                <div
                                    className="absolute -left-24 mt-1 w-96 bg-gray-700 text-gray-200 text-[0.889rem] rounded-lg shadow-lg p-3 z-10 font-bold"
                                    onMouseEnter={handleMouseEnterOne}
                                    onMouseLeave={handleMouseLeaveOne}
                                >
                                    The Main Balance will reflect the amount which users deposited to Lucky Charm Sweep. through our
                                    innovative payment options including Bitcoin, Dogecoin, Litecoin, Cashapp, Paypal and credit card.
                                    Users will be able to utilise their main balance for depositing at different platforms that are
                                    available at Lucky Charm Sweep. On the other hand, the main balance cannot be used for withdrawals. To
                                    cash out, players need to use the Platform Account balances" and follow the necessary steps in order
                                    to complete the withdrawals.
                                </div>
                            )}
                        </span>
                    </p>
                </div>
                <div>
                    <p className="text-2xl md:text-4xl">${+bonus_balance}</p>
                    <p className="text-md md:text-xl tracking-wide text-[#FFDD15] flex items-center gap-2">
                        Bonus Balance
                        <span
                            className="relative cursor-pointer"
                            onMouseEnter={handleMouseEnterTwo}
                            onMouseLeave={handleMouseLeaveTwo}
                        >
                            <InfoIcon className="cursor-pointer" />
                            {/* Tooltip */}
                            {showTooltipTwo && (
                                <div
                                    className={`absolute ${isMobile ? "-left-24" : "right-0"} mt-1 w-96 bg-gray-700 text-gray-200 text-[0.889rem] rounded-lg shadow-lg p-3 z-10 font-bold`}
                                >
                                    {/* Conditionally apply class based on screen size */}
                                    The Bonus Balance of the player will reflect the free plays that he/she has earned through engaging in
                                    campaigns like Fortune Wheel, Quest Achievements, etc. Players will be able to deposit to different
                                    Lucky Charm Sweep platforms with their Bonus Balance. On the other hand, this balance is not available
                                    for withdrawals. To cash out, please use individual platform account balances.
                                    <br />
                                    <span className="text-green-500 font-semibold">
                                        Note: You will <span className="text-yellow-500">get 25% of your winnings</span> when you deposit
                                        with your bonus balance!
                                    </span>
                                </div>
                            )}
                        </span>
                    </p>
                </div>
            </div>

            {/* Top-up Section */}
            <div className="main-dot-bg p-5 mt-10">
                <h2 className="text-2xl md:text-4xl">TOP UP</h2>
                <div className="flex flex-col lg:flex-row justify-center my-5 gap-5 w-full">
                    {[10, 20, 50, 100].map((value) => (
                        <button
                            key={value}
                            className={`md:w-full w-auto py-1 text-xl ${amount === value ? "bg-[#FFDD15] text-[#0E0E0E]" : "border border-[#FFDD15] bg-transparent"} rounded`}
                            disabled={isPromoApplied}
                            onClick={() => handleAmountClick(value)}
                        >
                            {value}$
                        </button>
                    ))}
                </div>

                {!isPromoApplied && (
                    <p className="text-xl font-bold text-[#FFDD15]">
                        Total amount:
                        <span className="text-[#01D370] font-bold pl-1">${amount}</span>
                    </p>
                )}

                {/* Promo Code Section */}
                <div className="mt-5">
                    <p className="mb-2 font-semibold text-white text-lg">Promo code</p>
                    <div className="flex flex-col sm:flex-row items-start justify-start gap-3">
                        <div>
                            <input
                                type="text"
                                placeholder="ENTER PROMO CODE"
                                className="px-4 py-2 bg-[#0E0E0E] rounded  w-auto  capitalize"
                                style={{ borderWidth: "1px", borderColor: "rgba(255, 255, 255, 0.16)" }}
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                        </div>
                        <button
                            className={`py-2 px-4 bg-[#290A47] text-white rounded-md font-semibold text-base ${!promoCode || isPromoApplied || !amount ? "cursor-not-allowed" : ""}`}
                            style={{ borderWidth: "1px", borderColor: "rgba(255, 255, 255, 0.16)" }}
                            onClick={handlePromoApply}
                            disabled={!promoCode || isPromoApplied || !amount}
                        >
                            Apply Promo Code
                        </button>
                    </div>

                    {isPromoApplied && (
                        <div className="flex flex-col items-start gap-1 font-semibold text-base mt-3">
                            <p className="text-[#01D370] font-bold">Promo code applied successfully!</p>
                            <p className="font-semibold text-white text-lg">Amount: ${amount}</p>
                            <p>Promocode total discount {promocodeDiscount}%</p>
                            <p>Promocode total discount amount: ${discountedAmount}</p>
                        </div>
                    )}

                    {isPromoApplied && (
                        <p className="text-xl font-bold text-[#FFDD15] mt-4">
                            Final amount:
                            <span className="text-[#01D370] font-bold pl-1">${totalamount}</span>
                        </p>
                    )}

                    <div className="flex flex-col items-start gap-1 font-semibold text-base mt-3">
                        {isPromoApplied && (
                            <p className="text-xl font-bold text-[#FFDD15] mt-4">
                                Final amount to be paid:
                                <span className="text-[#01D370] font-bold pl-1">${finalTotal}</span>
                            </p>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl mt-10">CHOOSE PAYMENT METHOD</h2>
                <div className="flex items-center justify-between mt-5 mb-3">
                    <p className="text-lg text-slate-300">Select your preferred payment method</p>
                    <button
                        onClick={() => setShowCryptoModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
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
                <div className="flex flex-col sm:flex-row justify-start gap-4">
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full md:w-full lg:w-2/3">
                        <PaymentButton
                            bgColor={selectedMethod === "BTC" ? "#D47D18" : "#F7931A"}
                            logo={BitCoinLogo}
                            title={"Bitcoin"}
                            onClick={() => handleClick("BTC")}
                            isClicked={selectedMethod === "BTC"} // Pass isClicked prop
                        />
                        <PaymentButton
                            bgColor={selectedMethod === "DOGE" ? "#9F8D2E" : "#C2A633"}
                            logo={DogeCoinLogo}
                            title={"Dogecoin"}
                            onClick={() => handleClick("DOGE")}
                            isClicked={selectedMethod === "DOGE"} // Pass isClicked prop
                        />
                        <PaymentButton
                            bgColor={selectedMethod === "LTC" ? "#2D4F89" : "#345D9D"}
                            logo={LitecoinLogo}
                            title={"Litecoin"}
                            onClick={() => handleClick("LTC")}
                            isClicked={selectedMethod === "LTC"} // Pass isClicked prop
                        />
                        
                        {/* <PaymentButton
                            bgColor={selectedMethod === 'CashApp' ? "#E6716D" : "#FF9085"}
                            logo={cashAppLogo}
                            title={"CashApp"}
                            onClick={() => handleClick('CashApp')}
                            isClicked={selectedMethod === 'CashApp'} // Pass isClicked prop
                        /> */}
                        <PaymentButton
                            bgColor={selectedMethod === "Paypal" ? "#00457C" : "#0070BA"}
                            logo={paypalLogo}
                            title={"Paypal"}
                            onClick={() => handleClick("Paypal")}
                            isClicked={selectedMethod === "Paypal"} // Pass isClicked prop
                        />
                        <PaymentButton
                            bgColor={selectedMethod === "Credit Card" ? "#2C3E50" : "#34495E"}
                            logo={creditCardLogo}
                            title={"Credit Card"}
                            onClick={() => handleClick("Credit Card")}
                            isClicked={selectedMethod === "Credit Card"} // Pass isClicked prop
                        />
                    </div>
                </div>
               {(selectedMethod === "Paypal" || selectedMethod === "Credit Card") && (
                    <div className="mt-4 bg-white p-4 rounded shadow">
                        <PayPalErrorBoundary>
                            <PaypalCheckoutButton
                                product={{
                                    description: "Total Payment for Coins",
                                    // Price should be the final amount paid by the user
                                    price: finalTotal, 
                                }}
                                // CRITICAL FIX: Use the new robust success handler
                                onSuccess={handlePayPalSuccess} 
                                onError={handleError}
                                userDataForPrefill={userData}
                            />
                        </PayPalErrorBoundary>
                    </div>
                )}

                {selectedMethod !== "Paypal" && selectedMethod !== "Credit Card" && (
                    <button
                        className={`w-full mt-10 py-3 text-2xl rounded transition border border-[#FFDD15] ${!amount || disabledTrue ? "hover:bg-gray-400 hover:text-gray-700 cursor-not-allowed font-bold" : "hover:bg-[#FFDD15] hover:text-[#0E0E0E] bg-[#0E0E0E]"}`}
                        onClick={() => {
                            handleTopUpSubmit()
                        }}
                        disabled={!amount || disabledTrue}
                    >
                        TOP UP
                    </button>
                )}
            </div>

            <div className="p-4 main-dot-bg text-white shadow-lg min-h-screen mt-10">
                <h2 className="text-2xl mb-4">Transactions</h2>

                <div className="p-5 mb-4 rounded-lg">
                    <p className="text-xl mb-2">Filter:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="w-full">
                            <div className="text-white text-sm font-medium mb-2">By From Transaction Date</div>
                            <DatePicker
                                selected={form_date}
                                placeholderText="From Date"
                                className={`px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded fill-white outline-none focus:outline-none w-full ${from ? "border border-red-500 placeholder:text-red-400 font-extrabold" : ""}`}
                                onChange={(date) => tableDATE(date, setForm_date, setForm_date1, end_date, setFrom)}
                                dateFormat="yyyy-MM-dd"
                                onFocus={() => onFocusDate(setHide)}
                                onBlur={() => onBlurDate(setHide, form_date, end_date)}
                            />
                        </div>
                        <div className="w-full">
                            <div className="text-white text-sm font-medium mb-2">By To Transaction Date</div>
                            <DatePicker
                                selected={end_date}
                                onChange={(date) => {
                                    submitDATE(date, setHide, setEnd_date, setEnd_date1, setFrom, form_date)
                                }}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="To Date"
                                className={`px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded fill-white outline-none focus:outline-none w-full ${hide ? "border border-red-500 placeholder:text-red-400 font-extrabold" : ""}`}
                                minDate={form_date}
                            />
                            {hide && <div style={{ color: "red", display: "block", fontWeight: "500" }}>{hide}</div>}
                        </div>
                        <div className="w-full">
                            <p className="text-white text-sm font-medium mb-2">Total Price</p>
                            <input
                                type="text"
                                name="totalPrice"
                                placeholder="Search by Total Price"
                                value={totalPrice}
                                onChange={(e) => onInputChange(e)}
                                className="px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded outline-none focus:outline-none placeholder:text-white w-full"
                            />
                        </div>
                        <div className="w-full">
                            <p className="text-white text-sm font-medium mb-2">Transaction Status </p>
                            <select
                                name="status"
                                value={status}
                                onChange={(e) => onInputChange(e)}
                                className="px-4 h-[40px] text-start bg-[#0E0E0E] text-white rounded outline-none focus:outline-none placeholder:text-white w-full"
                            >
                                <option value="">Search by Status</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                        <button
                            onClick={handleSearchClick}
                            className="mb-4 px-4 py-2 bg-[#5C6CB2] rounded text-white hover:bg-blue-700"
                        >
                            Search
                        </button>
                        <button
                            onClick={handleClearSearch}
                            className="mb-4 px-4 py-2 bg-[#6C6C6C] rounded text-white hover:bg-slate-600"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {renderDataTable(
                    filteredData,
                    columns,
                    pending,
                    currentPage,
                    setPageLimit,
                    setCurrentPage,
                    totalPages,
                    pageLimit,
                    setResetSearch,
                )}
            </div>
            <CryptoInstructionsModal isOpen={showCryptoModal} onClose={() => setShowCryptoModal(false)} showBonus={false} />
        </div>
    )
}

export default Dashboard