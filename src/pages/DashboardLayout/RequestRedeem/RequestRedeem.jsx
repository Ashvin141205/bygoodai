import React, { useEffect, useState, memo } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS, EXTRA_ENDPOINTS, getApiUrl } from '../../../config/apiEndpoints';
import Modal from 'react-modal'; // You'll need to install this: `npm install react-modal`

// Set the app element for react-modal to avoid accessibility warnings
Modal.setAppElement('#root'); // Replace '#root' with the ID of your app's root element

const RequestRedeem = () => {
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [cashAppTag, setCashAppTag] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [updateGame, setUpdateGame] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [validatingCashTag, setValidatingCashTag] = useState(false);
  const [cashTagValidated, setCashTagValidated] = useState(false);
  const [cashTagError, setCashTagError] = useState('');
  const { activeLevel, token, user } = useSelector(state => state.auth);

  const [withdrawableAmount, setWithdrawableAmount] = useState(null);
  const [withdrawableMessage, setWithdrawableMessage] = useState('');
  const [pendingRedeemable, setPendingRedeemable] = useState(null);

  // NEW STATES FOR BREAKDOWN DETAILS
  const [depositBreakdown, setDepositBreakdown] = useState([]);
  const [bonusBreakdown, setBonusBreakdown] = useState([]);
  const [freeplayBreakdown, setFreeplayBreakdown] = useState([]);
  const [lastRedeemDate, setLastRedeemDate] = useState(null); // To display "After last redeem on..."

  // NEW STATES FOR FEE CALCULATION
  const [feeString, setFeeString] = useState(null);
  const [finalPayoutString, setFinalPayoutString] = useState(null);

  // KYC MODAL STATES
  const [kycRequired, setKycRequired] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [privacyWarningModalOpen, setPrivacyWarningModalOpen] = useState(false); // New: Privacy warning popup

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for redemption rules modal visibility
  const [breakdownModalIsOpen, setBreakdownModalIsOpen] = useState(false); // State for breakdown modal visibility

  const profileFirstName = String(user?.first_name || user?.firstName || '').trim();
  const profileLastName = String(user?.last_name || user?.lastName || '').trim();
  const profilePhone = String(user?.phone || '').trim();
  const isWithdrawalProfileComplete = Boolean(profileFirstName && profileLastName && profilePhone);

  const goToProfileCompletion = () => {
    navigate('/profile', {
      state: {
        requireWithdrawalProfileCompletion: true,
        source: 'request_redeem',
      },
    });
  };

  // Effect to calculate fees when withdrawable amount or method changes
  useEffect(() => {
    if (withdrawableAmount !== null && withdrawableAmount > 0) {
      switch (withdrawalMethod) {
        case 'Main Wallet': {
          setFeeString("Fee: $0.00 (Free)");
          setFinalPayoutString(`You will receive: $${withdrawableAmount.toFixed(2)}`);
          break;
        }
        case 'CashApp': {
          const fee = withdrawableAmount * 0.07;
          const final = withdrawableAmount - fee;
          setFeeString(`Fee: $${fee.toFixed(2)} (7%)`);
          setFinalPayoutString(`You will receive: $${final.toFixed(2)}`);
          break;
        }
        case 'PayPal': {
          const fee = withdrawableAmount * 0.05;
          const final = withdrawableAmount - fee;
          setFeeString(`Fee: $${fee.toFixed(2)} (5%)`);
          setFinalPayoutString(`You will receive: $${final.toFixed(2)}`);
          break;
        }
        default:
          setFeeString(null);
          setFinalPayoutString(null);
      }
    } else {
      setFeeString(null);
      setFinalPayoutString(null);
    }
  }, [withdrawableAmount, withdrawalMethod]);

  // Cash App tag validation function - auto validate on blur
  const validateCashAppTag = async () => {
    const cleanTag = cashAppTag.replace(/^\$/, '');
    
    if (!cleanTag) {
      setCashTagValidated(false);
      setCashTagError('');
      return;
    }

    try {
      setValidatingCashTag(true);
      setCashTagError('');
      
      // Call backend API to validate cashtag
      const response = await fetch(getApiUrl(EXTRA_ENDPOINTS.CHECK_CASHTAG), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cashtag: cleanTag }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', responseText);
        throw new Error('Invalid response from server');
      }

      setValidatingCashTag(false);
      
      if (data.valid && data.exists) {
        setCashTagValidated(true);
        setCashTagError('');
        toast.success(`✓ ${data.cashtag} verified!`);
      } else if (data.valid && !data.exists) {
        setCashTagError('Cash App tag not found. Please verify your $Cashtag.');
        setCashTagValidated(false);
        toast.error('Cash App tag not found.');
      } else {
        setCashTagError(data.error || 'Invalid Cash App tag format.');
        setCashTagValidated(false);
        toast.error(data.error || 'Invalid format.');
      }
    } catch (error) {
      setValidatingCashTag(false);
      console.error('Error validating Cash App tag:', error);
      setCashTagError('Could not verify Cash App tag. Please try again.');
      setCashTagValidated(false);
      toast.error('Validation failed. Please try again.');
    }
  };

  // Handle Cash App tag input change - reset validation when user edits
  const handleCashAppTagChange = (e) => {
    setCashAppTag(e.target.value);
    // Reset validation state when user changes the tag
    setCashTagValidated(false);
    setCashTagError('');
  };

  // Auto-validate on blur
  const handleCashAppBlur = () => {
    if (cashAppTag && cashAppTag.trim() !== '') {
      validateCashAppTag();
    }
  };

  const handleGameChange = (event) => {
    const selectedGameId = event.target.value;
    const selectedGame = updateGame.find(game => game.game_id === selectedGameId);
    setSelectedGame(selectedGame);
    setDisabled(false);

    if (selectedGame) {
      setUsername(selectedGame.username);
    }
  };

  const handleCheckWithdrawable = async () => {
    if (!isWithdrawalProfileComplete) {
      const message = 'Complete your profile (first name, last name, and phone number) before requesting withdrawals.';
      setError(message);
      toast.warning(message);
      return;
    }

    setWithdrawableAmount(null);
    setWithdrawableMessage('');
    setPendingRedeemable(null);
    setDepositBreakdown([]);
    setBonusBreakdown([]);
    setFreeplayBreakdown([]);
    setLastRedeemDate(null);
    setKycRequired(false);
    setKycData(null);

    // Show privacy warning modal first
    setPrivacyWarningModalOpen(true);
  };

  // New function to actually check withdrawable after user agrees to privacy policy
  const proceedWithWithdrawalCheck = async () => {
    if (!amount || parseFloat(amount) < 20) {
      setError('The minimum withdrawal amount is $20.00.');
      toast.error('The minimum withdrawal amount is $20.00.');
      return;
    }
    if (!selectedGame) {
      setError('Please select a game.');
      toast.error('Please select a game.');
      return;
    }
    setError('');

    try {
      // STEP 1: Check KYC requirement FIRST
      const kycResponse = await ApiHandler(
        API_ENDPOINTS.WITHDRAWAL.CHECK_KYC_REQUIRED,
        'POST',
        { withdrawal_amount: parseFloat(amount) },
        token,
        dispatch,
        navigate
      );

      if (kycResponse.data.status.code === 1) {
        const kycCheckData = kycResponse.data.data;
        setKycData(kycCheckData);

        // If KYC is required, check the status
        if (kycCheckData.kyc_required) {
          setKycRequired(true);
          
          // CRITICAL: If KYC status is PENDING, block all withdrawals
          if (kycCheckData.kyc_status === 'pending') {
            setKycModalOpen(true);
            toast.warning('⏳ KYC verification is pending. Please wait for approval or retry verification.');
            return; // Block withdrawal
          }
          
          // If KYC is required and risk is HIGH or CRITICAL, show modal and block
          if (kycCheckData.risk_level === 'HIGH' || kycCheckData.risk_level === 'CRITICAL') {
            setKycModalOpen(true);
            toast.error('KYC verification required before withdrawal. Please complete verification.');
            return; // Block withdrawal
          } else if (kycCheckData.risk_level === 'MEDIUM') {
            toast.info('⚠️ Account will be monitored. Withdrawal allowed but may require verification later.');
          }
        }
      }

      // STEP 2: If KYC check passed or LOW risk, proceed with normal withdrawal check
      const response = await ApiHandler(API_ENDPOINTS.WITHDRAWAL.GET_WITHDRAWABLE, 'POST', { amount, game_id: selectedGame.game_id }, token, dispatch, navigate);
      if (response.data.status.code === 1) {
        const data = response.data.data;
        console.log(data);
        setWithdrawableAmount(data.withdrawable_amount);
        setWithdrawableMessage(response.data.status.message);
        setPendingRedeemable(data.pending_redeemable);

        setDepositBreakdown(data.deposit_breakdown || []);
        setBonusBreakdown(data.bonus_breakdown || []);
        setFreeplayBreakdown(data.freeplay_breakdown || []);
        setLastRedeemDate(data.last_redeem_date || null);

        toast.success('Withdrawable amount calculated successfully.');
      } else {
        setWithdrawableAmount(null);
        setWithdrawableMessage(response.data.status.message || 'Failed to calculate withdrawable amount.');
        setPendingRedeemable(null);
        setDepositBreakdown([]);
        setBonusBreakdown([]);
        setFreeplayBreakdown([]);
        setLastRedeemDate(null);
        toast.error(response.data.status.message || 'Failed to calculate withdrawable amount.');
      }
    } catch (error) {
      setWithdrawableAmount(null);
      setWithdrawableMessage('');
      setPendingRedeemable(null);
      setDepositBreakdown([]);
      setBonusBreakdown([]);
      setFreeplayBreakdown([]);
      setLastRedeemDate(null);
      toast.error('Error calculating withdrawable amount. Please try again.');
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await ApiHandler(API_ENDPOINTS.GAME.MY_GAMES, 'GET', undefined, token, dispatch, navigate);
      if (response.data.status.code === 1) {
        const data = response.data.data;
        setUpdateGame(data);
      } else {
        setUpdateGame([]);
        setFetchError('Failed to fetch game data');
      }
    } catch (error) {
      setUpdateGame([]);
      setFetchError('Error fetching game data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isWithdrawalProfileComplete) {
      const message = 'Complete your profile (first name, last name, and phone number) before submitting a withdrawal.';
      setError(message);
      toast.warning(message);
      return;
    }

    // Validate minimum withdrawal amount
    if (!amount || parseFloat(amount) < 20) {
      setError('The minimum withdrawal amount is $20.00.');
      toast.error('The minimum withdrawal amount is $20.00.');
      return;
    }

    // CRITICAL: Block submission if KYC is pending
    if (kycData && kycData.kyc_status === 'pending') {
      setKycModalOpen(true);
      toast.warning('⏳ Cannot withdraw: KYC verification is pending. Please wait for approval.');
      return;
    }

    // Block submission if KYC is required
    if (kycRequired) {
      setKycModalOpen(true);
      toast.error('KYC verification required. Please complete verification first.');
      return;
    }

    if (!withdrawableAmount) {
      setError('Please check your withdrawable status first.');
      toast.error('Please check your withdrawable status first.');
      return;
    }

    if (withdrawalMethod === 'PayPal' && !paypalEmail) {
      setError('PayPal email is required.');
      toast.error('PayPal email is required.');
      return;
    }

    if (withdrawalMethod === 'CashApp') {
      if (!cashAppTag) {
        setError('Cash App tag is required.');
        toast.error('Cash App tag is required.');
        return;
      }
      
      // Check if Cash App tag is validated
      if (!cashTagValidated) {
        setError('Please wait for Cash App tag validation to complete or enter a valid tag.');
        toast.error('Cash App tag must be validated first.');
        return;
      }
    }

    if (!user?.email) {
      setError('Unable to verify your email. Please re-login and try again.');
      toast.error('Session data is incomplete. Please login again.');
      return;
    }

    const body = {
      game_id: selectedGame?.game_id,
      email: user?.email,
      phone: user?.phone,
      game_name: selectedGame?.game_name,
      game_username: username,
      amount: amount,
      withdrawal_method: withdrawalMethod,
      crypto_user_id:
        withdrawalMethod === 'CashApp'
          ? cashAppTag
          : withdrawalMethod === 'PayPal'
            ? paypalEmail
            : '',
      withdrawable_amount: withdrawableAmount,
    };    try {
      const response = await ApiHandler(API_ENDPOINTS.WITHDRAWAL.SUBMIT_REQUEST, 'POST', body, token, dispatch, navigate);

      if (response.data.status.code === 1) {
        await handleSilentEmailBreakdown(); // This is the new line. Use await to ensure it runs to completion.
        toast.success('Your request has been successfully submitted and will be processed within an hour.');
        setError('');
        setWithdrawalMethod('');
        setCashAppTag('');
        setCashTagValidated(false);
        setCashTagError('');
        setPaypalEmail('');
        setSelectedGame(null);
        setAmount('');
        setWithdrawableAmount(null);
        setWithdrawableMessage('');
        setPendingRedeemable(null);
        setDepositBreakdown([]);
        setBonusBreakdown([]);
        setFreeplayBreakdown([]);
        setLastRedeemDate(null);
        navigate('/user/withdrawals');
      } else {
        const errorMessage = response.data.status.message || 'Failed to submit redeem request.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Submit redeem error:', error);
      const errorMessage = error?.response?.data?.status?.message || 'Error submitting redeem request. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const validGames = updateGame.filter(game => game.username && game.password);

  if (loading) return <div className="text-white text-center">Loading games...</div>;

  // Helper to calculate total for a breakdown array
  const calculateTotal = (breakdownArray) => {
    return breakdownArray.reduce((sum, item) => sum + Math.abs(parseFloat(item.amount)), 0);
  };

  const totalDeposits = calculateTotal(depositBreakdown);
  const totalBonuses = calculateTotal(bonusBreakdown);
  const totalFreeplay = calculateTotal(freeplayBreakdown);

  // KYC MODAL RENDER FUNCTION
  // Privacy Warning Modal - Clean modern design
  const renderPrivacyWarningModal = () => {
    return (
      <Modal
        isOpen={privacyWarningModalOpen}
        onRequestClose={() => setPrivacyWarningModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            transform: 'none',
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid #333',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
            height: '95vh',
            maxHeight: '95vh',
            overflowY: 'auto',
            margin: '0',
          },
        }}
      >
        {/* Header */}
        <div style={{
          background: '#222',
          padding: '24px 24px 20px',
          borderBottom: '1px solid #333',
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            Privacy & Verification
          </h2>
          <p style={{
            margin: '8px 0 0',
            fontSize: '14px',
            color: '#999',
            lineHeight: '1.5'
          }}>
            Please review our verification policy before continuing
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Main Notice */}
          <div style={{
            background: '#222',
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #333',
            borderTop: '3px solid rgb(255, 221, 21)',
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#ccc', 
              margin: 0,
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#fff' }}>No KYC Required for Normal Users.</strong> Identity verification may be requested for unusual activity patterns to protect your account and our platform.
            </p>
          </div>

          {/* Verification Triggers */}
          <div style={{
            marginBottom: '20px',
          }}>
            <p style={{ 
              color: '#fff', 
              fontWeight: '600', 
              marginBottom: '12px', 
              fontSize: '14px' 
            }}>
              Verification may be required for:
            </p>
            <div style={{ 
              margin: 0, 
              color: '#999', 
              fontSize: '13px',
              lineHeight: '1.8',
            }}>
              <p style={{ marginBottom: '12px', color: '#ccc' }}>
                While we strive to provide a seamless, KYC-free experience for our users, 
                we reserve the right to request identity verification (KYC) when suspicious 
                activity is detected, including but not limited to:
              </p>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '20px', 
                listStyle: 'none'
              }}>
                <li>→ Multiple account violations or creation attempts</li>
                <li>→ Abnormal withdrawal-to-deposit ratios</li>
                <li>→ Suspicious wagering patterns</li>
                <li>→ Anti-fraud and AML compliance requirements</li>
              </ul>
            </div>
          </div>

          {/* Data Protection */}
          <div style={{
            background: '#222',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #333',
            marginBottom: '20px',
          }}>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#fff'
            }}>
              Data Protection
            </p>
            <p style={{ 
              margin: '0 0 12px 0', 
              fontSize: '13px', 
              color: '#ccc',
              lineHeight: '1.6'
            }}>
              We use <strong style={{ color: '#FFDD15' }}>Veriff.com</strong> for verification. 
              We do not store your personal documents or sensitive data on our servers.
            </p>
            <div style={{ fontSize: '12px', color: '#999', lineHeight: '1.8' }}>
              <div>• Secure verification by trusted third-party</div>
              <div>• Your information is never shared</div>
              <div>• Bank-level encryption standards</div>
              <div>• Documents deleted after verification</div>
            </div>
          </div>

          {/* Footer Note */}
          <p style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '24px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            Responsible Gaming: Visit{' '}
            <a 
              href="https://www.begambleaware.org" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#FFDD15', textDecoration: 'none' }}
            >
              BeGambleAware.org
            </a>
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={() => {
                setPrivacyWarningModalOpen(false);
                proceedWithWithdrawalCheck();
              }}
              style={{
                width: '100%',
                background: '#FFDD15',
                color: '#000',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = '#ffd700'}
              onMouseLeave={(e) => e.target.style.background = '#FFDD15'}
            >
              I Understand — Continue
            </button>
            <button
              onClick={() => setPrivacyWarningModalOpen(false)}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#999',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#222';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // Simplified KYC Modal - Clean modern design
  const renderKycModal = () => {
    if (!kycModalOpen || !kycData) return null;

    const getRiskColor = (riskLevel) => {
      switch (riskLevel) {
        case 'CRITICAL': return '#dc2626';
        case 'HIGH': return '#f97316';
        case 'MEDIUM': return '#FFDD15';
        case 'LOW': return '#22c55e';
        default: return '#6b7280';
      }
    };

    // Check if KYC is pending
    const isPending = kycData.kyc_status === 'pending';
    const hasVeriffUrl = kycData.veriff_session_url && kycData.veriff_session_url.trim() !== '';

    return (
      <Modal
        isOpen={kycModalOpen}
        onRequestClose={() => setKycModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            transform: 'none',
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '480px',
            width: '90%',
            border: '1px solid #333',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
            height: '95vh',
            maxHeight: '95vh',
            overflowY: 'auto',
            margin: '0',
          },
        }}
      >
        {/* Header */}
        <div style={{
          background: '#222',
          padding: '24px',
          borderBottom: '1px solid #333',
        }}>
          <div style={{ 
            display: 'inline-block',
            background: isPending ? '#FFDD15' : getRiskColor(kycData.risk_level),
            color: (isPending || kycData.risk_level === 'MEDIUM') ? '#000' : '#fff',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '12px',
          }}>
            {isPending ? '⏳ PENDING REVIEW' : 'Unusual activity detected'}
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#fff',
          }}>
            {isPending ? 'Verification Under Review' : 'Verification Required'}
          </h2>
          <p style={{
            margin: '8px 0 0',
            fontSize: '14px',
            color: '#999',
          }}>
            {isPending ? 'Your verification is being processed' : 'Please complete identity verification to proceed'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Reason */}
          <div style={{
            background: '#222',
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #333',
            borderLeft: `3px solid ${isPending ? '#FFDD15' : getRiskColor(kycData.risk_level)}`,
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: '#ccc', 
              margin: 0,
              lineHeight: '1.6'
            }}>
              {isPending 
                ? 'Your verification documents are currently under review. You cannot withdraw funds until the verification is complete. This typically takes 5-30 minutes.' 
                : (kycData.reasons && kycData.reasons.length > 0 ? kycData.reasons[0] : kycData.reason)
              }
            </p>
          </div>

          {/* Current Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#222',
            borderRadius: '10px',
            border: '1px solid #333',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '14px', color: '#999', fontWeight: '500' }}>
              Current Status
            </span>
            <div style={{
              backgroundColor: kycData.kyc_status === 'approved' ? '#22c55e' : 
                            kycData.kyc_status === 'pending' ? '#FFDD15' : '#666',
              color: kycData.kyc_status === 'pending' ? '#000' : '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {kycData.kyc_status === 'approved' ? 'APPROVED' : 
               kycData.kyc_status === 'pending' ? 'PENDING' : 'NOT STARTED'}
            </div>
          </div>

          {/* Processing Time */}
          {isPending && (
            <div style={{
              background: '#222',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #333',
              marginBottom: '24px',
            }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#ccc',
                margin: 0,
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#FFDD15' }}>⏱️ Typical review time:</strong> 5-30 minutes
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#999',
                margin: '8px 0 0',
                lineHeight: '1.6'
              }}>
                You'll be notified via email once your verification is complete.
              </p>
            </div>
          )}

          {!isPending && (
            <div style={{
              background: '#222',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #333',
              marginBottom: '24px',
            }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#ccc',
                margin: 0,
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#fff' }}>Estimated time:</strong> 5-10 minutes
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isPending && hasVeriffUrl ? (
              // Show "Retry Verification" button if pending and has URL
              <button
                onClick={() => {
                  // Open existing Veriff session URL - Safari compatible
                  const veriffWindow = window.open(kycData.veriff_session_url, '_blank', 'width=800,height=900');
                  
                  if (!veriffWindow || veriffWindow.closed || typeof veriffWindow.closed === 'undefined') {
                    // Popup was blocked
                    toast.error('Popup blocked! Please allow popups for this site and try again.');
                    // Fallback: navigate in same tab
                    window.location.href = kycData.veriff_session_url;
                  } else {
                    setKycModalOpen(false);
                    toast.info('Opening your verification session. Please complete the verification process.');
                  }
                }}
                style={{
                  width: '100%',
                  background: '#FFDD15',
                  color: '#000',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#ffd700'}
                onMouseLeave={(e) => e.target.style.background = '#FFDD15'}
              >
                🔄 Retry Verification
              </button>
            ) : isPending ? (
              // Show waiting message if pending but no URL
              <div style={{
                width: '100%',
                background: '#222',
                padding: '14px',
                border: '1px solid #FFDD15',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#FFDD15',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  ⏳ Please wait for verification review
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#999',
                  margin: '8px 0 0'
                }}>
                  You'll be notified when complete
                </p>
              </div>
            ) : (
              // Show "Start Verification" button if not pending
              <button
                onClick={async () => {
                  try {
                    // Open popup IMMEDIATELY (before async call) - Safari requires this
                    const veriffWindow = window.open('', '_blank', 'width=800,height=900');
                    
                    if (!veriffWindow || veriffWindow.closed || typeof veriffWindow.closed === 'undefined') {
                      // Popup was blocked
                      toast.error('Popup blocked! Please allow popups for this site and try again.');
                      return;
                    }
                    
                    // Show loading message in the popup
                    veriffWindow.document.write(`
                      <html>
                        <head>
                          <style>
                            body { 
                              margin: 0; 
                              padding: 0; 
                              display: flex; 
                              align-items: center; 
                              justify-content: center; 
                              height: 100vh; 
                              background: #1a1a1a; 
                              font-family: sans-serif;
                              color: #fff;
                            }
                            .loader { 
                              text-align: center; 
                            }
                            .spinner {
                              border: 4px solid #333;
                              border-top: 4px solid #FFDD15;
                              border-radius: 50%;
                              width: 40px;
                              height: 40px;
                              animation: spin 1s linear infinite;
                              margin: 0 auto 20px;
                            }
                            @keyframes spin {
                              0% { transform: rotate(0deg); }
                              100% { transform: rotate(360deg); }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="loader">
                            <div class="spinner"></div>
                            <p>Loading verification...</p>
                          </div>
                        </body>
                      </html>
                    `);

                    // Call your backend to create Veriff session
                    if (!user?.id || !user?.email) {
                      veriffWindow.close();
                      toast.error('Missing account details. Please login again and retry verification.');
                      return;
                    }

                    const response = await fetch(getApiUrl(EXTRA_ENDPOINTS.VERIFF_INTEGRATION), {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        user_id: user?.id,
                        email: user?.email,
                        first_name: user?.first_name || 'User',
                        last_name: user?.last_name || 'Name'
                      })
                    });

                    const data = await response.json();

                    if (data.success && data.sessionUrl) {
                      // Redirect the already-open popup to Veriff URL
                      veriffWindow.location.href = data.sessionUrl;
                      setKycModalOpen(false);
                      toast.success('Verification window opened. Please complete the verification process.');
                    } else {
                      veriffWindow.close();
                      toast.error('Failed to start verification. Please try again.');
                    }
                  } catch (error) {
                    console.error('Veriff integration error:', error);
                    toast.error('An error occurred. Please contact support.');
                  }
                }}
                style={{
                  width: '100%',
                  background: '#FFDD15',
                  color: '#000',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#ffd700'}
                onMouseLeave={(e) => e.target.style.background = '#FFDD15'}
              >
                Start Verification
              </button>
            )}
            <button
              onClick={() => setKycModalOpen(false)}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#999',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#222';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // NEW: Function to format breakdown data into a text string
  const formatBreakdownForFile = () => {
    let content = 'Redemption Breakdown Details\n\n';
    if (lastRedeemDate) {
      content += `Activity considered after last redeem on: ${new Date(lastRedeemDate).toLocaleString()}\n\n`;
    }

    if (depositBreakdown.length > 0) {
      content += `--- Deposit Funds Used: $${totalDeposits.toFixed(2)} ---\n`;
      depositBreakdown.forEach(item => {
        content += `- $${Math.abs(item.amount).toFixed(2)} (via ${item.method}) on ${new Date(item.date).toLocaleString()}\n`;
      });
      content += '\n';
    }

    if (bonusBreakdown.length > 0) {
      content += `--- Bonus Funds Used: $${totalBonuses.toFixed(2)} ---\n`;
      bonusBreakdown.forEach(item => {
        content += `- $${Math.abs(item.amount).toFixed(2)} (via ${item.method}) on ${new Date(item.date).toLocaleString()}\n`;
      });
      content += '\n';
    }

    if (freeplayBreakdown.length > 0) {
      content += `--- FreePlay Funds Used: $${totalFreeplay.toFixed(2)} ---\n`;
      freeplayBreakdown.forEach(item => {
        content += `- $${Math.abs(item.amount).toFixed(2)} (via ${item.method}) on ${new Date(item.date).toLocaleString()}\n`;
      });
      content += '\n';
    }

    content += `Withdrawable Amount: $${withdrawableAmount.toFixed(2)}`;

    return content;
  };

  // NEW: Function to handle the file download
  const handleDownloadBreakdown = () => {
    const fileContent = formatBreakdownForFile();
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `redemption_breakdown_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEmailBreakdown = async () => {
    if (!user?.email) {
      toast.error('Email not found for your account. Please refresh and try again.');
      return;
    }

    const breakdownData = {
      lastRedeemDate,
      depositBreakdown,
      bonusBreakdown,
      freeplayBreakdown,
      withdrawableAmount,
    };

    const emailBody = {
      action: 'send_email',
      recipientEmail: user?.email,
      breakdownData,
    };

    try {
      const response = await ApiHandler(API_ENDPOINTS.NOTIFICATION.SEND_EMAIL, 'POST', emailBody, token, dispatch, navigate);
      console.log(response);
      if (response.data.status.code === 1) {
        toast.success('Breakdown sent to your email and stored successfully!');
      } else {
        toast.error(response.data.status.message || 'Failed to send email and save data.');
      }
    } catch (error) {
      toast.error('An error occurred while processing your request. Please try again.');
    }
  };

  // NEW FUNCTION: This is the function that will be called from handleSubmit
  const handleSilentEmailBreakdown = async () => {
    if (!user?.email) {
      return;
    }

    const breakdownData = {
      lastRedeemDate,
      depositBreakdown,
      bonusBreakdown,
      freeplayBreakdown,
      withdrawableAmount,
    };

    const emailBody = {
      action: 'send_email',
      recipientEmail: user?.email,
      breakdownData,
    };

    try {
      // We intentionally do not await here, as this is a non-critical background task.
      // Also, we do not show any toast messages.
      ApiHandler(API_ENDPOINTS.NOTIFICATION.SEND_EMAIL, 'POST', emailBody, token, dispatch, navigate);
    } catch (error) {
      // Log the error for internal monitoring, but don't show it to the user.
      console.error("Failed to send breakdown email silently:", error);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#0e0e0e]">
      {renderPrivacyWarningModal()}
      {renderKycModal()}
      <div className="bg-[#222222] text-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold text-center text-[#FFDD15] underline mb-4">Request Redeem</h2>

        {/* Show Rules Button and Modal */}
        <div className="mb-6">
          <button
            className="w-full bg-[#222] hover:bg-[#2a2a2a] text-[#FFDD15] font-medium py-2.5 px-4 rounded-lg border border-[#333] transition-all duration-200"
            onClick={() => setModalIsOpen(true)}
          >
            View Redemption Rules & Examples
          </button>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.90)',
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              content: {
                position: 'relative',
                top: 'auto',
                left: 'auto',
                right: 'auto',
                bottom: 'auto',
                transform: 'none',
                backgroundColor: '#1a1a1a',
                color: 'white',
                borderRadius: '12px',
                padding: '0',
                maxWidth: '550px',
                width: '95%',
                border: '1px solid #333',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                height: '95vh',
                maxHeight: '95vh',
                overflowY: 'auto',
                margin: '0',
              },
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: '#222',
              padding: '18px 20px',
              borderBottom: '1px solid #333',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Redemption Rules & Examples
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#aaa',
                margin: '8px 0 0',
                lineHeight: '1.5'
              }}>
                Understanding how withdrawable amounts are calculated
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px' }}>
              {/* Freeplay Section */}
              <div style={{
                background: '#222',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '16px',
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFDD15',
                  margin: '0 0 12px 0',
                }}>
                  Freeplay Deposit Redemption
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  color: '#ddd',
                  fontSize: '15px',
                  lineHeight: '2',
                  listStyle: 'none'
                }}>
                  <li>→ Free plays are earned through campaigns</li>
                  <li>→ Free plays can be used for deposits</li>
                  <li>→ Free plays cannot be withdrawn directly</li>
                  <li style={{ color: '#FFDD15' }}>
                    <strong>→ 30% of winnings</strong> can be withdrawn when playing with Freeplay Balance
                  </li>
                </ul>
              </div>

              {/* Bonus & Deposit Section */}
              <div style={{
                background: '#222',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '16px',
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFDD15',
                  margin: '0 0 12px 0',
                }}>
                  Bonus Deposit Redemption
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  color: '#ddd',
                  fontSize: '15px',
                  lineHeight: '2',
                  listStyle: 'none'
                }}>
                  <li>→ Bonus earned through deposits</li>
                  <li>→ Bonus earned from sharing</li>
                  <li>→ Earned from weekly challenges</li>
                  <li style={{ color: '#FFDD15' }}>
                    <strong>→ Its withdrawable ratio is 25%</strong>
                  </li>
                </ul>
              </div>

              {/* Credit Deposit Section */}
              <div style={{
                background: '#222',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '16px',
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFDD15',
                  margin: '0 0 12px 0',
                }}>
                  Credit Deposit Redemption
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  color: '#ddd',
                  fontSize: '15px',
                  lineHeight: '2',
                  listStyle: 'none'
                }}>
                  <li>→ Deposit through wallet, PayPal, credit card, crypto etc</li>
                  <li>→ Direct balance deposit</li>
                  <li style={{ color: '#FFDD15' }}>
                    <strong>→ 100% withdrawable ratio</strong>
                  </li>
                </ul>
              </div>

              {/* Example Section */}
              <div style={{
                background: '#222',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #333',
                marginBottom: '16px',
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFDD15',
                  margin: '0 0 12px 0',
                }}>
                  Example Calculation
                </h4>
                <div style={{
                  background: '#1a1a1a',
                  padding: '14px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#ddd',
                  lineHeight: '2',
                  fontFamily: 'monospace'
                }}>
                  <div>Balance: $100 (50% deposit + 50% bonus)</div>
                  <div>Win: $200</div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
                    Deposit contribution: $100 × 100% = $100
                  </div>
                  <div>Bonus contribution: $100 × 25% = $25</div>
                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: '1px solid #333',
                    color: '#FFDD15',
                    fontWeight: 'bold'
                  }}>
                    Withdrawable: $125
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div style={{
                background: '#222',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #333',
              }}>
                <h4 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFDD15',
                  margin: '0 0 12px 0',
                }}>
                  Important Notes
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  color: '#ddd',
                  fontSize: '15px',
                  lineHeight: '2',
                  listStyle: 'none'
                }}>
                  <li>→ Activity tracked after your last redemption</li>
                  <li>→ Minimum withdrawal: $20</li>
                  <li>→ Pending redemptions affect withdrawable balance. You must wait for previous withdrawal approval before submitting a new request</li>
                  <li>→ Processing time: 10-30 minutes (non-crypto) | 30 minutes - 24 hours (crypto)</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 18px',
              borderTop: '1px solid #333',
              position: 'sticky',
              bottom: 0,
              background: '#1a1a1a',
            }}>
              <button
                onClick={() => setModalIsOpen(false)}
                style={{
                  width: '100%',
                  background: '#FFDD15',
                  color: '#000',
                  padding: '13px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#ffd700'}
                onMouseLeave={(e) => e.target.style.background = '#FFDD15'}
              >
                Got It
              </button>
            </div>
          </Modal>
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Select a Game</label>
          <select
            className="w-full px-2 py-3 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
            onChange={handleGameChange}
            defaultValue=""
          >
            <option value="" disabled>
              {updateGame.length > 0 && validGames.length > 0 ? 'Select a Game' : 'No games available'}
            </option>
            {validGames.map(game => (
              <option key={game.game_id} value={game.game_id}>
                {game.game_name}
              </option>
            ))}
          </select>
        </div>

        {selectedGame && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-white border border-gray-700 bg-black">
              <thead>
                <tr className="bg-black">
                  <th className="px-4 py-2 text-white/50 font-normal">Logo</th>
                  <th className="px-4 py-2 text-white/50 font-normal">Name</th>
                  <th className="px-4 py-2 text-white/50 font-normal">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2">
                    <img
                      src={`${selectedGame.game_image}`}
                      alt={selectedGame.game_name}
                      className="w-20 h-20 rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-2">{selectedGame.game_name}</td>
                  <td className="px-4 py-2 text-[#01D370]">${selectedGame.game_price}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white mb-2">Amount ($)</label>
          {/* Withdrawal Note */}
          {selectedGame && (
            <div className="text-red-500 text-sm mb-4">
              Note: To withdraw money from a game, you need to request the full amount that is available in game. Partial withdrawals are not allowed.
              <br />
              Any extra credits over your plan level's daily withdrawal limit amount will be voided.
            </div>
          )}
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter an amount"
            className="w-full p-2 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
          />

          {activeLevel ? (
            <div className="text-sm text-gray-400">
              Your {activeLevel.title} level's daily withdrawal limit:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(activeLevel.withdrawal_limit || 100)}
              {pendingRedeemable !== null && (
                <>
                  , Pending withdrawal daily limit:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(pendingRedeemable)}
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Your account level information is currently unavailable.
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-white mb-2">Withdrawal Method</label>
          <select
            value={withdrawalMethod}
            onChange={e => {
              setWithdrawalMethod(e.target.value);
              // Reset Cash App validation when method changes
              setCashTagValidated(false);
              setCashTagError('');
            }}
            className="w-full p-2 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
          >
            <option value="">Select a method</option>
            <option value="PayPal">PayPal</option>
            <option value="Main Wallet">Main Wallet</option>
            <option value="CashApp">CashApp</option>
          </select>
        </div>

        {withdrawalMethod === 'CashApp' && (
          <div className="mb-4">
            <label className="block text-white mb-2">Cash App Tag ($Cashtag)</label>
            <div className="relative">
              <input
                type="text"
                value={cashAppTag}
                onChange={handleCashAppTagChange}
                onBlur={handleCashAppBlur}
                placeholder="Enter your $Cashtag (e.g., $JohnDoe)"
                className="w-full py-3 px-2 pr-10 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
                disabled={validatingCashTag}
              />
              {/* Validation Status Icon */}
              {validatingCashTag && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              )}
              {cashTagValidated && !validatingCashTag && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-xl">
                  ✅
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {cashTagValidated ? (
                <span className="text-green-400">✓ Cash App tag verified successfully</span>
              ) : validatingCashTag ? (
                <span className="text-yellow-400">Validating...</span>
              ) : (
                'Enter your Cash App username (validates automatically)'
              )}
            </p>

            {/* Validation Error Message */}
            {cashTagError && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500 rounded-md">
                <p className="text-red-500 text-sm">❌ {cashTagError}</p>
              </div>
            )}
          </div>
        )}

        {withdrawalMethod === 'PayPal' && (
          <div className="mb-4">
            <label className="block text-white mb-2">PayPal Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="Enter your PayPal email"
              className="w-full p-2 border border-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-black"
            />
          </div>
        )}

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {fetchError && <div className="text-red-500 text-sm mb-4">{fetchError}</div>}

        {!isWithdrawalProfileComplete && (
          <div className="mb-4 p-3 rounded-md border border-yellow-500 bg-yellow-500/10">
            <p className="text-yellow-300 text-sm mb-2">
              Withdrawal is locked until your profile is complete. Please add your first name, last name, and phone number.
            </p>
            <button
              type="button"
              onClick={goToProfileCompletion}
              className="px-3 py-2 rounded-md bg-[#FFDD15] text-black font-semibold"
            >
              Complete Profile
            </button>
          </div>
        )}

        <button
          onClick={handleCheckWithdrawable}
          className={`w-full py-2 rounded-md font-bold text-lg mb-2 ${
            isWithdrawalProfileComplete ? 'bg-yellow-500 text-black' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
          disabled={!isWithdrawalProfileComplete}
        >
          Check Withdrawable Amount
        </button>

        {/* Privacy Warning Modal removed - now a popup modal below */}

        {withdrawableAmount !== null && (
          <div className="mb-4">
            <div className="text-white">
              Calculated Withdrawable Amount: <span className="text-green-400">${withdrawableAmount.toFixed(2)}</span>
            </div>
            {withdrawableMessage && (
              <div className="text-gray-400 text-sm mt-1">
                {withdrawableMessage}
                {/* Button to toggle the breakdown modal */}
                {(depositBreakdown.length > 0 || bonusBreakdown.length > 0 || freeplayBreakdown.length > 0) && (
                  <button
                    onClick={() => setBreakdownModalIsOpen(true)}
                    className="text-blue-500 hover:underline ml-1"
                  >
                    View Breakdown
                  </button>
                )}
              </div>
            )}

            {/* NEW FEE DISPLAY */}
            {feeString && (
              <div className="text-yellow-400 text-sm mt-2">
                {feeString}
              </div>
            )}
            {finalPayoutString && (
              <div className="text-lg font-bold text-green-400 mt-1">
                {finalPayoutString}
              </div>
            )}
          </div>
        )}

        {/* NEW: Breakdown Details Modal */}
        <Modal
          isOpen={breakdownModalIsOpen}
          onRequestClose={() => setBreakdownModalIsOpen(false)}
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1000,
            },
            content: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#222222',
              color: 'white',
              borderRadius: '10px',
              padding: '20px',
              maxWidth: '600px',
              width: '90%',
              textAlign: 'left',
              maxHeight: '80vh',
              overflowY: 'auto',
            },
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Detailed Breakdown of Funds</h3>
          {lastRedeemDate && (
            <p className="text-gray-400 text-sm mb-4">
              Activity considered after your last redeem on: {new Date(lastRedeemDate).toLocaleString()}
            </p>
          )}

          {depositBreakdown.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-[#01D370]">
                Deposit Funds Used: ${totalDeposits.toFixed(2)}
              </h4>
              <ul className="list-disc list-inside text-gray-400">
                {depositBreakdown.map((item, index) => (
                  <li key={`deposit-${index}`}>
                    ${Math.abs(item.amount).toFixed(2)} (via {item.method}) on{" "}
                    {new Date(item.date).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bonusBreakdown.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-purple-400">
                Bonus Funds Used: ${totalBonuses.toFixed(2)}
              </h4>
              <ul className="list-disc list-inside text-gray-400">
                {bonusBreakdown.map((item, index) => (
                  <li key={`bonus-${index}`}>
                    ${Math.abs(item.amount).toFixed(2)} (via {item.method}) on{" "}
                    {new Date(item.date).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {freeplayBreakdown.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-blue-400">
                FreePlay Funds Used: ${totalFreeplay.toFixed(2)}
              </h4>
              <ul className="list-disc list-inside text-gray-400">
                {freeplayBreakdown.map((item, index) => (
                  <li key={`freeplay-${index}`}>
                    ${Math.abs(item.amount).toFixed(2)} (via {item.method}) on{" "}
                    {new Date(item.date).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(depositBreakdown.length === 0 && bonusBreakdown.length === 0 && freeplayBreakdown.length === 0) && (
            <p className="text-gray-400">No detailed breakdown available for this calculation.</p>
          )}

          {/* NEW: Add Download and Email buttons */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={handleDownloadBreakdown}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Breakdown
            </button>
            <button
              onClick={handleEmailBreakdown}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Email Breakdown
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setBreakdownModalIsOpen(false)}
            >
              Close
            </button>
          </div>
        </Modal>

        <button
          onClick={handleSubmit}
          type="submit"
          className={`w-full py-2 rounded-md font-bold text-lg mt-7 ${
            !amount || !withdrawalMethod || withdrawableAmount === null || !username || disabled || !isWithdrawalProfileComplete
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-[#FFDD15] text-black'
          }`}
          disabled={!amount || !withdrawalMethod || withdrawableAmount === null || !username || disabled || !isWithdrawalProfileComplete}
        >
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default memo(RequestRedeem);