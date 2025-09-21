import React, { useState } from 'react';

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'patta_management',
      name: 'Patta Management',
      icon: '📋'
    },
    {
      id: 'beneficiary_schemes',
      name: 'Beneficiary Schemes',
      icon: '👥'
    }
  ];

  const handleMenuClick = (componentId) => {
    setActiveComponent(componentId);
    setIsMobileMenuOpen(false);
    // Update hash for routing
    window.location.hash = `#${componentId}`;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden md:hidden block p-4 bg-blue-600">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`h-full bg-white shadow-lg transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 md:translate-x-0 
        fixed lg:relative md:relative z-50 w-64 sm:w-48`}>
        
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 
                    ${activeComponent === item.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;