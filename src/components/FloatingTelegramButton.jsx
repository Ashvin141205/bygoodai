import React, { useState, useEffect } from 'react';
import './FloatingTelegramButton.css';

const FloatingTelegramButton = ({ 
  botUsername = "luckycharmchatbot",
  position = "bottom-right" // bottom-right, bottom-left, top-right, top-left
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the floating button specifically
    const floatingDismissed = localStorage.getItem('telegram-floating-dismissed');
    
    if (floatingDismissed) {
      const dismissedDate = new Date(parseInt(floatingDismissed));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dismissedDay = new Date(dismissedDate.getFullYear(), dismissedDate.getMonth(), dismissedDate.getDate());
      
      // Hide if dismissed today
      if (today.getTime() === dismissedDay.getTime()) {
        setIsVisible(false);
      }
    }
  }, []);

  const openBot = () => {
    window.open(`https://t.me/${botUsername}?start=website`, '_blank');
    
    // Track click event
    if (window.gtag) {
      window.gtag('event', 'floating_telegram_click', {
        event_category: 'engagement',
        event_label: 'floating_button'
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => setShowTooltip(true), 200);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    // Remember dismissal timestamp for today only
    localStorage.setItem('telegram-floating-dismissed', Date.now().toString());
  };

  // Don't render if dismissed for today
  if (!isVisible) return null;

  return (
    <div className={`floating-telegram-container ${position}`}>
      {/* Tooltip */}
      {showTooltip && (
        <div className="telegram-tooltip">
          <div className="tooltip-content">
            <span className="tooltip-text">🚀 20x Faster Access</span>
            <span className="tooltip-subtext">Same website • Instant deposits </span>
          </div>
        </div>
      )}
      
      {/* Small dismiss button */}
      <button
        className="floating-telegram-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss for today"
        title="Hide for 24 hours"
      >
        ×
      </button>
      
      {/* Floating Button */}
      <button
        className={`floating-telegram-btn ${isHovered ? 'hovered' : ''}`}
        onClick={openBot}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Open Telegram Bot (Optional)"
      >
        {/* Ripple effect on click */}
        <div className="ripple-effect"></div>
        
        {/* Telegram icon */}
        <div className="telegram-icon-container">
          <svg className="telegram-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>

        {/* Subtle pulse rings - less intrusive */}
        <div className="pulse-ring"></div>
        <div className="pulse-ring delay-1"></div>
      </button>
    </div>
  );
};

export default FloatingTelegramButton;