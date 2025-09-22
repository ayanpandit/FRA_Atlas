// src/components/Level.jsx
import React from "react";
import individualMapImg from "../assets/individual-map.jpg";
import communityMapImg from "../assets/community-map.jpg";

const Level = () => {
  return (
  <section className="py-16 px-4" style={{ background: 'inherit' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            AI that Thinks at Two Levels
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our intelligent platform analyses data to provide tailored recommendations for
            both individual landholders and entire communities.
          </p>
        </div>

        {/* Two Level Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Individual Patta Holder Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 lg:p-8">
              {/* Icon and Title */}
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg 
                    className="w-6 h-6 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Individual Patta Holder
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI analyzes individual land records and recommends relevant 
                government schemes. For example, a farmer with a land patta in a 
                drought-prone area might receive recommendations for water 
                conservation schemes or drought relief programs.
              </p>

              {/* Map Image */}
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src={individualMapImg} 
                  alt="Individual land mapping visualization"
                  className="w-full h-48 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Community / Village Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 lg:p-8">
              {/* Icon and Title */}
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <svg 
                    className="w-6 h-6 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Community / Village
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI assesses community-level data and suggests schemes beneficial 
                for the entire village. For instance, if a village has a high number of 
                small landholders, the AI might recommend a collective farming 
                initiative or a community irrigation project.
              </p>

              {/* Map Image */}
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src={communityMapImg} 
                  alt="Community mapping visualization"
                  className="w-full h-48 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Level;