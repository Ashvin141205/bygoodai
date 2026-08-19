/**
 * CENTRALIZED API ENDPOINTS CONFIGURATION
 * 
 * DO NOT hardcode API URLs in components!
 * Always import endpoints from this file.
 * 
 * Usage Example:
 *   import { API_ENDPOINTS } from '../config/apiEndpoints';
 *   const response = await ApiHandler(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials, ...);
 * 
 * Benefits:
 * ✅ Single source of truth for all APIs
 * ✅ Easy to add new endpoints
 * ✅ Automatic multi-domain support
 * ✅ Simple to change base URL
 * ✅ Type-safe with documentation
 */

// ============================================================
// 1. AUTO-DETECT API BASE URL (Domain-aware)
// ============================================================

function getApiBaseUrl() {
    // Optional env override for staging/emergency switch.
    const envBaseUrl = process.env.REACT_APP_API_BASE_URL;
    if (envBaseUrl && typeof envBaseUrl === 'string') {
        return envBaseUrl.trim().replace(/\/$/, '');
    }

    // Safe fallback for non-browser contexts.
    if (typeof window === 'undefined' || !window.location) {
        return 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn';
    }

    const host = window.location.hostname.toLowerCase();
    
    // Map domains to their API servers
    const apiUrlMap = {
        // Production domains
        'apiluckycharmsweep.com': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
        'www.apiluckycharmsweep.com': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
        'luckycharmsweep.com': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
        'www.luckycharmsweep.com': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
        
        // Development/Local domains
        'localhost': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
        '127.0.0.1': 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn',
    };
    
    const baseUrl = apiUrlMap[host];
    
    if (!baseUrl) {
        console.warn(`[API CONFIG] Unknown domain: ${host}. Falling back to the primary API server.`);

        if (host === 'localhost' || host === '127.0.0.1') {
            return 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn';
        }

        return 'https://v2.luckycharmsweep.com/api/v2/dfjfngjn';
    }
    
    return baseUrl;
}

export const API_BASE_URL = getApiBaseUrl();

// ============================================================
// 2. AUTHENTICATION ENDPOINTS (Public - No Auth Required)
// ============================================================

export const AUTH_ENDPOINTS = {
    LOGIN: '/login.php',
    SIGNUP: '/signup.php',
    FORGOT_PASSWORD: '/forgot_password.php',
    RESET_PASSWORD: '/new_password.php',
    VALIDATE_REFERRAL: '/validate_referral_code.php',
};

// ============================================================
// 3. USER PROFILE ENDPOINTS (Auth Required)
// ============================================================

export const USER_ENDPOINTS = {
    PROFILE: {
        GET: '/get_profile.php',
        UPDATE: '/edit_profile.php',
    },
    BALANCE: {
        GET: '/user_balance.php',
    },
};

// ============================================================
// 4. DEPOSIT/PAYMENT ENDPOINTS (Auth Required)
// ============================================================

export const DEPOSIT_ENDPOINTS = {
    CREATE_NEW: '/new_deposit_game.php',           // Create new deposit order
    GET_DETAILS: '/payment_transaction_details.php',  // Get payment details
    GET_WALLET_DETAIL: '/get_wallet_recharge_detail.php', // Wallet recharge info
    GET_CASHAPP_BARCODE: '/get_cashApp_barcode_image.php', // CashApp QR code
    GENERATE_CASHAPP_LINK: '/generateCashAppPaymentLink.php', // Generate CashApp payment link
    GENERATE_CASHAPP_QR: '/generate_cashapp_qr.php', // Generate CashApp QR code
    GENERATE_HOSTED_PAYMENT: '/generate_hosted_payment.php', // Generate hosted payment link (Apple Pay, Google Pay, CashApp)
    GET_APEX_METHODS_CONFIG: '/get_apex_payment_methods_config.php', // Get Apex payment method config
    GET_BTCPAY_METHODS_CONFIG: '/get_btcpay_payment_methods_config.php', // Get BTCPay payment method config
    VERIFY_PROMOCODE: '/verify_promocode.php',     // Verify and apply promo code
};

