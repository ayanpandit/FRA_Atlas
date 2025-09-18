import React from 'react';
import mapImage from '../assets/states-map.jpg';
import impactImage from '../assets/back3.jpg';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* States Coverage & Data Availability Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* States Coverage */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={mapImage} 
                  alt="States Coverage Map"
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2"> Top States Coverage</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-full">
                      Chhattisgarh
                    </span>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-full">
                    Odisha
                    </span>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded-full">
                      Maharashtra
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Availability */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Data Availability
              </h3>
              
              <div className="bg-gray-700 text-white p-4 sm:p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium">Verified pattas records</span>
                  <span className="text-xs sm:text-sm" style={{ color: '#FACC15' }}>●</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FACC15' }}>2,45,000+</div>
              </div>

              <div className="bg-gray-700 text-white p-4 sm:p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm sm:text-base font-medium">Mapped boundaries</span>
                  <span className="text-blue-400 text-xs sm:text-sm">●</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FACC15' }}>1,89,000+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Vision Section */}
      <section 
        className="relative py-16 sm:py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${impactImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Our Impact & Vision
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-6 sm:mb-8">
              We are transforming tribal land governance through innovative technology solutions. 
              Our platform is enabling transparent, efficient, and data-driven decision making 
              that impacts thousands of tribal families across India. Together, we're building 
              a more inclusive and technologically advanced future for forest land management.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FACC15' }}>5+</div>
                <div className="text-sm sm:text-base text-gray-300">States Covered</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FACC15' }}>2.5L+</div>
                <div className="text-sm sm:text-base text-gray-300">Records Digitized</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FACC15' }}>99.5%</div>
                <div className="text-sm sm:text-base text-gray-300">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;