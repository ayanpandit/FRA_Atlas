import React, { useState, useEffect } from 'react';
import { User, Home, Briefcase, ChevronDown } from 'lucide-react';
import Loader from './loader';
import { useNavigate } from "react-router-dom";

import bg1 from "/bg1.jpg";
import bg2 from "/bg2.jpg";
import bg3 from "/bg3.jpg";
import bg4 from "/bg4.jpg";
import bg5 from "/bg5.jpg";

const tagText = "AI-Powered";
const h1Text = "FRA Atlas for Smarter Tribal Land Governance";
const subText = "Digitizing forest rights, mapping assets with AI & Remote Sensing, and enabling data-driven decisions through WebGIS & DSS.";

const TYPING_SPEED = 70; // ms per character (slower)
const FADE_IN_DELAY = 400; // ms after typing ends

const Hero = () => {
  const navigate = useNavigate();
  
  // Dropdown and loader states
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState(null);

  // Handler for portal selection from FRA Portal dropdown
  const handlePortalClick = (portalType = null) => {
    if (portalType) {
      // Portal selection from dropdown
      let route = '';
      switch(portalType) {
        case 'user':
          route = '#/workflow_user';
          break;
        case 'gp':
          route = '#/workflow_off';
          break;
        case 'admin':
          route = '#/workflow_admin';
          break;
        default:
          route = '#/';
      }
      setSelectedPortal(route);
      setShowLoader(true);
      setShowPortalDropdown(false);
      // Navigate after 3 second delay
      setTimeout(() => {
        setShowLoader(false);
        window.location.href = route;
      }, 3000);
    } else {
      // Toggle dropdown when clicking main button
      setShowPortalDropdown(!showPortalDropdown);
    }
  };
  const [typed, setTyped] = useState("");
  const [showSub, setShowSub] = useState(false);
  useEffect(() => {
    let i = 0;
    const type = () => {
      // Type out the main h1 text only
      if (i <= h1Text.length) {
        setTyped(h1Text.slice(0, i) + "__");
        i++;
        setTimeout(type, TYPING_SPEED);
      } else {
        setTyped(h1Text); // Remove cursor after typing
        setTimeout(() => setShowSub(true), FADE_IN_DELAY);
      }
    };
    type();
    // Cleanup
    return () => setTyped("");
  }, []);

  // Sliding background logic
  const images = [bg1, bg2, bg3, bg4, bg5];
  const [bgIndex, setBgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 600); // fade out duration
    }, 3500); // show each image for 3.5s
    return () => clearInterval(interval);
  }, []);



  return (
    <>
    {/* Show loader overlay when loading */}
    {showLoader && <Loader />}
    <section
      className="relative w-full h-screen flex items-center justify-center text-center bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: `url(${images[bgIndex]})`,
        transition: 'background-image 0.7s ease-in-out',
        /* Ensure background covers full screen on all devices */
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw'
      }}
    >
      {/* Fade overlay for sliding effect */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-150 transition-opacity duration-700 pointer-events-none ${fade ? 'opacity-70' : 'opacity-90'}`}
        style={{ zIndex: 1 }}
      ></div>

      {/* Bottom-left: Tag, H1, Subtext - RESPONSIVE POSITIONING WITH OVERLAP PREVENTION */}
      <div className="absolute left-0 bottom-0 z-10 
                      /* Mobile: Full width, centered, top positioning */
                      w-full text-center top-1/4 p-4
                      /* Small mobile: Adjusted positioning */
                      xs:top-1/3 xs:p-4
                      /* Tablet: Left positioning starts, PREVENT OVERLAP */
                      sm:w-auto sm:text-left sm:top-auto sm:bottom-0 sm:p-6 sm:mb-32 sm:max-w-[50%]
                      /* Medium screens: Better spacing, prevent overlap */
                      md:p-8 md:mb-24 md:max-w-[55%]
                      /* Large screens: Original laptop layout */
                      lg:p-12 lg:mb-10 lg:max-w-2xl
                      flex flex-col gap-2 sm:gap-4"
           style={{
             /* Responsive max-width with overlap prevention */
             maxWidth: window.innerWidth < 640 ? '95%' : window.innerWidth < 768 ? '50%' : window.innerWidth < 1024 ? '55%' : '750px'
           }}>
        
        {/* AI-Powered Tag - Responsive sizing */}
        <p className="mb-1 sm:mb-2 
                      text-xs 
                      tracking-widest uppercase">
          <span 
            className="inline-block 
                       /* Responsive padding */
                       px-2 py-1 xs:px-3 xs:py-1 sm:px-4 sm:py-1
                       rounded-full text-black shadow-xl 
                       transition duration-300 ease-in-out transform hover:scale-105
                       /* Responsive text size */
                       text-xs xs:text-xs sm:text-xs" 
            style={{ backgroundColor: '#FACC15' }}
          >
            {tagText}
          </span>
        </p>

        {/* Main Heading - Responsive text sizes */}
        <h1 className="/* Responsive text sizes */
                       text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-6xl
                       font-bold text-[#F6FFB2] 
                       /* Responsive margin */
                       mb-2 sm:mb-4
                       /* Responsive min-height */
                       leading-tight"
            style={{ 
              minHeight: window.innerWidth < 640 ? '1.5em' : window.innerWidth < 1024 ? '2em' : '2.5em'
            }}>
          <span style={{ color: '#FACC15' }}>VanMitra</span>
          <br className="hidden xs:block" />
          <span className="xs:hidden"> </span>
          Mapping Rights, Powering Targeted Tribal Development
        </h1>

        {/* Subtext - Responsive sizing and spacing */}
        <p className={`/* Responsive text sizes */
                       text-sm xs:text-base sm:text-lg
                       tracking-tight leading-tight font-semibold text-white 
                       /* Responsive margin */
                       mb-1 sm:mb-2
                       transition-opacity duration-700 
                       ${showSub ? 'opacity-100' : 'opacity-0'}`}
           style={{ marginTop: showSub ? '0' : '-1em' }}>
          {subText}
        </p>
      </div>

      {/* Bottom-right: Description + Buttons - RESPONSIVE POSITIONING WITH OVERLAP PREVENTION */}
      <div className="absolute right-0 z-10 
                      /* Mobile: Full width, centered, below main content */
                      w-full text-center bottom-8 p-4
                      /* Small mobile: Better spacing */
                      xs:bottom-12 xs:p-4
                      /* Tablet: Right positioning starts, PREVENT OVERLAP */
                      sm:w-auto sm:text-right sm:bottom-0 sm:p-6 sm:mb-32 sm:max-w-[45%]
                      /* Medium screens: Better spacing, prevent overlap */
                      md:p-8 md:mb-24 md:max-w-[40%]
                      /* Large screens: Original laptop layout */
                      lg:p-12 lg:mb-32 lg:max-w-md
                      flex flex-col 
                      /* Responsive alignment */
                      items-center sm:items-end">
        
        {/* Description text - Responsive sizing */}
        <p className="mb-3 sm:mb-4 
                      /* Responsive text sizes */
                      text-sm xs:text-base sm:text-base
                      tracking-tighter leading-tight text-white font-semibold 
                      /* Responsive text alignment */
                      text-center sm:text-left
                      rounded-lg 
                      /* Responsive padding */
                      px-3 py-2 xs:px-4 xs:py-2 sm:px-4 sm:py-2">
          Access the VanMitra Portal and documentation for smarter, AI-powered tribal land governance and forest rights management.
        </p>

        {/* Buttons Container - Stack vertically */}
        <div className="flex flex-col items-center space-y-4 w-full max-w-xs xs:max-w-sm sm:max-w-md">
          
          {/* Main Buttons Row */}
          <div className="flex 
                          /* Mobile: Stack vertically */
                          flex-col gap-3 w-full
                          /* Small screens: Horizontal */
                          xs:flex-row xs:gap-3
                          /* Tablet and up: Original horizontal layout */
                          sm:flex-row sm:gap-4">
            
            {/* FRA Portal Button - Responsive sizing */}
            <button 
              onClick={() => handlePortalClick()}
              className="/* Responsive padding and text */
                         px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2 md:px-6 md:py-3
                         text-xs xs:text-sm sm:text-base
                         text-black font-semibold bg-gradient-to-br from-[#FACC15] to-yellow-500 hover:from-yellow-500 hover:to-yellow-600
                         rounded-full transition transform hover:scale-105 duration-300
                         /* Responsive width */
                         w-full xs:w-auto flex items-center justify-center space-x-1 sm:space-x-2" 
              style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 8px rgba(250, 204, 21, 0.4)' : window.innerWidth < 768 ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 12px rgba(250, 204, 21, 0.45)' : 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15), 0 8px 16px rgba(250, 204, 21, 0.5), 0 4px 6px rgba(0,0,0,0.2)'}}
            >
              <span>FRA Portal</span>
              <ChevronDown className={`w-3 h-3 xs:w-4 xs:h-4 transition-transform duration-200 ${showPortalDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Documentation Button - Responsive sizing */}
            <button 
              className="/* Responsive padding and text */
                         px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2 md:px-6 md:py-3
                         text-xs xs:text-sm sm:text-base
                         border sm:border-2 font-semibold bg-white/30 backdrop-blur-sm border-white/40 sm:border-white/50
                         text-white hover:bg-white hover:text-black 
                         rounded-full transition transform hover:scale-105 duration-300
                         /* Responsive width */
                         w-full xs:w-auto"
              onClick={() => navigate('/fra_documentation')}
              style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.25)' : window.innerWidth < 768 ? 'inset 0 1px 0 rgba(255,255,255,0.35), 0 5px 10px rgba(0,0,0,0.275)' : 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(255,255,255,0.1)'}}
            >
              FRA Documentation
            </button>
          </div>
          
          {/* Portal Buttons - Fade in below main buttons */}
          <div className={`w-full transition-all duration-500 overflow-hidden ${
            showPortalDropdown 
              ? 'max-h-60 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-2 sm:space-y-3 w-full">
              {/* User Portal Button */}
              <button 
                className="w-full px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 
                           text-xs xs:text-sm sm:text-base
                           bg-white/20 backdrop-blur-sm border border-white/30 
                           text-white hover:bg-white hover:text-black 
                           rounded-full transition-all transform hover:scale-105 duration-300
                           flex items-center justify-center space-x-2"
                onClick={() => handlePortalClick('user')}
                style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.25)'}}
              >
                <User className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>User Portal</span>
              </button>
              
              {/* Gram Panchayat Portal Button */}
              <button 
                className="w-full px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 
                           text-xs xs:text-sm sm:text-base
                           bg-white/20 backdrop-blur-sm border border-white/30 
                           text-white hover:bg-white hover:text-black 
                           rounded-full transition-all transform hover:scale-105 duration-300
                           flex items-center justify-center space-x-2"
                onClick={() => handlePortalClick('gp')}
                style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.25)'}}
              >
                <Home className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>Gram Panchayat Portal</span>
              </button>
              
              {/* Admin Portal Button */}
              <button 
                className="w-full px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 
                           text-xs xs:text-sm sm:text-base
                           bg-white/20 backdrop-blur-sm border border-white/30 
                           text-white hover:bg-white hover:text-black 
                           rounded-full transition-all transform hover:scale-105 duration-300
                           flex items-center justify-center space-x-2"
                onClick={() => handlePortalClick('admin')}
                style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.25)'}}
              >
                <Briefcase className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* SVG Wave Pattern at Bottom - Responsive height */}
      <div className="absolute left-0 right-0 bottom-0 w-full overflow-hidden pointer-events-none" 
           style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" 
             fill="none" 
             xmlns="http://www.w3.org/2000/svg" 
             className="w-full 
                        /* Responsive wave height */
                        h-[60px] xs:h-[80px] sm:h-[100px] lg:h-[120px]">
          <path fill="#F0F1C5" fillOpacity="1" d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
    </>
  );
};

export default Hero;