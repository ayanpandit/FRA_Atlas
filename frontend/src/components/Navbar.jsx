import React, { useState } from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  // Navigation items array - modify these items as needed
  const navItems = ['Home', 'About', 'Service', 'Contact'];
  
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for services dropdown toggle
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  
  // Services dropdown options - modify these as needed
  const serviceOptions = [
    'Web Development',
    'Mobile Apps',
    'UI/UX Design'
  ];

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle services dropdown
  const toggleServicesDropdown = () => {
    setIsServicesDropdownOpen(!isServicesDropdownOpen);
  };

  return (
    <>
      {/* Main Navigation Bar - Fixed position with glassmorphism effect */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md bg-white/10 rounded-full border border-white/20
                      /* Responsive width adjustments */
                      w-fit max-w-[95vw]
                      /* Desktop and laptop - full navbar */
                      lg:w-fit lg:max-w-none
                      /* Tablet - slightly compressed */
                      md:w-fit md:max-w-[90vw]
                      /* Mobile - compact version */
                      sm:w-fit sm:max-w-[85vw]">
        
        <div className="px-3 py-2 lg:px-6 lg:py-3">
          {/* Desktop/Tablet Navigation - Hidden on mobile */}
          <ul className="hidden sm:flex justify-center items-center 
                         /* Spacing adjustments for different screen sizes */
                         space-x-2 md:space-x-4 lg:space-x-8">
            
            {/* Logo */}
            <li>
              <img 
                src={logo} 
                alt="Logo" 
                className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 
                          transition-all duration-500 ease-out hover:scale-110"
              />
            </li>

            {/* Navigation Items */}
            {navItems.map((item, index) => (
              <li key={index} className="relative">
                {/* Services item with dropdown */}
                {item === 'Service' ? (
                  <div className="relative">
                    <button
                      onClick={toggleServicesDropdown}
                      className="relative text-white/70 font-medium 
                                /* Responsive text sizes */
                                text-sm md:text-base lg:text-lg
                                transition-all duration-500 ease-out 
                                /* Changed hover color to yellow and reduced scale */
                                hover:text-yellow-400 hover:scale-105 
                                px-2 py-2 md:px-3 lg:px-4 
                                rounded-full hover:bg-white/10 
                                flex items-center gap-1"
                    >
                      {item}
                      {/* Dropdown arrow */}
                      <svg 
                        className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${
                          isServicesDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Services Dropdown Menu - Positioned lower with responsive spacing */}
                    {isServicesDropdownOpen && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                     /* Responsive positioning - more space below */
                                     mt-3 md:mt-4 lg:mt-5
                                     w-44 md:w-48 lg:w-52 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 
                                     shadow-lg overflow-hidden">
                        {serviceOptions.map((service, serviceIndex) => (
                          <a
                            key={serviceIndex}
                            href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-4 py-3 text-white/70 hover:text-yellow-400 
                                      hover:bg-white/10 transition-all duration-300 
                                      text-sm md:text-base
                                      /* Removed bottom border underlines */
                                      last:rounded-b-xl"
                          >
                            {service}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular navigation items */
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="relative text-white/70 font-medium 
                              /* Responsive text sizes */
                              text-sm md:text-base lg:text-lg
                              transition-all duration-500 ease-out 
                              /* Changed hover color to yellow and reduced scale */
                              hover:text-yellow-400 hover:scale-105 
                              px-2 py-2 md:px-3 lg:px-4 
                              rounded-full hover:bg-white/10"
                  >
                    {item}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center justify-between w-full">
            {/* Mobile Logo */}
            <img 
              src={logo} 
              alt="Logo" 
              className="w-5 h-5 transition-all duration-500 ease-out"
            />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="text-white/70 hover:text-yellow-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  /* X icon when menu is open */
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  /* Hamburger icon when menu is closed */
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown - Positioned lower */}
      {isMobileMenuOpen && (
        <div className="fixed left-1/2 transform -translate-x-1/2 z-40 
                        /* Responsive positioning - more space below navbar */
                        top-16 sm:top-18 md:top-20 lg:top-22
                        w-[90vw] max-w-sm backdrop-blur-md bg-white/10 
                        rounded-2xl border border-white/20 shadow-lg sm:hidden">
          <div className="py-4">
            {navItems.map((item, index) => (
              <div key={index}>
                {/* Services item with mobile dropdown */}
                {item === 'Service' ? (
                  <div>
                    <button
                      onClick={toggleServicesDropdown}
                      className="w-full flex items-center justify-between px-6 py-3 
                                text-white/70 hover:text-yellow-400 hover:bg-white/10 
                                transition-all duration-300 text-left"
                    >
                      {item}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isServicesDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Mobile Services Submenu - Removed underlines */}
                    {isServicesDropdownOpen && (
                      <div className="bg-white/5">
                        {serviceOptions.map((service, serviceIndex) => (
                          <a
                            key={serviceIndex}
                            href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-8 py-2 text-white/60 hover:text-yellow-400 
                                      hover:bg-white/10 transition-all duration-300 text-sm
                                      /* Removed border underlines */
                                      last:rounded-b-xl"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {service}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular mobile navigation items */
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block px-6 py-3 text-white/70 hover:text-yellow-400 
                              hover:bg-white/10 transition-all duration-300 
                              /* Removed bottom border underlines */
                              last:rounded-b-2xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;