import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const FloatingCartBar = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.games?.cart || []);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const prevItemCount = useRef(cart.length);

  // This effect triggers the pulse animation when a new item is added to the cart
  useEffect(() => {
    if (cart.length > prevItemCount.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
    prevItemCount.current = cart.length;
  }, [cart.length]);

  const uniqueItems = cart.length;
  const totalPrice = cart.reduce((total, item) => total + (item.quantity || 0) * (item.game_price || 0), 0);

  if (uniqueItems === 0) {
    return null;
  }

  const handleCheckout = () => {
    navigate('/cart');
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-[#1F2937] border-t border-gray-700 py-3 pl-4 pr-24 shadow-2xl z-50 md:hidden animate-slide-in-up ${isAnimating ? 'animate-pulse-subtle' : ''}`}
    >
      <div className="flex justify-between items-center">
        
        {/* Left Side: Clearer labels for better readability */}
        <div className="flex items-center space-x-3 text-white">
          <FaShoppingCart className="text-[#FFDD15] text-2xl" />
          <div>
            <p className="font-semibold text-xs text-white">
              {uniqueItems} {uniqueItems > 1 ? 'ITEMS' : 'ITEM'}
            </p>
            <p className="text-xl font-extrabold text-green-400">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Right Side: Stronger call-to-action with an icon */}
        <button
          onClick={handleCheckout}
          className="flex items-center gap-2 bg-[#FFDD15] text-black font-bold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-300 transition-colors text-base"
        >
          <span>Checkout</span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingCartBar;