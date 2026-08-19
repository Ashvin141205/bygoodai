import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KycCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to withdrawals page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/user/withdrawals');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e0e]">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFDD15] to-[#ffd700] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-12 h-12 text-[#FFDD15]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Verification Submitted!
          </h1>
          <p className="text-black/80 text-lg font-medium">
            Thank you for completing the verification process
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Success Message */}
          <div className="mb-8">
            <div className="bg-[#222] border border-[#FFDD15]/30 rounded-xl p-6 text-center">
              <p className="text-white text-lg mb-3">
                🎉 <strong>Your verification has been successfully submitted!</strong>
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                Our team is now reviewing your documents. This process typically takes between <strong className="text-[#FFDD15]">5 to 30 minutes</strong>.
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg 
                className="w-6 h-6 mr-2 text-[#FFDD15]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              What Happens Next?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-[#FFDD15] rounded-full flex items-center justify-center text-black font-bold mr-4 mt-1">
                  1
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Review in Progress</h4>
                  <p className="text-gray-400 text-sm">
                    Our verification team is currently reviewing your submitted documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-[#FFDD15] rounded-full flex items-center justify-center text-black font-bold mr-4 mt-1">
                  2
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Email Notification</h4>
                  <p className="text-gray-400 text-sm">
                    You'll receive an email once your verification is approved or if any additional information is needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-[#FFDD15] rounded-full flex items-center justify-center text-black font-bold mr-4 mt-1">
                  3
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Start Withdrawing</h4>
                  <p className="text-gray-400 text-sm">
                    Once approved, you'll be able to request withdrawals immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-[#222] border border-[#333] rounded-xl p-6 mb-8">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <svg 
                className="w-5 h-5 mr-2 text-[#FFDD15]" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
              Important Information
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <span className="text-[#FFDD15] mr-2">•</span>
                <span>Your account remains active while verification is in progress</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFDD15] mr-2">•</span>
                <span>You can continue playing games normally</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFDD15] mr-2">•</span>
                <span>Withdrawals will be available once verification is complete</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFDD15] mr-2">•</span>
                <span>Check your email regularly for updates</span>
              </li>
            </ul>
          </div>

          {/* Auto Redirect Notice */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Redirecting you to the withdrawals page in <span className="text-[#FFDD15] font-semibold">5 seconds</span>...
            </p>
            <button
              onClick={() => navigate('/user/withdrawals')}
              className="bg-[#FFDD15] hover:bg-[#ffd700] text-black font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Withdrawals Now
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-[#333] text-center">
            <p className="text-gray-400 text-sm mb-2">
              Need assistance?
            </p>
            <a 
              href="/user/support" 
              className="text-[#FFDD15] hover:text-[#ffd700] font-medium text-sm transition-colors duration-200"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycCallback;
