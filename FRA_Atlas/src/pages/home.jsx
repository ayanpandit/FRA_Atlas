// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import backImg from "../assets/back.jpg";


// New structure for content
const tagText = "AI-Powered";
const h1Text = "FRA Atlas for Smarter Tribal Land Governance";
const subText = "Digitizing forest rights, mapping assets with AI & Remote Sensing, and enabling data-driven decisions through WebGIS & DSS.";

const TYPING_SPEED = 70; // ms per character (slower)
const FADE_IN_DELAY = 400; // ms after typing ends

const HeroSection = () => {
  const [typed, setTyped] = useState("");
  const [showSub, setShowSub] = useState(false);

  // Define image URLs for the 3D ring
  const images = [
    "/src/assets/1.jpg",
    "/src/assets/2.jpg",
    "/src/assets/3.jpg",
    "/src/assets/4.jpg",
    "/src/assets/5.jpg",
    "/src/assets/6.jpg",
    "/src/assets/7.jpg",
    "/src/assets/8.jpg",
    "/src/assets/9.jpg",
  ];

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

  return (
    <>
    <section
      className="relative w-full h-screen flex items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backImg})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

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
          <button className="px-6 py-3 text-black rounded-lg shadow-lg transition" style={{ backgroundColor: '#FACC15' }}>
            Dashboard
          </button>
          <button className="px-6 py-3 border border-gray-300 text-white hover:bg-white hover:text-black rounded-lg transition">
            FRA Documentation
          </button>
        </div>
      </div>
    </section>
    {/* Supported States Section START */}
    <section className="w-full py-12 bg-transparent">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center" style={{ color: '#FACC15' }}>Supported States</h2>
      </div>
    </section>
    {/* Supported States Section END */}
    </>
  );
};

export default HeroSection;