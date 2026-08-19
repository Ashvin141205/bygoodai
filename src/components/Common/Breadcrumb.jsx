import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Define friendly names for routes
  const routeNames = {
    'deposit': 'Deposit',
    'cart': 'Shopping Cart',
    'checkout': 'Checkout',
    'about': 'About Us',
    'contact': 'Contact',
    'faq': 'FAQ',
    'blog': 'Blog',
    'support': 'Support',
    'user': 'Dashboard',
    'deposits': 'Deposits',
    'withdrawals': 'Withdrawals',
    'orders': 'Orders',
    'profile': 'Profile'
  };
  
  const defaultItems = [
    { name: 'Home', path: '/' },
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        name: routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
        path: path
      };
    })
  ];
  
  const items = customItems || defaultItems;
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.luckycharmsweep.com${item.path}`
    }))
  };

  // Don't show breadcrumb for homepage
  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav 
        className="breadcrumb-nav flex justify-center h-[40px] bg-gray-800/20 py-1 px-4 text-xs border-b border-gray-700/30"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <ol className="flex items-center space-x-1 max-w-7xl mx-auto overflow-x-auto">
          {items.map((item, index) => (
            <li 
              key={index} 
              className="flex items-center flex-shrink-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={index + 1} />
              {index < items.length - 1 ? (
                <>
                  <Link 
                    to={item.path}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.name}</span>
                  </Link>
                  <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
                </>
              ) : (
                <span 
                  className="text-gray-300 font-medium"
                  itemProp="name"
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;