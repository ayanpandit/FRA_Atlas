// src/components/HeroSection.jsx
import React from "react";
import backImg from "../assets/back.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-center text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backImg})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 max-w-3xl px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          AI-Powered FRA Atlas for Smarter Tribal Land Governance
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          Digitizing forest rights, mapping assets with AI & Remote Sensing,
          and enabling data-driven decisions through WebGIS & DSS.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 text-black rounded-lg shadow-lg transition" style={{ backgroundColor: '#FACC15' }}>
            Explore FRA Atlas
          </button>
          <button className="px-6 py-3 border border-gray-300 text-white hover:bg-white hover:text-black rounded-lg transition">
            Analyze FRA Data
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