// ============================================================
// 5. GAME ENDPOINTS (Auth Usually Required)
// ============================================================

export const GAME_ENDPOINTS = {
    LIST: '/get_game_list.php',           // Get all available games
    CATEGORIES: '/get_categorises_list.php', // Get game categories
    PLATFORMS: '/get_platforms_list.php', // Get all platforms
    VALIDATE: '/check_game_validation.php', // Validate game selection
    MY_GAMES: '/my_game_list.php',       // Get user's games list
};

// ============================================================
// 6. SPIN/WHEEL ENDPOINTS (Auth Required)
// ============================================================

export const SPIN_ENDPOINTS = {
    CHECK: '/check_spin.php',        // Check if user can spin
    GET_DATA: '/get_spin_data.php',  // Get wheel data
    GET_RECENT_WINNERS: '/recent_winners.php', // Get recent winners list
    BUY_SPIN: '/buy_spin.php', // Purchase additional spins
};

// ============================================================
// 7. WITHDRAWAL/REDEEM ENDPOINTS (Auth Required)
// ============================================================

export const WITHDRAWAL_ENDPOINTS = {
    GET_WITHDRAWABLE: '/get_withdrawable.php',
    SUBMIT_REQUEST: '/redeem_request_for_game.php',
    GET_DETAILS: '/withdraw_payment_transaction_detail.php',
    CHECK_KYC_REQUIRED: '/check_kyc_required_enhanced.php', // Check if KYC is required for withdrawal
};

// ============================================================
// 8. BONUS/REFERRAL ENDPOINTS (Auth Required)
// ============================================================

export const BONUS_ENDPOINTS = {
    GET_LEVEL: '/bonus_level.php',
    GET_REFERRAL: '/referral.php',
    GET_EARNINGS: '/getReferrerTotalEarnings.php',
    GET_LEADERBOARD: '/get_referral_leaderboard.php', // Public endpoint
};

// ============================================================
// 9. PLATFORM/ACCOUNT ENDPOINTS (Auth Required)
// ============================================================

export const PLATFORM_ENDPOINTS = {
    GET_ACCOUNTS: '/get_platform_game_account_list.php',
    LINK_ACCOUNT: '/platform_game_account.php',
};

// ============================================================
// 10. BLOG ENDPOINTS (Auth Usually Required)
// ============================================================

export const BLOG_ENDPOINTS = {
    CATEGORIES: '/get_blog_categories.php',
    CATEGORIES_LIST: '/blog_categories_list.php', // Alternative categories endpoint
    DETAILS: '/get_blog_details.php',
    DETAILS_ALT: '/blog_details.php', // Alternative details endpoint
};

// ============================================================
// 11. EMAIL/NOTIFICATION ENDPOINTS (Auth Required)
// ============================================================

export const NOTIFICATION_ENDPOINTS = {
    SEND_EMAIL: '/send_breakdown_email.php',
};

// ============================================================
// 11. CONTACT/SUPPORT ENDPOINTS (Public)
// ============================================================

export const CONTACT_ENDPOINTS = {
    SUBMIT_WITH_UPLOAD: '/contact_us_with_upload.php', // Submit contact form with file upload
};

// ============================================================
// 12. REVIEWS/TESTIMONIALS ENDPOINTS (Public)
// ============================================================

export const REVIEW_ENDPOINTS = {
    GET_REVIEWS: '/reviews.php', // Get all reviews/testimonials
};

// ============================================================
// 13. MAINTENANCE STATUS ENDPOINTS (Public)
// ============================================================

export const MAINTENANCE_ENDPOINTS = {
    STATUS: '/maintenance_status.php',
};

// ============================================================
// 14. EXTRA/LEGACY ENDPOINTS (For Ongoing Migration)
// ============================================================

