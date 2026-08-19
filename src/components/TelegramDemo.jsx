import React from 'react';
import TelegramBotPopup from '../components/TelegramBotPopup';
import FloatingTelegramButton from '../components/FloatingTelegramButton';

const TelegramDemo = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🎰 Lucky Charm Casino</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
          Experience the thrill of premium casino games with instant payouts and exclusive bonuses!
        </p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '30px', 
          borderRadius: '20px',
          marginBottom: '40px'
        }}>
          <h2>🚀 Join Our Telegram Bot</h2>
          <p>Get instant access to:</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>⚡ Lightning-fast game credits</li>
            <li>🎁 Exclusive Friday freeplays</li>
            <li>💰 Instant crypto payments</li>
            <li>🎯 24/7 customer support</li>
            <li>🏆 VIP bonus programs</li>
          </ul>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '20px', 
          borderRadius: '15px',
          border: '2px dashed rgba(255,255,255,0.3)'
        }}>
          <h3>👆 Check the bottom-right corner for the popup!</h3>
          <p>And bottom-left for the floating button!</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            (Demo components showing how they'll appear on your actual website)
          </p>
        </div>
      </div>

      {/* Demo components */}
      <TelegramBotPopup 
        botUsername="luckycharmchatbot"
        channelLink="https://t.me/luckycharmcasino"
        showDelay={2000}
        autoShow={true}
      />
      
      <FloatingTelegramButton 
        botUsername="luckycharmchatbot"
        position="bottom-left"
      />
    </div>
  );
};

export default TelegramDemo;