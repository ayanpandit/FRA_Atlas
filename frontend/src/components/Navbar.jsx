import React, { useState } from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  // Navigation items array - modify these items as needed
  const navItems = ['Home', 'About', 'Service', 'Contact'];
  
  // State for services dropdown toggle
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  // Toggle services dropdown
  const toggleServicesDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
  };

  return (
    <>
      {/* Main Navigation Bar - Same layout for ALL devices with responsive sizing */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md bg-white/10 rounded-full border border-white/20
                      /* Responsive width - maintains horizontal layout on all screens */
                      w-fit max-w-[95vw]
                      /* Ensures navbar scales properly on smaller screens */
                      overflow-x-auto">
        
        <div className="px-2 py-2 sm:px-3 sm:py-2 lg:px-6 lg:py-3">
          {/* Horizontal Navigation - SAME for ALL screen sizes */}
          <ul className="flex justify-center items-center 
                         /* Responsive spacing that works on all devices */
                         space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6
                         /* Prevent wrapping */
                         whitespace-nowrap">
            
            {/* Logo - Responsive sizing */}
            <li className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7
                          transition-all duration-500 ease-out hover:scale-110"
              />
            </li>

            {/* Navigation Items - All visible on all screens */}
            {navItems.map((item, index) => (
              <li key={index} className="relative flex-shrink-0">
                {/* Services item with dropdown */}
                {item === 'Service' ? (
                  <div className="relative">
                    <button
                      onClick={toggleServicesDropdown}
                      className="relative text-white/70 font-medium 
                                /* Responsive text sizes for all devices */
                                text-xs xs:text-sm sm:text-sm md:text-base lg:text-lg
                                transition-all duration-500 ease-out 
                                /* Changed hover color to yellow and reduced scale */
                                hover:text-yellow-400 hover:scale-105 
                                px-1 py-1 xs:px-2 xs:py-2 sm:px-2 sm:py-2 md:px-3 lg:px-4 
                                rounded-full hover:bg-white/10 
                                flex items-center gap-0.5 sm:gap-1"
                    >
                      {item}
                      {/* Dropdown arrow - responsive sizing */}
                      <svg 
                        className={`w-2 h-2 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform duration-300 ${
                          isServicesDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    
                  </div>
                ) : (
                  /* Regular navigation items - All visible on all screens */
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="relative text-white/70 font-medium 
                              /* Responsive text sizes for all devices */
                              text-xs xs:text-sm sm:text-sm md:text-base lg:text-lg
                              transition-all duration-500 ease-out 
                              /* Changed hover color to yellow and reduced scale */
                              hover:text-yellow-400 hover:scale-105 
                              px-1 py-1 xs:px-2 xs:py-2 sm:px-2 sm:py-2 md:px-3 lg:px-4 
                              rounded-full hover:bg-white/10"
                  >
                    {item}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;