export const EXTRA_ENDPOINTS = {
    FIREBASE_LOGIN: '/firebase_login.php',
    GET_RECENT_WINNER: '/get_recent_winner.php',
    GENERATE_HOSTED_PAYMENT_LINK: '/generate_hosted_payment_link.php',
    CHECK_SUBSCRIPTION: '/check_subscription.php',
    SAVE_FCM_TOKEN: '/save_fcm_token.php',
    LEVEL_PROGRESS: '/get_level_progress.php',
    WEEKLY_CHALLENGE_BONUS_PERCENTAGE: '/weekly_challenge_bonus_percentage.php',
    HOMEPAGE_SLIDER: '/get_homepage_slider_image.php',
    FAVORITES_GET: '/getFavorites.php',
    FAVORITES_ADD: '/addfav.php',
    FAVORITES_REMOVE: '/removefav.php',
    CART_ADD_ABANDONED: '/addToAbandonedCart.php',
    CART_REMOVE_ABANDONED: '/removeAbandonedCart.php',
    CART_UPDATE: '/updatecart.php',
    BLOG_LIST: '/blog_list.php',
    CAPTURE_SUBSCRIPTION: '/capture_subscription.php',
    WALLET_PAYMENT_TRANSACTION_DETAIL: '/wallet_payment_transaction_detail.php',
    DEPOSIT_TRANSACTION_HISTORY: '/deposit_transaction_history.php',
    WITHDRAW_TRANSACTION_HISTORY: '/withdraw_transaction_history.php',
    GET_PHONE_NUMBER: '/get_phone_number.php',
    GET_FREEPLAY_REQUESTS: '/get_freeplay_requests.php',
    VERIFY_COUPONS_CODE: '/verify_coupons_code.php',
    UPDATE_PHONE_NUMBER: '/update_phone_number.php',
    SEND_SMS_CODE: '/send_sms_code.php',
    VERIFY_SMS_CODE: '/verify_sms_code.php',
    FREE_PLAY_COUPON_BONUS: '/free_play_coupon_bonus.php',
    GAME_RESET_PASSWORD: '/game_reset_password.php',
    SYSTEM_MESSAGES: '/system_messages.php',
    SYSTEM_MESSAGE_READ: '/system_message_read.php',
    PROMOTIONS_MESSAGE: '/promotions_message.php',
    PROMOTIONS_MESSAGE_READ: '/promotions_message_read.php',
    USER_LOCATION: '/get_user_location.php',
    WALLET_TRANSACTION_HISTORY: '/wallet_transaction_history.php',
    CHECK_CASHTAG: '/check_cashtag.php',
    VERIFF_INTEGRATION: '/veriff_integration.php',
    CASHAPP_REDEEM_IMAGE_UPLOAD: '/getCashAppImgForRedeem.php',
    UNSUBSCRIBE: '/unsubscribe.php',
    SOCIAL_REWARD: '/social-reward.php',
    BOT_GET_ORDER_DETAILS: 'https://v2.luckycharmsweep.com/api/v2/bot_api/bot_get_order_details.php',
    BOT_GENERATE_HOSTED_PAYMENT: 'https://v2.luckycharmsweep.com/api/v2/bot_api/bot_generate_hosted_payment.php',
    BOT_GENERATE_CRYPTO_INVOICE: 'https://v2.luckycharmsweep.com/api/v2/bot_api/bot_generate_crypto_invoice.php',
    BOT_CHECK_PAYMENT: 'https://v2.luckycharmsweep.com/api/v2/bot_api/bot_check_payment.php',
    BOT_RECORD_PAYPAL_PAYMENT: 'https://v2.luckycharmsweep.com/api/v2/bot_api/bot_record_paypal_payment.php',
    GUEST_CHECKOUT_SESSION_STATUS: `${API_BASE_URL}/get_guest_checkout_session_status.php`,
    GUEST_CHECKOUT_CLAIM_ACCOUNT: `${API_BASE_URL}/claim_guest_checkout_account.php`,
    GUEST_AUTO_CREATE: `${API_BASE_URL}/auto_create_guest_user.php`,
    GUEST_UPGRADE_USER: `${API_BASE_URL}/upgrade_guest_user.php`,
    DOWNLOAD_IMAGE: 'https://v2.luckycharmsweep.com/download_image.php',
    SEARCH_GAMES: '/search_games.php',
};

