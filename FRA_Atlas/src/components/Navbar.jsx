import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navItems = ['HOME', 'ABOUT', 'SERVICE', 'CONTACT'];

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-fit backdrop-blur-md bg-white/10 rounded-full border border-white/20">
      <div className="px-8 py-4">
        <ul className="flex justify-center items-center space-x-8">
          <li>
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 transition-all duration-500 ease-out hover:scale-110"
            />
          </li>
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.toLowerCase()}`}
                className="relative text-white/70 font-medium text-lg transition-all duration-500 ease-out hover:text-white hover:scale-125 group px-4 py-2 rounded-full hover:bg-white/10"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white transition-all duration-500 ease-out group-hover:w-3/4"></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;