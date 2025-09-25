import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import LoginSignup from './login&signup';
import { useNavigate } from "react-router-dom";

import bg1 from "/bg1.jpg";
import bg2 from "/bg2.jpg";
import bg3 from "/bg3.jpg";
import bg4 from "/bg4.webp";
import bg5 from "/bg5.png";

const tagText = "AI-Powered";
const h1Text = "FRA Atlas for Smarter Tribal Land Governance";
const subText = "Digitizing forest rights, mapping assets with AI & Remote Sensing, and enabling data-driven decisions through WebGIS & DSS.";

const TYPING_SPEED = 70; // ms per character (slower)
const FADE_IN_DELAY = 400; // ms after typing ends

const Hero = () => {
  const { user, getWorkflowPath } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handlePortalClick = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      navigate(getWorkflowPath());
    }
  };
  const navigate = useNavigate();
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
    <section
      className="relative w-full h-screen flex items-center justify-center text-center bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: `url(${images[bgIndex]})`,
        transition: 'background-image 0.7s ease-in-out',
      }}
    >
      {/* Fade overlay for sliding effect */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-700 pointer-events-none ${fade ? 'opacity-50' : 'opacity-80'}`}
        style={{ zIndex: 1 }}
      ></div>

      <div className="relative z-10 max-w-3xl px-6">
        {/* 1. The small, beautiful Tag (Above H1) */}
        <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-center" style={{ marginTop: '2em' }}>
          <span 
            className="inline-block px-4 py-1 rounded-full text-black shadow-xl transition duration-300 ease-in-out transform hover:scale-105" 
            style={{ backgroundColor: '#FACC15' }}
          >
            {tagText}
          </span>
        </p>

        {/* 2. The Main H1 Title (Typing Animation) */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ minHeight: '2.5em', marginTop: '1em' }}>
          {(() => {
            const fraPart = "FRA";
            const cursor = "__";
            const isTyping = typed.endsWith(cursor);
            const textToShow = isTyping ? typed.slice(0, -2) : typed;
            const fraStartIndex = 0;
            const fraEndIndex = fraPart.length;
            const typedFraPart = textToShow.slice(fraStartIndex, fraEndIndex);
            const typedRestPart = textToShow.slice(fraEndIndex);
            return (
              <>
                <span style={{ color: '#FACC15' }}>{typedFraPart}</span>
                {typedRestPart}
                {isTyping && cursor}
              </>
            );
          })()}
        </h1>
        {/* Subtext and Buttons */}
        <p
          className={`text-lg md:text-xl text-gray-200 mb-4 transition-opacity duration-700 ${showSub ? 'opacity-100' : 'opacity-0'}`}
          style={{ marginTop: showSub ? '0' : '-1em' }}
        >
          {subText}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={handlePortalClick}
            className="px-6 py-3 text-black rounded-lg shadow-lg transition" 
            style={{ backgroundColor: '#FACC15' }}
          >
            FRA Portal
          </button>
          <LoginSignup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          <button 
            className="px-6 py-3 border border-gray-300 text-white hover:bg-white hover:text-black rounded-lg transition"
            onClick={() => navigate('/fra_documentation')}
          >
            FRA Documentation
          </button>
        </div>
      </div>
      {/* SVG Wave Pattern at Bottom for Smooth Transition */}
      <div className="absolute left-0 right-0 bottom-0 w-full overflow-hidden pointer-events-none" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[120px]">
          <path fill="#F0F1C5" fillOpacity="1" d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
    </>
  );
};

export default Hero;