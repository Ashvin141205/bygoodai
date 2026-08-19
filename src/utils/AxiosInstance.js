import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slice/authSlice';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/apiEndpoints';

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/`,
    timeout: 500000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if we've already handled session expiration
let isHandlingSessionExpiry = false;

// Queue to track pending requests during session expiry
let requestQueue = [];

axiosInstance.interceptors.request.use(
    (config) => {
        // If session is being handled, queue the request
        if (isHandlingSessionExpiry) {
            return new Promise((resolve, reject) => {
                requestQueue.push({ resolve, reject, config });
            });
        }

        const state = store.getState();
        const token = state.auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 errors globally (session expired)
        if (error.response?.status === 401 && !isHandlingSessionExpiry) {
            isHandlingSessionExpiry = true;
            
            const state = store.getState();
            const wasLoggedIn = !!state.auth.token;
            
            // Clear auth state immediately
            store.dispatch(logout());
            
            // Cancel all queued requests
            requestQueue.forEach(({ reject }) => {
                reject(new Error('Session expired'));
            });
            requestQueue = [];
            
            // Only show toast if user was logged in
            if (wasLoggedIn) {
                toast.error('Your session has expired. Redirecting to login...', {
                    position: 'top-center',
                    autoClose: 2500,
                    theme: 'dark',
                    toastId: 'session-expired', // Prevent duplicate toasts
                    hideProgressBar: false,
                });
            }
            
            // Redirect to login after showing toast
            setTimeout(() => {
                isHandlingSessionExpiry = false;
                window.location.href = '/login';
            }, 2500);
            
            // Return rejected promise without additional error messages
            return Promise.reject(new Error('Session expired'));
        }
        
        // Handle other error statuses silently if session is expiring
        if (isHandlingSessionExpiry) {
            return Promise.reject(new Error('Session expired'));
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
