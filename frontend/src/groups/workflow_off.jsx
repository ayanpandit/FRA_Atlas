import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar_Off from '../components/sidebar_off';
import Dashboard from '../pages/dashboard';
import PattaManagement from '../pages/patta_management';
import BeneficiarySchemes from '../pages/beneficiary_schemes';
import Map_Land_Analysis from '../pages/map_land_analysis';
import UserManagement from '../pages/user_management'; 

const Workflow_Off = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transition, setTransition] = useState(false);
  
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync active component with current route
  useEffect(() => {
    const allowedComponents = new Set([
      'dashboard',
      'patta_management',
      'beneficiary_schemes',
      'map_land_analysis',
      'user_management'
    ]);

    const rawPath = location.pathname.replace(/^\/workflow_off\/?/, '');
    const nextComponent = rawPath ? rawPath.split('/')[0] : 'dashboard';

    if (!allowedComponents.has(nextComponent)) {
      if (location.pathname !== '/workflow_off') {
        navigate('/workflow_off', { replace: true });
      }
      setActiveComponent('dashboard');
      return;
    }

    if (nextComponent !== activeComponent) {
      setActiveComponent(nextComponent);
    }
  }, [location.pathname, activeComponent, navigate]);

  const handleComponentChange = (componentId) => {
    const targetPath = componentId === 'dashboard' 
      ? '/workflow_off' 
      : `/workflow_off/${componentId}`;

    setActiveComponent(componentId);

    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }

    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Screen size detection and responsive handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 768;
      setIsMobile(isMobileDevice);
      
      // Enhanced responsive sidebar width adjustments
      if (width < 640) {
        // Mobile phones (portrait)
        setSidebarWidth(0);
        setSidebarCollapsed(true);
      } else if (width < 768) {
        // Mobile phones (landscape) & small tablets
        setSidebarWidth(0);
        setSidebarCollapsed(true);
      } else if (width < 1024) {
        // Tablets (portrait) - collapsed sidebar with icons
        setSidebarWidth(72);
        setSidebarCollapsed(true);
      } else if (width < 1280) {
        // Tablets (landscape) & small laptops - medium sidebar
        setSidebarWidth(220);
        setSidebarCollapsed(false);
      } else if (width < 1536) {
        // Laptops - standard sidebar
        setSidebarWidth(280);
        setSidebarCollapsed(false);
      } else {
        // Large desktops - wider sidebar
        setSidebarWidth(300);
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Debounce resize events for better performance
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Render main content
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'patta_management':
        return <PattaManagement />;
      case 'beneficiary_schemes':
        return <BeneficiarySchemes />;
      case 'map_land_analysis':
        return <Map_Land_Analysis />;
        case 'user_management':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  const effectiveSidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : sidebarWidth);

  return (
  <div className="flex h-screen bg-white overflow-hidden">
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-teal-200 hover:bg-teal-50 transition-all duration-200 active:scale-95"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6 text-teal-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
        </button>
      )}

      {/* Sidebar Container - Only renders when not mobile OR when mobile menu is open */}
      {(!isMobile || !sidebarCollapsed) && (
      <div 
        ref={sidebarRef}
        className={`
          relative bg-white shadow-2xl border-r border-teal-200
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'flex-shrink-0'}
          ${isMobile ? 'transform transition-transform duration-300 ease-in-out' : ''}
        `}
        style={{ 
          width: isMobile ? 'min(85vw, 320px)' : `${effectiveSidebarWidth}px`,
          minWidth: isMobile ? 'min(85vw, 320px)' : `${effectiveSidebarWidth}px`,
          maxWidth: isMobile ? 'min(85vw, 320px)' : `${effectiveSidebarWidth}px`,
          transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Sidebar_Off 
          activeComponent={activeComponent} 
          onMenuSelect={handleComponentChange}
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Resize Handle */}
        {!isMobile && !sidebarCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              
              const handleMouseMove = (moveEvent) => {
                const newWidth = Math.max(200, Math.min(600, startWidth + (moveEvent.clientX - startX)));
                setSidebarWidth(newWidth);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                setIsResizing(false);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        )}
      </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarCollapsed(true)}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white"
        style={{ 
          transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-full">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow_Off;