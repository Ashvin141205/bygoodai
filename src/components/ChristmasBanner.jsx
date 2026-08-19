import React, { useState } from 'react';

const ChristmasBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="christmas-banner" style={{
      background: 'linear-gradient(135deg, #165B33, #BB2528, #165B33)',
      color: 'white',
      padding: '8px 15px',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      borderBottom: '2px solid #FFD700'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '18px' }}>🎄</span>
        <div style={{
          fontWeight: '600',
          fontSize: '14px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          lineHeight: '1.3'
        }}>
          🎅 Happy Holidays! Enjoy Special Christmas Bonuses 🎁
        </div>
        <span style={{ fontSize: '18px' }}>🎄</span>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        title="Close banner"
      >
        ×
      </button>

      <style>{`
        .christmas-banner {
          display: none;
        }
        
        @media (max-width: 640px) {
          .christmas-banner {
            display: block !important;
            padding: 6px 35px 6px 10px !important;
          }
          .christmas-banner > div {
            gap: 6px !important;
          }
          .christmas-banner > div > div {
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          .christmas-banner span {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasBanner;
