"use client"

import { useState, useEffect } from "react"
import { useFocusTrap } from "../hooks/useKeyboardNavigation"

const CryptoInstructionsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("lightning")

  const modalRef = useFocusTrap(isOpen)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crypto-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[#1f2937] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-[#1f2937] z-10">
          <h3 id="crypto-modal-title" className="text-white text-2xl font-bold">
            Crypto Payment Guide
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold leading-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div
          className="flex border-b border-gray-700 sticky top-[89px] bg-[#1f2937] z-10"
          role="tablist"
          aria-label="Crypto payment methods"
        >
          <TabButton
            title="⚡ Lightning (Recommended)"
            isActive={activeTab === "lightning"}
            onClick={() => setActiveTab("lightning")}
            activeClasses="bg-yellow-500 text-black"
            inactiveClasses="bg-gray-800 text-gray-400 hover:text-white"
            tabId="lightning"
          />
          <TabButton
            title="Litecoin (LTC)"
            isActive={activeTab === "litecoin"}
            onClick={() => setActiveTab("litecoin")}
            activeClasses="bg-blue-500 text-white"
            inactiveClasses="bg-gray-800 text-gray-400 hover:text-white"
            tabId="litecoin"
          />
          <TabButton
            title="Bitcoin (BTC)"
            isActive={activeTab === "bitcoin"}
            onClick={() => setActiveTab("bitcoin")}
            activeClasses="bg-orange-500 text-white"
            inactiveClasses="bg-gray-800 text-gray-400 hover:text-white"
            tabId="bitcoin"
          />
        </div>

        <div className="p-6 space-y-6" role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
          {activeTab === "lightning" && (
            <div className="text-white space-y-6">
              <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
                <h4 className="font-bold text-yellow-400 text-lg mb-2">⚡ Recommended Method</h4>
                <p className="text-gray-200">The fastest and cheapest way to deposit Bitcoin!</p>
              </div>

              <div>
                <h5 className="font-bold text-xl mb-3">Why Use the Lightning Network?</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>
                    <strong>Almost Zero Fees:</strong> Typically less than $0.01.
                  </li>
                  <li>
                    <strong>Instant Confirmation:</strong> Deposits arrive in seconds, not minutes or hours.
                  </li>
                  <li>
                    <strong>Same 10% Bonus:</strong> Get your deposit bonus instantly.
                  </li>
                </ul>
              </div>

              {/* Instructions for Exchanges */}
              <div>
                <h5 className="font-bold text-xl mb-3">How to Pay from an Exchange</h5>
                <p className="text-gray-300 mb-4">
                  Many major exchanges like <strong>Binance</strong>, <strong>Coinbase</strong>, <strong>Kraken</strong>
                  , and <strong>Bitfinex</strong> now support Lightning withdrawals.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Log in to your exchange (e.g., Binance).</li>
                  <li>
                    Go to "Withdraw" and select <strong>BTC (Bitcoin)</strong>.
                  </li>
                  <li>Paste the Lightning Invoice (the long `lnbc...` text) into the "Address" field.</li>
                  <li>
                    The exchange will <strong>automatically detect it's a Lightning invoice</strong> and select the
                    "Lightning" network for you.
                  </li>
                  <li>Enter the exact amount and confirm the withdrawal.</li>
                  <li>Your deposit will arrive in seconds!</li>
                </ol>
              </div>

              {/* Instructions for Wallets */}
              <div>
                <h5 className="font-bold text-xl mb-3">How to Pay from a Lightning Wallet</h5>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Open your Lightning-compatible wallet (Phoenix, Wallet of Satoshi, etc.).</li>
                  <li>Click "Send" or "Pay" in your wallet.</li>
                  <li>Scan the Lightning invoice QR code or paste the invoice text.</li>
                  <li>Confirm the amount and send.</li>
                </ol>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mt-4">
                  <h5 className="font-bold text-blue-400 mb-2">💡 Wallet Tip</h5>
                  <p className="text-sm text-gray-300">
                    If you don't have a Lightning wallet yet, we recommend <strong>Phoenix Wallet</strong> or{" "}
                    <strong>Wallet of Satoshi</strong> for beginners.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "litecoin" && (
            <div className="text-white space-y-6">
              <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                <h4 className="font-bold text-blue-400 text-lg mb-2">Great Low-Fee Option</h4>
                <p className="text-gray-200">Litecoin offers fast confirmations with minimal fees.</p>
              </div>

              <div>
                <h5 className="font-bold text-xl mb-3">Why Litecoin (LTC)?</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>
                    <strong>Low Fees:</strong> Usually $0.01 - $0.10 per transaction.
                  </li>
                  <li>
                    <strong>Fast Confirmation:</strong> 2.5 minutes average block time.
                  </li>
                  <li>
                    <strong>Widely Available:</strong> Supported by all major exchanges.
                  </li>
                  <li>
                    <strong>10% Bonus:</strong> Same bonus as other crypto methods.
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-xl mb-3">How to Send Litecoin:</h5>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Open your Litecoin wallet or exchange account.</li>
                  <li>
                    Select "Send" or "Withdraw" and choose <strong>Litecoin (LTC)</strong>.
                  </li>
                  <li>Enter the LTC address provided (or scan QR code).</li>
                  <li>Enter the exact amount shown.</li>
                  <li>Confirm and send (Wait for 3-6 confirmations).</li>
                </ol>
              </div>

              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <h5 className="font-bold text-red-400 mb-2">⚠️ Important</h5>
                <p className="text-sm text-gray-300">
                  Make sure to send the <strong>exact amount</strong> shown. The amount we receive must match for
                  automatic processing.
                </p>
              </div>
            </div>
          )}

          {activeTab === "bitcoin" && (
            <div className="text-white space-y-6">
              <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg p-4">
                <h4 className="font-bold text-orange-400 text-lg mb-2">Traditional Bitcoin (On-Chain)</h4>
                <p className="text-gray-200">This is the standard, slower Bitcoin network.</p>
              </div>

              <div>
                <h5 className="font-bold text-xl mb-3">Bitcoin (BTC) Details:</h5>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>
                    <strong>Slower Processing:</strong> 30 to 60+ minutes.
                  </li>
                  <li>
                    <strong>Higher Fees:</strong> Can be $1-$10+ depending on network congestion.
                  </li>
                  <li>
                    <strong>10% Bonus:</strong> Same bonus as other crypto methods.
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-xl mb-3">How to Send Bitcoin:</h5>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Open your Bitcoin wallet or exchange account.</li>
                  <li>
                    Select "Send" or "Withdraw" and choose <strong>Bitcoin (BTC)</strong>.
                  </li>
                  <li>
                    Make sure to select the <strong>Bitcoin (BTC)</strong> network.
                  </li>
                  <li>Enter the BTC address provided (or scan QR code).</li>
                  <li>Enter the amount (account for network fees).</li>
                  <li>Confirm and send (Wait for 3-6 confirmations).</li>
                </ol>
              </div>

              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <h5 className="font-bold text-red-400 mb-2">⚠️ Critical Information</h5>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong>Amount Matching:</strong> The amount we receive (Amount - Network Fee) must exactly match
                    your order for automatic processing.
                  </p>
                  <p>
                    <strong>Recommendation:</strong> We strongly advise using the{" "}
                    <button onClick={() => setActiveTab("lightning")} className="text-yellow-400 underline font-bold">
                      ⚡ Lightning Network
                    </button>{" "}
                    tab instead for an instant deposit with almost zero fees.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 rounded-b-lg">
          <p className="text-gray-400 text-sm text-center">
            Need help? Contact our support team for assistance with crypto deposits.
          </p>
        </div>
      </div>
    </div>
  )
}

const TabButton = ({ title, isActive, onClick, activeClasses, inactiveClasses, tabId }) => (
  <button
    id={`${tabId}-tab`}
    role="tab"
    aria-selected={isActive}
    aria-controls={`${tabId}-panel`}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onClick()
      }
    }}
    className={`flex-1 py-3 px-4 font-semibold text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
      isActive ? `${activeClasses} focus:ring-white` : `${inactiveClasses} focus:ring-blue-500`
    }`}
  >
    {title}
  </button>
)

export default CryptoInstructionsModal
