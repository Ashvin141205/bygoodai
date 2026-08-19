/**
 * guestUserHelper.js
 *
 * Manages automatic guest account creation so that guests can add items to cart
 * and use all authenticated API endpoints without a manual signup step.
 *
 * Flow:
 *   1. Guest clicks "Add to Cart" with no token.
 *   2. DepositCard calls ensureGuestSession(dispatch).
 *   3. If no token exists a temp account is created via the backend
 *      (provider = 'guest_auto', random email / password).
 *   4. JWT token is dispatched into Redux + stored in localStorage.
 *   5. localStorage flag 'is_guest_auto' is set to 'true'.
 *   6. After checkout the user upgrades via the link-email form
 *      (see BotPaymentComplete.jsx  →  GUEST_UPGRADE_USER endpoint).
 */

import axios from 'axios';
import { userToken } from '../redux/slice/authSlice';
import { EXTRA_ENDPOINTS } from '../config/apiEndpoints';

const GUEST_AUTO_FLAG   = 'is_guest_auto';
const GUEST_AUTO_EMAIL  = 'guest_auto_email';

/**
 * Returns true when the current session belongs to a guest_auto account.
 */
export const isGuestAutoSession = () =>
  localStorage.getItem(GUEST_AUTO_FLAG) === 'true';

/**
 * Clears all guest-auto markers from localStorage.
 * Call this after a successful account upgrade or on explicit logout.
 */
export const clearGuestAutoSession = () => {
  localStorage.removeItem(GUEST_AUTO_FLAG);
  localStorage.removeItem(GUEST_AUTO_EMAIL);
};

/**
 * Ensures the user has a valid auth token.
 *
 * - If a token already exists in Redux store, this is a no-op.
 * - If no token, auto-creates a guest account, dispatches the token to Redux,
 *   stores it in localStorage, and marks the session as guest_auto.
 *
 * @param {Function} dispatch - Redux dispatch function.
 * @param {string|null} currentToken - Current token from Redux state (or null).
 * @returns {Promise<string|null>} The token to use, or null on failure.
 */
export const ensureGuestSession = async (dispatch, currentToken) => {
  if (currentToken) {
    return currentToken;
  }

  try {
    const response = await axios.post(
      EXTRA_ENDPOINTS.GUEST_AUTO_CREATE,
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );

    const status = response?.data?.status;
    const responseData = response?.data?.data;
    if (status?.code === 1 && responseData?.token) {
      const { token, guest_email } = responseData;

      // Persist in Redux
      dispatch(userToken({ token }));

      // Persist for page reloads (same as normal login)
      localStorage.setItem('token', token);

      // Mark this as a guest auto session
      localStorage.setItem(GUEST_AUTO_FLAG, 'true');
      if (guest_email) {
        localStorage.setItem(GUEST_AUTO_EMAIL, guest_email);
      }

      return token;
    }
  } catch (err) {
    // Silently fail — caller will skip API sync and still update local cart state
    console.error('[guestUserHelper] autoCreateGuestUser failed:', err);
  }

  return null;
};
