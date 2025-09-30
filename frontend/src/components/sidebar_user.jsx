import React, { useState, useEffect, useRef } from 'react';
import logo from "/logo.png";
// ...existing code...



const Sidebar_User = ({ 
  activeComponent, 
  setActiveComponent, 
  sidebarWidth = 280, 
  setSidebarWidth,
  isCollapsed: externalCollapsed,
  setIsCollapsed: setExternalCollapsed,
  user = { name: 'Guest', role: 'user' } // Default user object to prevent ReferenceError
}) => {
  // ...existing code...
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  const [expandedMenus, setExpandedMenus] = useState({});
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  // Use external collapsed state if provided, otherwise use internal state
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = setExternalCollapsed || setInternalCollapsed;

  // Navigate and update hash
  const handleNavigation = (itemId, externalPath) => {
    if (externalPath) {
      window.location.href = externalPath;
    } else {
      setActiveComponent(itemId);
      window.location.hash = itemId;
      
      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 768) {
        setScreenSize('tablet-sm');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1280) {
        setScreenSize('laptop');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle initial hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveComponent(hash);
    }
  }, [setActiveComponent]);

  // Menu items with enhanced icons
  const menuItems = [
    {
      id: 'home',
      name: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Return to landing page',
      category: 'navigation',
      externalPath: '/'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Main dashboard overview',
      category: 'main'
    },
    {
      id: 'patta',
      name: 'Pattas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Manage land pattas',
      category: 'main'
    },
    {
      id: 'schemes',
      name: 'Schemes & Benefits',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'View and manage schemes and benefits',
      category: 'main'
    },
    {
      id: 'fra_atlas',
      name: 'FRA Atlas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Access the FRA Atlas',
      category: 'main'
    }
  ];

  // Fixed render menu item function
  const renderMenuItem = (item) => (
    <div key={item.id} className="w-full mb-1">
      <button
        onClick={() => {
          handleNavigation(item.id, item.externalPath);
          if (item.subItems) {
            setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
          }
        }}
        className={`
          w-full flex items-center rounded-lg transition-all duration-200 ease-in-out
          ${activeComponent === item.id 
            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center py-3 px-2' : 'justify-start py-4 px-4'}
        `}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <span className={`flex-shrink-0 ${activeComponent === item.id ? 'text-blue-600' : 'text-gray-500'} ${isCollapsed ? '' : 'mr-4'}`}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="truncate font-semibold text-base">{item.name}</span>
          )}
        </div>
      </button>
    </div>
  );

  return (
    <div 
      className="h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out"
      style={{ 
        width: isCollapsed ? '80px' : '280px',
        minWidth: isCollapsed ? '80px' : '280px'
      }}
      ref={sidebarRef}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'min-w-0'}`}>
          {/* Logo */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="flex-shrink-0">
              <img 
                src={logo}
                alt="FRA Portal Logo"
                className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg object-cover border-2 border-blue-200`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback logo */}
              <div 
                className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold border-2 border-blue-200 hidden`}
              >
                <span className={isCollapsed ? 'text-sm' : 'text-base'}>FRA</span>
              </div>
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">FRA Portal</h1>
                <p className="text-xs text-gray-600 truncate">Forest Rights</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Collapse Button - Only show on desktop and when not collapsed */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <svg
              className="w-4 h-4 text-gray-600 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Enhanced Menu Items Container */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2 justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <>
              <div className="text-xs text-gray-600">
                <div className="font-medium">v2.1.0</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-xs text-gray-600">v2.1.0</div>
            </>
          )}
        </div>
        
        {/* User info when not collapsed */}
        {!isCollapsed && user && (
  <div className="mt-3 pt-3 border-t border-gray-200">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 truncate">
          {user.name || 'Guest'}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
        </div>
      </div>
    </div>
  </div>
)}


        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full mt-3 p-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-gray-600 transform rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar_User;