import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

const GameIframeModal = ({ isOpen, onClose, gameUrl, gameName }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameReady, setIsGameReady] = useState(false);
  const user = useSelector((state) => state.auth.user);
  
  const ALLOWED_ORIGINS = [
    'https://play.luckycharmsweep.com',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://www.luckycharmsweep.com',
    'https://luckycharmsweep.com',
    'https://v2.luckycharmsweep.com',
    process.env.REACT_APP_GAME_ORIGIN
  ].filter(Boolean);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
      setIsGameReady(false);
      return;
    }

    // Check for Mixed Content before loading
    if (window.location.protocol === 'https:' && gameUrl.startsWith('http:')) {
      console.warn('⚠️ Mixed Content detected - HTTP game on HTTPS site');
      
      // Show warning and open in new tab
      setTimeout(() => {
        if (window.confirm('This game uses HTTP and cannot be loaded securely in the frame.\n\nWould you like to open it in a new tab instead?')) {
          window.open(gameUrl, '_blank');
        }
        onClose();
      }, 100);
      
      return;
    }

    // Message Handler - Listen for messages from the game iframe
    const handleMessage = (event) => {
      // Security Check - Skip for same-origin (test-game.html served from same domain)
      const isSameOrigin = event.origin === window.location.origin;
      const isAllowedOrigin = ALLOWED_ORIGINS.some(origin => event.origin === origin);
      
      if (!isSameOrigin && !isAllowedOrigin) {
        // Silently ignore unauthorized origins (no need to spam console)
        return;
      }

      // Handle different message formats
      let messageData = event.data;
      
      // Filter out webpack and dev messages
      if (typeof messageData === 'object' && messageData?.type) {
        const devMessageTypes = ['webpackInvalid', 'webpackWarnings', 'webpackOk', 'webpackErrors'];
        if (devMessageTypes.includes(messageData.type)) {
          return; // Ignore webpack dev messages
        }
      }
      
      // If it's a string, try to parse it
      if (typeof messageData === 'string') {
        try {
          messageData = JSON.parse(messageData);
        } catch (e) {
          // Not JSON, ignore
          return;
        }
      }
      
      const { type, payload } = messageData || {};
      
      if (!type) {
        // Message has no type, ignore
        return;
      }
      
      console.log('🎮 Game Message:', type, payload);

      switch (type) {
        case 'READY':
          console.log('✅ Game is ready');
          setIsGameReady(true);
          setIsLoading(false);
          
          // Send session data to game
          sendMessageToGame('SESSION_INIT', {
            sessionId: generateSessionId(),
            user: {
              id: user?.id,
              username: user?.username,
              email: user?.email,
              balance: user?.balance
            },
            gameName: gameName
          });
          break;

        case 'GAME_STATUS':
          console.log('🎮 Game Status Update:', payload);
          // Handle game status updates (playing, paused, game_over)
          break;

        case 'STATE_SYNC':
          console.log('💾 Game State Sync:', payload);
          // Save game state for recovery if needed
          localStorage.setItem(`gameState_${user?.id}_${gameName}`, JSON.stringify(payload));
          break;

        case 'ERROR':
          console.error('❌ Game Error:', payload);
          // Handle game errors
          alert(`Game Error: ${payload.message}`);
          break;

        case 'FULLSCREEN_REQUEST':
          console.log('🖥️ Fullscreen requested by game');
          handleFullscreenRequest();
          break;

        default:
          console.log('Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);

    // Send READY message to game after iframe loads
    const readyTimer = setTimeout(() => {
      sendMessageToGame('READY');
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(readyTimer);
    };
  }, [isOpen, user, gameName]);

  // Helper function to send messages to the game iframe
  const sendMessageToGame = (type, payload = null) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type,
          payload,
          timestamp: Date.now()
        },
        '*' // In production, replace with specific game origin
      );
    }
  };

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${user?.id || 'guest'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log('📦 Iframe loaded - dismissing loading screen');
    // Dismiss loading screen when iframe is fully loaded
    setIsLoading(false);
  };

  // Handle iframe error (Mixed Content, 404, etc.)
  const handleIframeError = () => {
    console.error('⚠️ Iframe failed to load - possibly Mixed Content blocked');
    
    // Check if it's an HTTP game on HTTPS site
    if (window.location.protocol === 'https:' && gameUrl.startsWith('http:')) {
      console.log('🔓 HTTP game blocked on HTTPS site - opening in new tab');
      alert('This game cannot be loaded in the frame due to security restrictions.\n\nOpening in a new tab...');
      window.open(gameUrl, '_blank');
      onClose();
    } else {
      alert('Failed to load the game. Please try again later.');
      onClose();
    }
  };

  // Handle fullscreen request from game
  const handleFullscreenRequest = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Try different fullscreen API methods (browser compatibility)
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen().catch(err => {
          console.error('Fullscreen request failed:', err);
          sendMessageToGame('FULLSCREEN_RESPONSE', { success: false, error: err.message });
        });
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      } else {
        console.error('Fullscreen API not supported');
        sendMessageToGame('FULLSCREEN_RESPONSE', { success: false, error: 'Fullscreen not supported' });
      }
    }
  };

  // Handle close
  const handleClose = () => {
    if (window.confirm('Are you sure you want to close the game? Your progress may not be saved.')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-90">
      <div className="flex flex-col h-full">
        {/* Header - Hidden when game is loaded */}
        {isLoading && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isGameReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <h2 className="text-xl font-bold text-white">
                {gameName}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close game"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Close Button - Always visible, floating over game */}
        {!isLoading && (
          <>
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-20 p-2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full transition-all shadow-lg"
              aria-label="Close game"
              title="Close game"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreenRequest}
              className="absolute top-2 right-14 z-20 p-2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full transition-all shadow-lg"
              aria-label="Toggle fullscreen"
              title="Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900 bg-opacity-95">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FFDD15]"></div>
              <p className="mt-4 text-white text-lg font-semibold">Loading {gameName}...</p>
              <p className="mt-2 text-gray-400 text-sm">Please wait...</p>
            </div>
          </div>
        )}

        {/* Game Iframe */}
        <div className={isLoading ? "flex-1 relative" : "h-full relative"}>
          <iframe
            ref={iframeRef}
            src={gameUrl}
            className="w-full h-full border-0"
            title={gameName}
            allow="autoplay; fullscreen; gamepad; microphone; payment; downloads; camera; geolocation; midi; vr; accelerometer; gyroscope; magnetometer; usb"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation allow-orientation-lock allow-pointer-lock allow-presentation allow-storage-access-by-user-activation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    </div>
  );
};

export default GameIframeModal;
