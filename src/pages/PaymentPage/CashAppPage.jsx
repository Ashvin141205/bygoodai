import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import downloadIcon from "../../assets/image/download.png";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../../components/Common/Loading";
import { resetGamesState } from "../../redux/slice/gamesSlice";
import { ApiHandler } from "../../helper/ApiHandler";
import { API_ENDPOINTS, EXTRA_ENDPOINTS, getApiUrl } from "../../config/apiEndpoints";
import axios from "axios";
import { FaClipboard } from "react-icons/fa"; // Clipboard icon from react-icons
import Cookies from 'js-cookie';

const CashAppPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const pageState = useMemo(() => location.state || {}, [location.state]);

  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const {
    directPassPage = false,
    cartDataState = [],
    totalAmountState = '',
    method = "",
    promocodeDiscount = '',
    discountamount = '',
    totalDepositBonusAmount = '',
    weeklyChallengeBonusAmount = '',
    finalTotal = '',
    promoCode = "",
    userData = "",
    proof_image = "",
    cashapp_url = "", // This can be kept as a fallback if needed
    typeApi = false,
    promoCodeData = "",
    BonusLevelAmount = "",
    registrationBonusPercentage = '',
    totalAmount = '',
  } = pageState;

  const [cashAppFile, setCashAppFile] = useState(null);
  const [error, setError] = useState("");
  const [cashAppPayLink, setCashAppPayLink] = useState(''); // State for the dynamic CashApp payment link
  const [isLinkLoading, setIsLinkLoading] = useState(true); // State for link generation loading
    const [qrCodeUrl, setQrCodeUrl] = useState(proof_image); // Initialize with the default proof_image

  // --- New Function to Fetch Dynamic Cash App Payment Link ---
  useEffect(() => {
    const fetchCashAppUrl = async () => {
      if (!finalTotal || !cartDataState) return;

      setIsLinkLoading(true);
      try {
        const response = await ApiHandler(
          API_ENDPOINTS.DEPOSIT.GENERATE_CASHAPP_LINK,
          'POST',
          {
            amount: parseFloat(finalTotal),
            items: cartDataState.map(item => ({
              item_id: item.id,
              name: item.game_name,
              quantity: item.quantity,
              price: item.game_price,
            })),
          },
          token,
          dispatch,
          navigate
        );

        if (response?.data?.status?.code === 1 && response?.data?.data?.cashierUrl) {
          setCashAppPayLink(response.data.data.cashierUrl);
        } else {
          toast.error(response?.data?.status?.message || "Failed to generate payment link.");
          setError("Could not generate a payment link. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching Cash App payment link:", error);
        toast.error("An error occurred while generating the payment link.");
        setError("An unexpected error occurred. Please refresh the page.");
      } finally {
        setIsLinkLoading(false);
      }
    };

    fetchCashAppUrl();
  }, [finalTotal, cartDataState, token, dispatch, navigate]);

// --- Step 2: Fetch the Dynamic QR Code using the Cashier URL ---
useEffect(() => {
  const fetchQrCode = async () => {
    if (!cashAppPayLink) return;

    try {
      const response = await ApiHandler(
        API_ENDPOINTS.DEPOSIT.GENERATE_CASHAPP_QR,
        'POST',
        { cashierUrl: cashAppPayLink },
        token,
        dispatch,
        navigate
      );

      const statusCode = response?.data?.status?.code;
      const qrCode = response?.data?.data?.qrCodeUrl;

      if (statusCode === 1 && qrCode) {
        setQrCodeUrl(qrCode);
      } else {
        toast.warn("Could not retrieve a dynamic QR code. Displaying the default code.");
      }
    } catch (error) {
      console.error("Error fetching dynamic QR code:", error);
      setQrCodeUrl(proof_image);
    }
  };

  fetchQrCode();
}, [cashAppPayLink, token, dispatch, navigate, proof_image]);
  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setError("");
    if (file) {
      const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];

      if (!allowedFileTypes.includes(file.type)) {
        setError("Only PNG, JPG, and JPEG formats are allowed.");
        return;
      }

      const formData = new FormData();
      formData.append("cashAppScreenshot", file);

      try {
        const response = await axios.post(getApiUrl(EXTRA_ENDPOINTS.CASHAPP_REDEEM_IMAGE_UPLOAD), formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        });

        const result = response.data;

        if (response.status === 200 && result?.status?.code === 1) {
            setCashAppFile(result.data);
            toast.success("Screenshot uploaded successfully.");
        } else {
            const errorMessage = result?.status?.message || 'Failed to upload screenshot.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
      } catch (error) {
        setError('Error uploading screenshot. Please try again.');
        toast.error('Error uploading screenshot. Please try again.');
      }
    }
  };

  const handlePayNowClick = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      dispatch(resetGamesState());

      const amount = finalTotal;
      const totalAmount = totalAmountState;

      const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.CREATE_NEW, 'POST', {
        email: userData.email,
        phone: userData.phone,
        amount: amount ? parseFloat(amount) : '',
        promocode: promoCode,
        promocodeDiscount: promoCodeData.promoCodePercentage ? parseFloat(promoCodeData.promoCodePercentage) : '',
        discountamount: promoCodeData.promoCodeAmount ? parseFloat(promoCodeData.promoCodeAmount) : '',
        totalamount: totalAmount ? parseFloat(totalAmount) : '',
        payment_type: method,
        base_total_amount: totalAmount ? parseFloat(totalAmount) : 0, 

        weekly_challenge_bonus: weeklyChallengeBonusAmount ? parseFloat(weeklyChallengeBonusAmount) : '',
        
        game_detail: cartDataState.map((game) => ({
          game_name: game.game_name ? game.game_name : '',
          game_id: game.id ? game.id : '',
          price: game.game_price ? parseFloat(game.game_price) : '',
          quantity: game.quantity ? parseFloat(game.quantity) : '',
          total: parseFloat(game.quantity * (game.game_price || game.price)),
          deposit_bonus: game.bonus ? parseFloat(game.bonus) : '',
          platformsID: game.platforms_id ? game.platforms_id : '',
        })),
        account_level_bonus: BonusLevelAmount ? parseFloat(BonusLevelAmount) : '',
        totalDepositBonusAmount: totalDepositBonusAmount ? parseFloat(totalDepositBonusAmount) : '',
        registration_bonus_for_new_users: registrationBonusPercentage ? parseFloat(registrationBonusPercentage) : '',
        cashAppScreenshot: cashAppPayLink,
          utm_source: Cookies.get('utm_source') || null,
        utm_medium: Cookies.get('utm_medium') || null,
        utm_campaign: Cookies.get('utm_campaign') || null,
      }, token, dispatch, navigate);

      if (response.data.status.code === 1) {
        window.location.href = cashAppPayLink;
      } else {
        toast.error(response.data.status.message)
      }
    } catch (error) {
      console.error("API call error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const typeTrue = {
      amount: totalAmountState ? parseFloat(totalAmountState) : '',
      email: userData.email,
      promocode: promoCode,
      promocodeDiscount: promocodeDiscount ? parseFloat(promocodeDiscount) : '',
      discountamount: discountamount ? parseFloat(discountamount) : '',
      totalamount: finalTotal ? parseFloat(finalTotal) : '',
      payment_type: method,
      cashAppScreenshot: cashAppFile,
    };


    if (typeApi) {
      try {
        setLoading(true);
        dispatch(resetGamesState());

        const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.GET_WALLET_DETAIL, 'POST', typeTrue, token, dispatch, navigate);
        if (response?.data?.status.code === 0) {
          toast.error(response?.data?.status.message);
          navigate("/dashboard");
        } else {
          toast.success("Deposit request submitted successfully! Your funds will be added shortly.");
          navigate("/dashboard");
        }
      } catch (error) {
        //console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        dispatch(resetGamesState());
        const amount = finalTotal;
        const totalAmount = totalAmountState;

        const response = await ApiHandler(API_ENDPOINTS.DEPOSIT.CREATE_NEW, 'POST', {
          email: userData.email,
          phone: userData.phone,
          amount: amount ? parseFloat(amount) : '',
          promocode: promoCode,
          promocodeDiscount: promoCodeData.promoCodePercentage ? parseFloat(promoCodeData.promoCodePercentage) : '',
          discountamount: promoCodeData.promoCodeAmount ? parseFloat(promoCodeData.promoCodeAmount) : '',
          totalamount: totalAmount ? parseFloat(totalAmount) : '',
          payment_type: method,
          weekly_challenge_bonus: weeklyChallengeBonusAmount ? parseFloat(weeklyChallengeBonusAmount) : '',
          game_detail: cartDataState.map((game) => ({
            game_name: game.game_name ? game.game_name : '',
            game_id: game.id ? game.id : '',
            price: game.game_price ? parseFloat(game.game_price) : '',
            quantity: game.quantity ? parseFloat(game.quantity) : '',
            total: parseFloat(game.quantity * (game.game_price || game.price)),
            deposit_bonus: game.bonus ? parseFloat(game.bonus) : '',
            platformsID: game.platforms_id ? game.platforms_id : '',
          })),
          account_level_bonus: BonusLevelAmount ? parseFloat(BonusLevelAmount) : '',
          totalDepositBonusAmount: totalDepositBonusAmount ? parseFloat(totalDepositBonusAmount) : '',
          registration_bonus_for_new_users: registrationBonusPercentage ? parseFloat(registrationBonusPercentage) : '',
          cashAppScreenshot: cashAppFile ? cashAppFile : '',
            utm_source: Cookies.get('utm_source') || null,
        utm_medium: Cookies.get('utm_medium') || null,
        utm_campaign: Cookies.get('utm_campaign') || null,
        }, token, dispatch, navigate);

        if (response.data.status.code === 1) {
          if (response.data.data.checkoutLink) {
            window.location.href = response.data.data.checkoutLink
          } else {
            toast.success("Deposit request submitted successfully! Your funds will be added shortly.");
            navigate('/user/deposits');
          }
        } else {
          toast.error(response.data.status.message)
        }
      } catch (error) {
        console.error("API call error:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    if (!pageState?.isCheckoutAllowed) {
      navigate('/cart');
      return;
    }
    const currentState = window.history.state;
    const updatedState = {
      ...currentState,
      usr: {
        ...currentState?.usr,
        isCheckoutAllowed: false,
      },
    };
    window.history.replaceState(updatedState, document.title);
  }, [location, navigate, pageState?.isCheckoutAllowed]);

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] p-4 sm:p-8 lgs:pt-36">
      <div className="w-full max-w-md sm:max-w-lg bg-[#1F2937] p-4 sm:p-6 rounded-lg shadow-lg border border-white/50">
        <div className="flex justify-center mb-6">
          <button className="bg-[#FF736D] text-white py-2 px-4 rounded-full font-bold text-sm sm:text-base">
            Complete your payment via Cashapp
          </button>
        </div>

        {directPassPage ? (
          <>
            <div>
              <div className="text-white mb-4">
                <h2 className="font-bold text-lg">Order Details</h2>
                <hr className="border-white/5 border my-3" />
                {userData?.first_name ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Name:</p>
                    <p>{userData?.first_name}</p>
                  </div>
                ) : ""}
                {userData?.email ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Email:</p>
                    <p>{userData?.email}</p>
                  </div>
                ) : ""}
                {userData?.first_name ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Phone:</p>
                    <p>{userData?.phone}</p>
                  </div>
                ) : ""}
              </div>

              <div className="text-white mt-8">
                <h2 className="font-bold text-lg">Bonuses & Discounts</h2>
                {totalAmount && totalAmount > 0 ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Amount</p>
                    <p>${totalAmount ? parseFloat(totalAmount).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                <hr className="border-white/5 border my-3" />
                {!promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>Total Amount</p>
                    <span className="text-sm text-white px-2 py-1 rounded-md">
                      ${finalTotal ? parseFloat(finalTotal).toFixed(2) : ''}
                    </span>
                  </div>
                ) : ""}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>Amount</p>
                    <span className="text-sm text-white  px-2 py-1 rounded-md">
                      ${totalAmountState ? parseFloat(totalAmountState).toFixed(2) : ''}
                    </span>
                  </div>
                ) : ""}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>PromoCode Applied</p>
                    <span className="text-sm text-white bg-blue-500 px-2 py-1 rounded-md">
                      {promoCode}
                    </span>
                  </div>
                ) : ""}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>PromoCode total discount</p>
                    <span className="text-sm text-white  px-2 py-1 rounded-md">
                      {promocodeDiscount ? parseFloat(promocodeDiscount).toFixed(2) : ''}%
                    </span>
                  </div>
                ) : ""}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>PromoCode total discount amount</p>
                    <span className="text-sm text-white  px-2 py-1 rounded-md">
                      ${discountamount ? parseFloat(discountamount).toFixed(2) : ''}
                    </span>
                  </div>
                ) : ""}

                {finalTotal ? (
                  <div className="mt-4 flex justify-between">
                    <p className="font-bold">Final Amount</p>
                    <p>${finalTotal ? parseFloat(finalTotal).toFixed(2) : ''}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-white mb-4">
                <h2 className="font-bold text-lg">Order Details</h2>
                <hr className="border-white/5 border my-3" />
                {userData?.first_name ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Name:</p>
                    <p>{userData?.first_name}</p>
                  </div>
                ) : ""}
                {userData?.email ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Email:</p>
                    <p>{userData?.email}</p>
                  </div>
                ) : ""}
                {userData?.first_name ? (
                  <div className="mb-2 flex justify-start gap-3 font-bold">
                    <p>Phone:</p>
                    <p>{userData?.phone}</p>
                  </div>
                ) : ""}
              </div>
              <div className="text-white mt-8">
                <h2 className="font-bold text-lg">Bonuses & Discounts</h2>
                <hr className="border-white/5 border my-3" />
                {registrationBonusPercentage && registrationBonusPercentage > 0 ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>User First time Deposit Add Bounes</p>
                    <p>${registrationBonusPercentage ? parseFloat(registrationBonusPercentage).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                {totalDepositBonusAmount ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Deposit Bonus</p>
                    <p>${totalDepositBonusAmount ? parseFloat(totalDepositBonusAmount).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                {weeklyChallengeBonusAmount ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Weekly Challenge Bonus</p>
                    <p>${weeklyChallengeBonusAmount ? parseFloat(weeklyChallengeBonusAmount).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                {BonusLevelAmount ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Bonus Level</p>
                    <p>${BonusLevelAmount ? parseFloat(BonusLevelAmount).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>Promo Code</p>
                    <span className="text-sm text-white bg-blue-500 px-2 py-1 rounded-md">
                      {promoCode}
                    </span>
                  </div>
                ) : ""}

                {promocodeDiscount ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Promo Code Discount</p>
                    <p>{promocodeDiscount ? `${parseFloat(promocodeDiscount).toFixed(2)}%` : ''}</p>
                  </div>
                ) : null}
                {promoCode ? (
                  <div className="mb-2 flex justify-between items-center font-bold">
                    <p>PromoCode total discount amount</p>
                    <p>${discountamount ? parseFloat(discountamount).toFixed(2) : ''}</p>
                  </div>
                ) : ""}
                {totalAmountState ? (
                  <div className="mb-2 flex justify-between font-bold">
                    <p>Original Total</p>
                    <p>${totalAmountState ? parseFloat(totalAmountState).toFixed(2) : ''}</p>
                  </div>
                ) : ""}

                <hr className="border-white/5 border my-5" />

                {finalTotal ? (
                  <div className="mt-4 flex justify-between">
                    <p className="font-bold">Total Amount</p>
                    <p>${finalTotal ? parseFloat(finalTotal).toFixed(2) : ''}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col items-center mb-4">
          <img
            src={qrCodeUrl}
            alt="CashApp Barcode"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-4"
          />
        </div>
        
        {isLinkLoading ? (
            <div className="text-center text-white">Generating payment link...</div>
        ) : cashAppPayLink ? (
          <div className="mb-4 text-center">
            <a
              href={cashAppPayLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePayNowClick}
              className="bg-[#FFDD15] text-black py-2 px-4 rounded-md font-bold inline-block"
            >
              Pay Now via CashApp
            </a>
            <p className="text-gray-400 mt-2 text-sm">Or copy the link below:</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-gray-300 text-xs break-all bg-gray-700 px-2 py-1 rounded">
                {cashAppPayLink}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cashAppPayLink);
                  toast.success("Link copied to clipboard!");
                }}
                className="text-[#FFDD15] hover:text-white focus:outline-none"
                title="Copy to clipboard"
              >
                <FaClipboard className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
            <div className="text-center text-red-500">Could not load payment link.</div>
        )}

        {directPassPage ? (
          <>
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full bg-[#2D3748] text-white rounded-lg overflow-hidden">
                <thead className="bg-[#4A5568]">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#555]">
                    <td className="px-4 py-2 flex items-center">
                      <span>Wallet</span>
                    </td>
                    <td className="px-4 py-2 text-green-400">{finalTotal}</td>
                    <td className="px-4 py-2">No Bonus</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full bg-[#2D3748] text-white rounded-lg overflow-hidden">
                <thead className="bg-[#4A5568]">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Qty.</th>
                  </tr>
                </thead>
                <tbody>
                  {cartDataState && cartDataState.length > 0 ? (
                    cartDataState.map((item, index) => (
                      <tr key={index} className="border-b border-[#555]">
                        <td className="px-4 py-2 flex items-center">
                          <img
                            src={item.game_image}
                            alt={item.game_name}
                            className="w-10 h-10 rounded-md mr-2"
                          />
                          <span>{item.game_name}</span>
                        </td>
                        <td className="px-4 py-2 text-green-400">
                          ${parseFloat(item.game_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">{item.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-center">
                        No items in cart
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex items-center justify-center border-t border-[#555] pt-4">
          <label
            htmlFor="upload"
            className="flex items-center text-white bg-[#222222] py-2 px-4 rounded-full cursor-pointer gap-2"
          >
            <img src={downloadIcon} alt="Upload" className="w-6 sm:w-7" />
            <span className="text-sm sm:text-lg">Upload Image</span>
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {/* Error Display */}
        {error && <div className="text-red-500 text-center text-sm my-4">{error}</div>}

        <button
          onClick={handleSubmit}
          type="submit"
          disabled={!cashAppFile}
          className={`w-full py-2 rounded-md font-bold text-lg mt-6 ${cashAppFile
            ? "bg-[#FFDD15] text-black"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CashAppPage;