import React, { useState, useEffect, useRef } from 'react';
import Sidebar_User from '../components/sidebar_user';
// import Dashboard from '../pages/dashboard';
import UserManagement from '../pages/user_management';
import UserDashboard from '../pages/user_dashboard';
import Claimant_patta from '../pages/Claimant_patta';
import Schemes from '../pages/Schemes_&_Benefits';  
import FRAAtlas_user from '../pages/FRA_Atlas_user';

const Workflow_User = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transition, setTransition] = useState(false);
  
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveComponent(hash);
      }
    };

    handleHashChange(); // Handle initial hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveComponent]);

  // Screen size detection and responsive handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Responsive sidebar width adjustments
      if (width < 768) {
        setSidebarWidth(0);
        setSidebarCollapsed(true);
      } else if (width < 1024) {
        setSidebarWidth(64);
        setSidebarCollapsed(true);
      } else if (width < 1280) {
        setSidebarWidth(200);
        setSidebarCollapsed(false);
      } else {
        setSidebarWidth(280);
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render main content
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <UserDashboard />;
      case 'patta':
        return <Claimant_patta />;
      case 'schemes':
        return <Schemes />;
      case 'fra_atlas':
        return <FRAAtlas_user />;
      case 'user_management':
        return <UserManagement />;
      default:
        return <UserDashboard/>;
    }
  };

  const effectiveSidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 64 : sidebarWidth);

  return (
  <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`
          relative bg-white shadow-2xl border-r border-gray-200
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'flex-shrink-0'}
          ${isMobile && sidebarCollapsed ? 'transform -translate-x-full' : ''}
        `}
        style={{ 
          width: isMobile ? '320px' : `${effectiveSidebarWidth}px`,
          minWidth: isMobile ? '320px' : `${effectiveSidebarWidth}px`,
          maxWidth: isMobile ? '320px' : `${effectiveSidebarWidth}px`,
          transition: isResizing ? 'none' : 'all 0.3s ease-in-out'
        }}
      >
        <Sidebar_User 
          activeComponent={activeComponent} 
          setActiveComponent={setActiveComponent}
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

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white"
        style={{ 
          width: `calc(100% - ${effectiveSidebarWidth}px)`,
          transition: isResizing ? 'none' : 'all 0.3s ease-in-out'
        }}
      >
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 lg:p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow_User;