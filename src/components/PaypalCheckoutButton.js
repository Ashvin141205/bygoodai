import React, { useState, useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Update the component to accept userDataForPrefill prop
const PaypalCheckoutButton = ({ product, onSuccess, userDataForPrefill }) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [paidFor, setPaidFor] = useState(false);
  const [error, setError] = useState(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [checkoutStartTime, setCheckoutStartTime] = useState(null);
  const navigate = useNavigate();

  // 🔒 SELLER PROTECTION: Generate device fingerprint and track checkout start time
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setDeviceFingerprint(result.visitorId);
        console.log("🔒 Device Fingerprint captured:", result.visitorId);
      } catch (error) {
        console.error("Failed to generate device fingerprint:", error);
        setDeviceFingerprint("fingerprint_error");
      }
    };
    getFingerprint();
    
    // Track when user arrived at checkout page
    setCheckoutStartTime(Date.now());
    console.log("🔒 Checkout timer started");
  }, []);

  // If the payment has been successfully processed, show a thank you message.
  // We keep this block for temporary display only. The primary navigation is now in onApprove.
  if (paidFor) {
    return (
        <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center font-bold text-2xl text-green-600 mb-2">
                Payment Successful!
            </div>
            <div className="text-lg text-gray-700 mb-4">
                Your credits have been added to your account
            </div>
            <div className="text-sm text-gray-600 animate-pulse">
                Redirecting to dashboard...
            </div>
        </div>
    );
  }

  // If there was an error, display an error message.
  if (error) {
    return <div className="text-center text-red-500">An error occurred: {error.message}. Please try again.</div>;
  }

  // Show loading state while PayPal SDK is loading
  if (isPending) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 rounded mb-2"></div>
          <div className="text-sm text-gray-600">Loading PayPal...</div>
        </div>
      </div>
    );
  }

  // Show error if PayPal SDK failed to load
  if (isRejected) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Failed to load PayPal. Please refresh the page and try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Only render PayPalButtons when SDK is fully resolved
  if (!isResolved) {
    return (
      <div className="text-center p-4">
        <div className="text-sm text-gray-600">Initializing payment...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          color: "gold",
          layout: "vertical",
          label: "pay",
        }}
        // Enable all funding sources including Apple Pay, Google Pay, Venmo
        fundingSource={undefined}
        disabled={false}
        forceReRender={[product.price]}
        createOrder={(data, actions) => {
          
          const buyerInfo = {};
          const rawPhone = userDataForPrefill?.phone?.replace(/\D/g, '') || null; // Clean non-digits
          
          // --- 1. Payer Name (First Name, Last Name) ---
          if (userDataForPrefill?.first_name || userDataForPrefill?.last_name) {
            buyerInfo.name = {
              given_name: userDataForPrefill.first_name || '',
              surname: userDataForPrefill.last_name || '',
            };
          }

          // --- 2. Payer Email ---
          if (userDataForPrefill?.email) {
            buyerInfo.email_address = userDataForPrefill.email;
          }

            // --- 3. Payer Phone (required for pre-fill) ---
            if (rawPhone && rawPhone.length > 7) {
              // PayPal requires the national_number nested structure
              buyerInfo.phone = {
                phone_number: {
                  // Assuming the backend returns a country code when fetching userData
                  national_number: rawPhone,
                },
              };
            }

            // --- 4. Payer Address/Country (for localization/pre-fill) ---
            if (userDataForPrefill?.country) {
              // NOTE: The country code must be a 2-letter ISO code (e.g., "US", "GB")
              buyerInfo.address = {
                country_code: userDataForPrefill.country,
              };
            }
            
            return actions.order.create({
              purchase_units: [
                {
                  description: product.description,
                  amount: {
                    currency_code: "USD",
                    value: product.price.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: "USD",
                        value: product.price.toFixed(2),
                      },
                    },
                  },
                  // 🔒 SELLER PROTECTION: Set category to DIGITAL_GOODS for eligibility
                  items: [
                    {
                      name: product.description,
                      description: "Intangible Digital Goods - Virtual Credits",
                      unit_amount: {
                        currency_code: "USD",
                        value: product.price.toFixed(2),
                      },
                      quantity: "1",
                      category: "DIGITAL_GOODS", // CRITICAL: Makes transaction eligible for protection
                    },
                  ],
                },
              ],
              // --- CRITICAL FIX: Inject the complete buyer data ---
              payer: buyerInfo, 
              // --- END CRITICAL FIX ---
              application_context: {
                shipping_preference: "NO_SHIPPING", // Required for digital goods
                // 🔒 SELLER PROTECTION: Enhanced session context
                brand_name: "LuckyCharmSweep",
                locale: "en-US",
                user_action: "PAY_NOW",
              },
            });
          }}
          onApprove={async (data, actions) => {
            try {
              console.log("PayPal Order ID:", data.orderID);
              
              // Capture the payment
              const captureResult = await actions.order.capture();
              console.log("PayPal Capture Result:", captureResult);
              
              if (!onSuccess) {
                 throw new Error("No onSuccess handler provided");
              }

              // 🔒 SELLER PROTECTION: Collect comprehensive transaction data
              const checkoutDuration = checkoutStartTime ? Math.floor((Date.now() - checkoutStartTime) / 1000) : 0;
              
              // Detect platform details
              const platform = navigator.platform || "unknown";
              const browserInfo = `${navigator.appName} ${navigator.appVersion}`;
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
              
              // Network information (if available)
              const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
              const connectionType = connection ? connection.effectiveType || connection.type || "unknown" : "unknown";
              
              // Browser capabilities
              const cookiesEnabled = navigator.cookieEnabled ? "yes" : "no";
              const doNotTrack = navigator.doNotTrack || "unspecified";
              const referrer = document.referrer || "direct";
              
              // Hardware details
              const cpuCores = navigator.hardwareConcurrency || "unknown";
              const deviceMemory = navigator.deviceMemory || "unknown";
              
              // Color depth and pixel ratio
              const colorDepth = window.screen.colorDepth || "unknown";
              const pixelRatio = window.devicePixelRatio || 1;
              
              const sellerProtectionData = {
                // Original fields
                device_fingerprint: deviceFingerprint,
                ip_address: window.clientIP || "unknown",
                session_id: sessionStorage.getItem("session_id") || Date.now().toString(),
                user_agent: navigator.userAgent,
                paypal_payer_id: captureResult.payer.payer_id,
                paypal_email: captureResult.payer.email_address,
                paypal_payer_name: captureResult.payer.name?.given_name + " " + captureResult.payer.name?.surname || "",
                transaction_timestamp: new Date().toISOString(),
                browser_language: navigator.language,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                
                // Enhanced fields
                checkout_duration_seconds: checkoutDuration,
                platform: platform,
                browser_info: browserInfo,
                is_mobile: isMobile ? "yes" : "no",
                has_touch_support: hasTouch ? "yes" : "no",
                connection_type: connectionType,
                cookies_enabled: cookiesEnabled,
                do_not_track: doNotTrack,
                referrer_url: referrer,
                cpu_cores: cpuCores,
                device_memory_gb: deviceMemory,
                color_depth: colorDepth,
                pixel_ratio: pixelRatio,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                page_visits: sessionStorage.getItem("page_visit_count") || "1",
              };

              console.log("🔒 Enhanced Seller Protection Data:", sellerProtectionData);

              // 1. Send Order ID + Seller Protection data to backend via onSuccess handler
              const backendResponse = await onSuccess(data.orderID, sellerProtectionData);
              console.log("Backend Response:", backendResponse);

              let isBackendSuccess = false;
              
              // 2. Check for success based on expected JSON structure (code 1)
              if (backendResponse?.data?.status?.code === 1) {
                  isBackendSuccess = true;
              } 
              // 3. Fallback check for raw boolean 'true' response (as seen in your logs)
              else if (backendResponse === true) {
                  isBackendSuccess = true;
              } 
              // 4. Check for nested 'success' property, common in some utility functions
              else if (backendResponse?.success === true) {
                  isBackendSuccess = true;
              }


              if (isBackendSuccess) {
                  // Final success actions
                  setPaidFor(true); // Show the enhanced success message
                  toast.success("🎉 Payment Successful! Credits added to your account.", {
                    autoClose: 3000,
                    position: "top-center"
                  });
                  
                  // Navigate to dashboard after showing success screen
                  setTimeout(() => {
                      navigate("/dashboard", { replace: true });
                  }, 2000); // Increased to 2 seconds to show success screen

              } else {
                  // Throw error using the message from the backend response if available
                  const errorMessage = backendResponse?.data?.status?.message || "Failed to save order to database.";
                  throw new Error(errorMessage);
              }

            } catch (err) {
              console.error("Payment processing failed:", err);
              // Check if the error object has a PayPal context message or use generic failure
              const displayMessage = err.message || "An unknown error occurred during processing.";
              toast.error(`Payment failed: ${displayMessage}`);
              setError(err);
            }
          }}
          onError={(err) => {
            setError(err);
            console.error("PayPal Checkout onError", err);
            toast.error("Payment failed. Please try again.");
          }}
        />
    </div>
  );
};

export default PaypalCheckoutButton;
