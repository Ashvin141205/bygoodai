import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './TelegramBotPopup.css';

const TelegramBotPopup = ({ 
  botUsername = "LuckyCharmSweepBot", 
  channelLink = "https://t.me/LuckyCharmSweepChannel",
  showDelay = 5000,
  autoShow = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  
  // Check if user is registered/logged in
  const token = useSelector((state) => state.auth.token);
  const isRegisteredUser = !!token;

  useEffect(() => {
    // Only show to registered users
    if (!isRegisteredUser) {
      return;
    }
    
    // Check if popup was shown in the last 7 days
    const lastShown = localStorage.getItem('telegram-popup-last-shown');
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (lastShown) {
      const lastShownDate = new Date(parseInt(lastShown));
      const now = new Date();
      const timeDiff = now.getTime() - lastShownDate.getTime();
      
      // If popup was shown less than 7 days ago, don't show it again
      if (timeDiff < oneWeekInMs) {
        return;
      }
    }

    if (autoShow && !hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
        // Save the timestamp when popup is shown
        localStorage.setItem('telegram-popup-last-shown', Date.now().toString());
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, showDelay, hasShown, isRegisteredUser]);

  const handleClose = () => {
    setIsVisible(false);
    // Only close the popup, don't affect the floating button
    // The floating button has its own separate close mechanism
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const openBot = () => {
    window.open(`https://t.me/${botUsername}?start=website`, '_blank');
    // Track conversion
    if (window.gtag) {
      window.gtag('event', 'telegram_bot_click', {
        event_category: 'engagement',
        event_label: 'website_popup'
      });
    }
  };

  const openChannel = () => {
    window.open(channelLink, '_blank');
    // Track conversion
    if (window.gtag) {
      window.gtag('event', 'telegram_channel_click', {
        event_category: 'engagement',
        event_label: 'website_popup'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`telegram-popup ${isMinimized ? 'minimized' : ''}`}>
      <div className="telegram-popup-header">
        <div className="telegram-popup-avatar">
          <div className="telegram-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <div className="status-indicator"></div>
        </div>
        
        <div className="telegram-popup-info">
          <h4>🎰 We're Now on Telegram!</h4>
          <span className="status-text">✨ Created for Your Convenience</span>
        </div>

        <div className="telegram-popup-controls">
          <button 
            className="minimize-btn" 
            onClick={handleMinimize}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '🔼' : '🔽'}
          </button>
          <button 
            className="close-btn" 
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="telegram-popup-content">
          <div className="telegram-popup-message">
            <div className="message-bubble">
              <p><span className="highlight">💡 Access Your Way</span></p>
              <p style={{ marginBottom: '10px', fontSize: '0.9em', color: '#E0E0E0', fontWeight: '500' }}>
                Use Telegram for faster, easier access:
              </p>
              <p style={{ color: '#F5F5F5', fontWeight: '400', lineHeight: '1.6' }}>✅ Same trusted platform, your choice of access</p>
              <p style={{ color: '#F5F5F5', fontWeight: '400', lineHeight: '1.6' }}>⚡ Faster loading if you prefer Telegram</p>
              <p style={{ color: '#F5F5F5', fontWeight: '400', lineHeight: '1.6' }}>🎯 Instant access to your account & games</p>
              <p style={{ color: '#F5F5F5', fontWeight: '400', lineHeight: '1.6' }}>💬 Integrated support - chat anytime</p>
              <p style={{ color: '#F5F5F5', fontWeight: '400', lineHeight: '1.6' }}>📱 No browser needed • Works anywhere</p>

              {/* Warning about multiple accounts */}
              <div style={{ 
                marginTop: '12px', 
                padding: '8px', 
                background: 'rgba(255, 59, 48, 0.1)', 
                borderLeft: '3px solid #ff3b30',
                borderRadius: '4px' 
              }}>
                <p style={{ margin: 0, fontSize: '0.85em', color: '#ff3b30', fontWeight: '600' }}>
                  ⚠️ One account per user only
                </p>
              </div>
            </div>
          </div>

          <div className="telegram-popup-actions">
            <button 
              className="telegram-btn primary" 
              onClick={openBot}
            >
              <span className="btn-icon">✨</span>
              Try Telegram Access
            </button>
            
            <button 
              className="telegram-btn secondary" 
              onClick={openChannel}
            >
              <span className="btn-icon">📢</span>
              Join Channel
            </button>
          </div>

          <div className="telegram-popup-footer">
            <span className="trust-indicators" style={{ color: '#B0B0B0', fontSize: '11px', fontWeight: '500' }}>
              🔒 Same account • Same security • Your choice
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramBotPopup;