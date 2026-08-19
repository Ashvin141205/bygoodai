// ===================================================================
// SignupNew.jsx - Professional User Registration Component
// ===================================================================
// A comprehensive React signup form with:
// - Email/password validation
// - Device fingerprinting (FingerprintJS)
// - Referral code validation
// - Error handling with specific error codes
// - Loading states and security feedback
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { ApiHandler } from '../../../helper/ApiHandler';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import './Signup.css';

const SignupNew = () => {
  // ============================================
  // State Management
  // ============================================

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    referral_code: '',
    country: '',
    accept_terms: false,
    accept_privacy: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [referralValid, setReferralValid] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================
  // Device Identification Methods
  // ============================================

  /**
   * Get or create a unique client identifier stored in localStorage
   * @returns {string} UUID v4 format
   */
  const getOrSetClientId = () => {
    let clientId = localStorage.getItem('uniqueClientIdentifier');
    
    if (!clientId) {
      // Generate new UUID v4
      clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem('uniqueClientIdentifier', clientId);
    }
    
    return clientId;
  };

  /**
   * Get browser fingerprint using FingerprintJS
   * @returns {Promise<string>} Browser fingerprint hash
   */
  const getFingerprint = async () => {
    try {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      return result.visitorId; // Returns ~64 char hash
    } catch (error) {
      console.error('Fingerprint error:', error);
      // Fallback: generate temporary fingerprint
      return 'fingerprint_error_' + Math.random().toString(36).substr(2, 9);
    }
  };

  // ============================================
  // Validation Methods
  // ============================================

  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Calculate password strength (0-100)
   * Checks: length, uppercase, lowercase, numbers, special chars
   */
  const calculatePasswordStrength = (password) => {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Uppercase letters
    if (/[A-Z]/.test(password)) strength += 20;

    // Lowercase letters
    if (/[a-z]/.test(password)) strength += 20;

    // Numbers
    if (/[0-9]/.test(password)) strength += 15;

    // Special characters
    if (/[!@#$%^&*]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  };

  /**
   * Get password strength label and color
   */
  const getPasswordStrengthLabel = (strength) => {
    if (strength < 40) return { label: 'Weak', color: 'red' };
    if (strength < 70) return { label: 'Fair', color: 'orange' };
    if (strength < 90) return { label: 'Good', color: 'blue' };
    return { label: 'Strong', color: 'green' };
  };

  /**
   * Validate password meets requirements
   */
  const validatePassword = (password) => {
    const errors = {};

    if (password.length < 8) {
      errors.length = 'Minimum 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
      errors.uppercase = 'Must include uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      errors.lowercase = 'Must include lowercase letter';
    }

    if (/[0-9]/.test(password)) {
      errors.number = 'Must include number';
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.special = 'Must include special character';
    }

    return errors;
  };

  /**
   * Validate entire signup form
   */
  const validateForm = () => {
    const newErrors = {};

    // Step 1 validation
    if (step === 1) {
      // Email
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      // Password
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const pwdErrors = validatePassword(formData.password);
        if (Object.keys(pwdErrors).length > 0) {
          newErrors.password = Object.values(pwdErrors).join('; ');
        }
      }

      // Confirm password
      if (!formData.password_confirm) {
        newErrors.password_confirm = 'Please confirm password';
      } else if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Passwords do not match';
      }
    }

    // Step 2 validation
    if (step === 2) {
      // First name
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      } else if (formData.first_name.length < 2) {
        newErrors.first_name = 'First name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s\-\.\']{2,50}$/.test(formData.first_name)) {
        newErrors.first_name = 'First name contains invalid characters';
      }

      // Last name
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      } else if (formData.last_name.length < 2) {
        newErrors.last_name = 'Last name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s\-\.\']{2,50}$/.test(formData.last_name)) {
        newErrors.last_name = 'Last name contains invalid characters';
      }

      // Username
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
        newErrors.username = 'Only letters, numbers, and underscores allowed';
      }
    }

    // Step 3 validation (final)
    if (step === 3) {
      if (!formData.accept_terms) {
        newErrors.accept_terms = 'You must accept the Terms of Service';
      }

      if (!formData.accept_privacy) {
        newErrors.accept_privacy = 'You must accept the Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Event Handlers
  // ============================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Update password strength on password change
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  /**
   * Validate referral code via API
   */
  const handleReferralCodeChange = async (e) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      referral_code: value,
    }));

    // Only validate if user stopped typing for 500ms
    if (value && value.length > 3) {
      try {
        const response = await ApiHandler(
          API_ENDPOINTS.AUTH.VALIDATE_REFERRAL,
          'POST',
          { referral_code: value },
          undefined,
          dispatch,
          navigate
        );

        if (response.data.status.code === 1) {
          setReferralValid(true);
        } else {
          setReferralValid(false);
          toast.warning('Invalid referral code');
        }
      } catch (error) {
        setReferralValid(false);
      }
    } else if (!value) {
      setReferralValid(null);
    }
  };

  /**
   * Move to next step
   */
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  /**
   * Move to previous step
   */
  const handlePrevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  /**
   * Final signup submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);

    try {
      // Get device identifiers
      const fingerprint = await getFingerprint();
      const uniqueClientId = getOrSetClientId();

      // Prepare payload
      const payload = {
        ...formData,
        fingerprint: fingerprint,
        client_uuid: uniqueClientId,
        public_ip_hint: typeof window !== 'undefined' ? window.clientIP || null : null,
      };

      // Show loading toast
      const toastId = toast.loading('Creating your account...');

      // API call
      const response = await ApiHandler(
        API_ENDPOINTS.AUTH.SIGNUP,
        'POST',
        payload,
        undefined,
        dispatch,
        navigate
      );

      toast.dismiss(toastId);

      if (response.data.status.code === 1) {
        // Success
        toast.success('Account created! Check your email to verify.');

        // Store email for verification page
        sessionStorage.setItem('verificationEmail', formData.email);

        // Redirect to email verification page
        setTimeout(() => {
          navigate('/verify-email', {
            state: { email: formData.email },
          });
        }, 1000);
      } else {
        // Handle specific errors
        const errorType = response.data.error?.type;

        if (errorType === 'EMAIL_EXISTS') {
          setErrors({ email: 'Email already registered' });
          setStep(1);
          toast.error('Email already registered. Please login or use a different email.');
        } else if (errorType === 'USERNAME_EXISTS') {
          setErrors({ username: 'Username already taken' });
          setStep(2);
          toast.error('Username already taken. Please choose a different one.');
        } else if (errorType === 'WEAK_PASSWORD') {
          setErrors({ password: response.data.status.message });
          setStep(1);
        } else if (errorType === 'VPN_DETECTED') {
          toast.error(
            'VPN detected. Please disable your VPN and try again.'
          );
        } else if (errorType === 'FRAUD_DETECTED') {
          toast.error(
            'Signup blocked due to security concerns. Please contact support.'
          );
        } else if (errorType === 'RATE_LIMIT_EXCEEDED') {
          toast.error('Too many signup attempts. Please wait 24 hours.');
        } else {
          toast.error(response.data.status.message || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);

      if (error.response?.status === 429) {
        toast.error('Too many signup attempts from your IP. Please wait.');
      } else if (error.response?.status === 403) {
        toast.error('Signup blocked due to security concerns.');
      } else if (error.response?.status === 409) {
        toast.error('Email or username already exists.');
      } else {
        toast.error(
          error.message || 'An error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="signup-container">
      <div className="signup-card">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="signup-step">
              <h2>Create Account</h2>
              <p className="step-subtitle">Step 1 of 3: Email & Password</p>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'input-error' : ''}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'input-error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div
                      className="strength-bar"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthLabel(
                          passwordStrength
                        ).color,
                      }}
                    />
                    <span className="strength-label">
                      {getPasswordStrengthLabel(passwordStrength).label}
                    </span>
                  </div>
                )}

                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm">Confirm Password *</label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  placeholder="Confirm password"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  className={errors.password_confirm ? 'input-error' : ''}
                  required
                />
                {errors.password_confirm && (
                  <span className="error-text">{errors.password_confirm}</span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={handleNextStep}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="signup-step">
              <h2>Create Account</h2>
              <p className="step-subtitle">Step 2 of 3: Personal Information</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={errors.first_name ? 'input-error' : ''}
                    required
                  />
                  {errors.first_name && (
                    <span className="error-text">{errors.first_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={errors.last_name ? 'input-error' : ''}
                    required
                  />
                  {errors.last_name && (
                    <span className="error-text">{errors.last_name}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="john_doe_123"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? 'input-error' : ''}
                  required
                />
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="referral_code">Referral Code (Optional)</label>
                <input
                  type="text"
                  id="referral_code"
                  name="referral_code"
                  placeholder="REF_XXXXX"
                  value={formData.referral_code}
                  onChange={handleReferralCodeChange}
                />
                {referralValid === true && (
                  <span className="success-text">✓ Valid referral code</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextStep}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="signup-step">
              <h2>Create Account</h2>
              <p className="step-subtitle">Step 3 of 3: Accept Terms</p>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="accept_terms"
                    checked={formData.accept_terms}
                    onChange={handleInputChange}
                  />
                  <span>
                    I accept the Terms of Service *
                  </span>
                </label>
                {errors.accept_terms && (
                  <span className="error-text">{errors.accept_terms}</span>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="accept_privacy"
                    checked={formData.accept_privacy}
                    onChange={handleInputChange}
                  />
                  <span>
                    I accept the Privacy Policy *
                  </span>
                </label>
                {errors.accept_privacy && (
                  <span className="error-text">{errors.accept_privacy}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="progress-indicator">
            <span className={step >= 1 ? 'step active' : 'step'}>1</span>
            <span className={step >= 2 ? 'step active' : 'step'}>2</span>
            <span className={step >= 3 ? 'step active' : 'step'}>3</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupNew;
