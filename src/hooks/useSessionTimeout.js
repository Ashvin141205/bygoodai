import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slice/authSlice';
import { toast } from 'react-toastify';

/**
 * Custom hook to handle automatic session timeout and logout
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {number} warningMinutes - Minutes before timeout to show warning (default: 5)
 */
export const useSessionTimeout = (timeoutMinutes = 30, warningMinutes = 5) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const warningShownRef = useRef(false);
  
  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const handleLogout = useCallback(() => {
    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Dispatch logout action
    dispatch(logout());
    
    // Show logout message
    toast.info('You have been logged out due to inactivity.', {
      position: 'top-center',
      autoClose: 3000,
      theme: 'dark',
      toastId: 'inactivity-logout',
    });
    
    // Redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 500);
  }, [dispatch, navigate]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      
      toast.warning(`Your session will expire in ${warningMinutes} minutes due to inactivity.`, {
        position: 'top-center',
        autoClose: 8000,
        theme: 'dark',
        toastId: 'session-warning',
      });
    }
  }, [warningMinutes]);

  const resetTimer = useCallback(() => {
    // Only reset if user is logged in
    if (!token) return;
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Reset warning flag
    warningShownRef.current = false;
    
    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning();
    }, warningMs);
    
    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [token, timeoutMs, warningMs, handleLogout, showWarning]);

  useEffect(() => {
    // Only activate session timeout if user is logged in
    if (!token) {
      // Clear timers if user is not logged in
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      return;
    }

    // List of events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      
      // Clear timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [token, resetTimer]);

  return { resetTimer };
};
