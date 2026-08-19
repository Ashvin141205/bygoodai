import React, { useEffect, useRef, useState, memo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SideBar from './SideBar'; // Imports the SideBar
import { ApiHandler } from '../../helper/ApiHandler';

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEcommerceOpen, setIsEcommerceOpen] = useState(false);
  const {
    total_count,
    promotion_count,
    system_count,
    token,
    dailyStreakData,
  } = useSelector((state) => state.auth);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const dropdownRef = useRef(null);
  const sidebarButtonRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  // Toggle functions
  const toggleEcommerce = () => setIsEcommerceOpen(!isEcommerceOpen);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setHasInteracted(true);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hint visibility logic
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      setShowHint(false);
    };
    if (window.innerWidth <= 768 && !hasInteracted) {
      setShowHint(true);
      timeoutId = setTimeout(() => {
        setShowHint(false);
      }, 5000);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hasInteracted]);

  return (
    <section className="py-10 lgs:pt-36 lg:pb-8">
      <button
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-white rounded-lg md:hidden  focus:outline-none focus:ring-2 focus:ring-gray-200 bg-transparent"
        onClick={toggleSidebar}
        ref={sidebarButtonRef}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      {showHint && (
        <span className="text-gray-400 ms-2">Tap to open menu</span>
      )}
      <div className="relative  min-h-screen md:min-h-[115vh] overflow-y-auto">
        <SideBar
          isOpen={isOpen}
          toggleEcommerce={toggleEcommerce}
          isEcommerceOpen={isEcommerceOpen}
          toggleSidebar={toggleSidebar}
          dropdownRef={dropdownRef}
          total_count={total_count}
          promotion_count={promotion_count}
          system_count={system_count}
        />

        <div className="p-4 md:ml-64">
          <Outlet />
        </div>
      </div>

    </section>
  );
};

export default memo(Layout);