// ============================================================
// 15. COMPLETE NESTED OBJECT (Convenient Access)
// ============================================================

export const API_ENDPOINTS = {
    // Authentication (public endpoints)
    AUTH: AUTH_ENDPOINTS,
    
    // User management
    USER: USER_ENDPOINTS,
    
    // Deposit & Payments
    DEPOSIT: DEPOSIT_ENDPOINTS,
    
    // Games & Platforms
    GAME: GAME_ENDPOINTS,
    PLATFORM: PLATFORM_ENDPOINTS,
    
    // Spin wheel
    SPIN: SPIN_ENDPOINTS,
    
    // Withdrawals & Redeems
    WITHDRAWAL: WITHDRAWAL_ENDPOINTS,
    
    // Bonuses & Referrals
    BONUS: BONUS_ENDPOINTS,
    
    // Blog & Content
    BLOG: BLOG_ENDPOINTS,
    
    // Notifications & Emails
    NOTIFICATION: NOTIFICATION_ENDPOINTS,
    
    // Contact & Support
    CONTACT: CONTACT_ENDPOINTS,
    
    // Reviews & Testimonials
    REVIEW: REVIEW_ENDPOINTS,

    // Maintenance mode
    MAINTENANCE: MAINTENANCE_ENDPOINTS,
};

// ============================================================
// 16. HTTP METHODS CONSTANTS
// ============================================================

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
};

// ============================================================
// 15. API ENDPOINT CONFIGURATION
// (Method, Auth requirement, Retry policy)
// ============================================================

export const API_CONFIG = {
    // ========== AUTHENTICATION (Public) ==========
    [AUTH_ENDPOINTS.LOGIN]: {
        method: 'POST',
        requiresAuth: false,
        retryable: false, // Never retry login
        description: 'User login'
    },
    [AUTH_ENDPOINTS.SIGNUP]: {
        method: 'POST',
        requiresAuth: false,
        retryable: false,
        description: 'New user registration'
    },
    [AUTH_ENDPOINTS.FORGOT_PASSWORD]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Forgot password request'
    },
    [AUTH_ENDPOINTS.RESET_PASSWORD]: {
        method: 'POST',
        requiresAuth: false,
        retryable: false,
        description: 'Reset password'
    },
    [AUTH_ENDPOINTS.VALIDATE_REFERRAL]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Validate referral code'
    },
    
    // ========== USER PROFILE ==========
    [USER_ENDPOINTS.PROFILE.GET]: {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Get user profile',
        cacheable: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes
    },
    [USER_ENDPOINTS.PROFILE.UPDATE]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Update user profile'
    },
    [USER_ENDPOINTS.BALANCE.GET]: {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Get user balance'
    },
    
    // ========== DEPOSITS ==========
    [DEPOSIT_ENDPOINTS.CREATE_NEW]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false, // Never retry new deposits
        description: 'Create new deposit'
    },
    [DEPOSIT_ENDPOINTS.GET_DETAILS]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get deposit details'
    },
    [DEPOSIT_ENDPOINTS.GET_WALLET_DETAIL]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get wallet recharge details'
    },
    [DEPOSIT_ENDPOINTS.GET_CASHAPP_BARCODE]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get CashApp barcode'
    },
    [DEPOSIT_ENDPOINTS.GENERATE_CASHAPP_LINK]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Generate CashApp payment link'
    },
    [DEPOSIT_ENDPOINTS.GENERATE_CASHAPP_QR]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Generate CashApp QR code'
    },
    [DEPOSIT_ENDPOINTS.GENERATE_HOSTED_PAYMENT]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Generate hosted payment link'
    },
    [DEPOSIT_ENDPOINTS.GET_APEX_METHODS_CONFIG]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get Apex payment methods config',
        cacheable: true,
        cacheTTL: 10 * 60 * 1000
    },
    [DEPOSIT_ENDPOINTS.GET_BTCPAY_METHODS_CONFIG]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get BTCPay payment methods config',
        cacheable: true,
        cacheTTL: 10 * 60 * 1000
    },
    [DEPOSIT_ENDPOINTS.VERIFY_PROMOCODE]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Verify promo code'
    },
    
    // ========== GAMES ==========
    [GAME_ENDPOINTS.LIST]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Get game list',
        cacheable: true,
        cacheTTL: 10 * 60 * 1000 // 10 minutes
    },
    [GAME_ENDPOINTS.CATEGORIES]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get game categories',
        cacheable: true,
        cacheTTL: 30 * 60 * 1000 // 30 minutes
    },
    [GAME_ENDPOINTS.PLATFORMS]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get platforms',
        cacheable: true,
        cacheTTL: 30 * 60 * 1000 // 30 minutes
    },
    [GAME_ENDPOINTS.VALIDATE]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Validate game'
    },
    [GAME_ENDPOINTS.MY_GAMES]: {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Get my games'
    },
    
    // ========== SPIN WHEEL ==========
    [SPIN_ENDPOINTS.CHECK]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false, // Critical - don't retry
        description: 'Check spin availability'
    },
    [SPIN_ENDPOINTS.GET_DATA]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get spin wheel data'
    },
    [SPIN_ENDPOINTS.GET_RECENT_WINNERS]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get recent winners',
        cacheable: true,
        cacheTTL: 60 * 1000 // 1 minute
    },
    [SPIN_ENDPOINTS.BUY_SPIN]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Buy additional spin'
    },
    
    // ========== WITHDRAWALS ==========
    [WITHDRAWAL_ENDPOINTS.GET_WITHDRAWABLE]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get withdrawable amount'
    },
    [WITHDRAWAL_ENDPOINTS.SUBMIT_REQUEST]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false, // Never retry withdrawal requests
        description: 'Submit withdrawal request'
    },
    [WITHDRAWAL_ENDPOINTS.GET_DETAILS]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get withdrawal details'
    },
    [WITHDRAWAL_ENDPOINTS.CHECK_KYC_REQUIRED]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Check KYC requirement before withdrawal'
    },
    
    // ========== BONUS & REFERRALS ==========
    [BONUS_ENDPOINTS.GET_LEVEL]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get bonus level'
    },
    [BONUS_ENDPOINTS.GET_REFERRAL]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Get referral data'
    },
    [BONUS_ENDPOINTS.GET_EARNINGS]: {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Get referral earnings'
    },
    [BONUS_ENDPOINTS.GET_LEADERBOARD]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get leaderboard',
        cacheable: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes
    },
    
    // ========== PLATFORMS ==========
    [PLATFORM_ENDPOINTS.GET_ACCOUNTS]: {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Get platform accounts'
    },
    [PLATFORM_ENDPOINTS.LINK_ACCOUNT]: {
        method: 'POST',
        requiresAuth: true,
        retryable: false,
        description: 'Link platform account'
    },
    
    // ========== BLOG ==========
    [BLOG_ENDPOINTS.CATEGORIES]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Get blog categories',
        cacheable: true,
        cacheTTL: 60 * 60 * 1000 // 1 hour
    },
    [BLOG_ENDPOINTS.DETAILS]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Get blog details',
        cacheable: true,
        cacheTTL: 60 * 60 * 1000 // 1 hour
    },
    [BLOG_ENDPOINTS.CATEGORIES_LIST]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Get blog category list',
        cacheable: true,
        cacheTTL: 60 * 60 * 1000 // 1 hour
    },
    [BLOG_ENDPOINTS.DETAILS_ALT]: {
        method: 'POST',
        requiresAuth: false,
        retryable: true,
        description: 'Get blog details (alternate endpoint)',
        cacheable: true,
        cacheTTL: 60 * 60 * 1000 // 1 hour
    },
    
    // ========== NOTIFICATIONS ==========
    [NOTIFICATION_ENDPOINTS.SEND_EMAIL]: {
        method: 'POST',
        requiresAuth: true,
        retryable: true,
        description: 'Send email'
    },
    
    // ========== CONTACT & SUPPORT ==========
    [CONTACT_ENDPOINTS.SUBMIT_WITH_UPLOAD]: {
        method: 'POST',
        requiresAuth: false,
        retryable: false,
        description: 'Submit contact form with file upload'
    },
    [REVIEW_ENDPOINTS.GET_REVIEWS]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get reviews and testimonials',
        cacheable: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes
    },
    [MAINTENANCE_ENDPOINTS.STATUS]: {
        method: 'GET',
        requiresAuth: false,
        retryable: true,
        description: 'Get current maintenance status',
        cacheable: true,
        cacheTTL: 15 * 1000
    },
};

