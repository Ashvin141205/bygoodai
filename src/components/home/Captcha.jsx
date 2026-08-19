import React, { useEffect } from 'react';

const loadRecaptchaScript = (siteKey) => {
  // Prevent multiple script insertions
  if (!document.querySelector(`script[src="https://www.google.com/recaptcha/api.js?render=${siteKey}"]`)) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      ////console.log('reCAPTCHA script successfully loaded.');
    };
    script.onerror = () => {
      console.error('Failed to load the reCAPTCHA script.');
    };
    document.body.appendChild(script);
  } else {
    ////console.log('reCAPTCHA script already loaded.');
  }
};

const Captcha = ({ onCaptchaChange }) => {
  useEffect(() => {
    const siteKey = '6LfRLYwqAAAAAAGgU-yt9NkNPkyOz9hJwcLOAYdO'; // Replace with your actual site key

    // Load the script only once
    loadRecaptchaScript(siteKey);

    const executeRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: 'submit' })
            .then((token) => {
              if (token) {
                onCaptchaChange(token);
              } else {
                console.error('Failed to generate reCAPTCHA token.');
              }
            })
            .catch((err) => {
              console.error('Error executing reCAPTCHA:', err);
            });
        });
      } else {
        console.error('reCAPTCHA library not initialized.');
      }
    };

    // Wait for the script to load before calling the function
    const intervalId = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        clearInterval(intervalId); // Stop the interval once grecaptcha is available
        executeRecaptcha();
      }
    }, 100);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [onCaptchaChange]);

  return null; // No visible element for reCAPTCHA v3
};

export default Captcha;
