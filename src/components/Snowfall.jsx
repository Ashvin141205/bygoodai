import React, { useEffect, useState } from 'react';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    // Create 50 snowflakes with random properties
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      fontSize: 10 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.4
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snowfall-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            position: 'absolute',
            top: '-10px',
            left: `${flake.left}%`,
            fontSize: `${flake.fontSize}px`,
            color: '#fff',
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.animationDelay}s`,
            userSelect: 'none'
          }}
        >
          ❄
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Snowfall;