// ============================================================
// 16. HELPER FUNCTIONS
// ============================================================

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - The endpoint path (e.g., '/login.php')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get configuration for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {object} Endpoint configuration or default
 */
export const getApiConfig = (endpoint) => {
    return API_CONFIG[endpoint] || {
        method: 'GET',
        requiresAuth: true,
        retryable: true,
        description: 'Unknown endpoint'
    };
};

/**
 * Check if endpoint requires authentication
 * @param {string} endpoint - The endpoint path
 * @returns {boolean} True if auth token is required
 */
export const requiresAuth = (endpoint) => {
    const config = getApiConfig(endpoint);
    return config.requiresAuth !== false;
};

/**
 * Check if endpoint response is cacheable
 * @param {string} endpoint - The endpoint path
 * @returns {boolean} True if cacheable
 */
export const isCacheable = (endpoint) => {
    const config = getApiConfig(endpoint);
    return config.cacheable === true;
};

/**
 * Get cache TTL for an endpoint
 * @param {string} endpoint - The endpoint path
 * @returns {number} Cache TTL in milliseconds (0 = not cacheable)
 */
export const getCacheTTL = (endpoint) => {
    const config = getApiConfig(endpoint);
    return config.cacheTTL || 0;
};

// ============================================================
// 17. EXPORT SUMMARY FOR DOCUMENTATION
// ============================================================

export const API_SUMMARY = {
    baseUrl: API_BASE_URL,
    totalEndpoints: Object.keys(API_CONFIG).length,
    authRequired: Object.values(API_CONFIG).filter(c => c.requiresAuth).length,
    publicEndpoints: Object.values(API_CONFIG).filter(c => !c.requiresAuth).length,
};

// ============================================================
// 18. VALIDATION (For Development)
// ============================================================

if (process.env.NODE_ENV === 'development') {
    // Verify all endpoints have config (supports deeply nested endpoint objects).
    const collectEndpoints = (value, output = []) => {
        if (!value) {
            return output;
        }

        if (typeof value === 'string') {
            output.push(value);
            return output;
        }

        if (typeof value === 'object') {
            for (const nestedValue of Object.values(value)) {
                collectEndpoints(nestedValue, output);
            }
        }

        return output;
    };

    const endpointsList = collectEndpoints(API_ENDPOINTS);
    
    const missingConfig = endpointsList.filter(endpoint => !API_CONFIG[endpoint]);
    if (missingConfig.length > 0) {
        console.warn('[API CONFIG] Missing config for endpoints:', missingConfig);
    }
}

export default {
    API_BASE_URL,
    API_ENDPOINTS,
    HTTP_METHODS,
    getApiUrl,
    getApiConfig,
    requiresAuth,
    isCacheable,
    getCacheTTL,
};
