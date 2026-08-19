import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HeaderMobile from './HeaderMobile';
import FloatingCartBar from '../FloatingCartBar';
import RecentWinnerPopup from '../RecentWinnerPopup';
import Breadcrumb from '../Common/Breadcrumb';
import LocalGamingSEO from '../Common/LocalGamingSEO';

const Layout = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1080);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1080);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Conditions based on current route
    const isHomePage = location.pathname === '/';
    const isDepositPage = location.pathname === '/deposit';

    return (
        <div className='bg_dark'>
            {/* Global Local Gaming SEO */}
            <LocalGamingSEO 
                targetRegions={['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France']}
                includeLocalBusiness={true}
                businessInfo={{
                    name: "LuckCharm Gaming Platform",
                    email: "support@luckcharm.com",
                    country: "US"
                }}
            />
            
            {/* Header */}
            {isMobile ? <HeaderMobile /> : <Header />}
            
            {/* Breadcrumb - completely hidden */}

            <main className='min-h-screen'>
                {/* Breadcrumb removed from mobile as well */}
                <Outlet />
            </main>

            <Footer />

            {isDepositPage && <FloatingCartBar />}
            {(isHomePage || isDepositPage) && <RecentWinnerPopup />}
        </div>
    );
};

export default Layout;
