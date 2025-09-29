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
        
        <div className="px-4 py-3 sm:px-5 sm:py-3 lg:px-8 lg:py-4">
          {/* Horizontal Navigation - SAME for ALL screen sizes */}
          <ul className="flex justify-center items-center 
                         /* Equal spacing between all items including sides */
                         space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10
                         /* Prevent wrapping */
                         whitespace-nowrap">
            
            {/* Logo - Responsive sizing with equal side padding */}
            <li className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9
                          transition-all duration-500 ease-out hover:scale-110"
              />
            </li>

            {/* Navigation Items - All visible on all screens */}
            {navItems.map((item, index) => (
              <li key={index} className="relative flex-shrink-0">
                {/* Services item without dropdown arrow */}
                {item === 'Service' ? (
                  <div className="relative">
                    <button
                      onClick={toggleServicesDropdown}
                      className="relative text-white/70 font-medium 
                                /* Larger text sizes for better mobile visibility */
                                text-sm sm:text-base md:text-lg lg:text-xl
                                transition-all duration-500 ease-out 
                                /* Changed hover color to yellow and reduced scale */
                                hover:text-yellow-400 hover:scale-105 
                                px-3 py-2 sm:px-4 sm:py-2 md:px-5 lg:px-6 
                                rounded-full hover:bg-white/10"
                    >
                      {item}
                    </button>
                  </div>
                ) : (
                  /* Regular navigation items - All visible on all screens */
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="relative text-white/70 font-medium 
                              /* Larger text sizes for better mobile visibility */
                              text-sm sm:text-base md:text-lg lg:text-xl
                              transition-all duration-500 ease-out 
                              /* Changed hover color to yellow and reduced scale */
                              hover:text-yellow-400 hover:scale-105 
                              px-3 py-2 sm:px-4 sm:py-2 md:px-5 lg:px-6 
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