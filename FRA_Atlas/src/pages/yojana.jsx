
import React from 'react';
import PMKisanImage from '../assets/PM-Kisan_Samman_Nidhi.jpg';
import JalJeevanImage from '../assets/PM-Kisan_Samman_Nidhi.jpg';
import PMAwasImage from '../assets/PM-Kisan_Samman_Nidhi.jpg';
import ForestRightsImage from '../assets/PM-Kisan_Samman_Nidhi.jpg';
import MGNREGAImage from '../assets/PM-Kisan_Samman_Nidhi.jpg';
import RuralDevImage from '../assets/PM-Kisan_Samman_Nidhi.jpg'

const PattaPortalSection = () => {
  const schemes = [
    {
      name: "PM-Kisan Samman Nidhi",
      image: PMKisanImage
    },
    {
      name: "Jal Jeevan Mission",
      image: JalJeevanImage
    },
    {
      name: "PM Awas Yojana",
      image: PMAwasImage
    },
    {
      name: "Forest Rights Act",
      image: ForestRightsImage
    },
    {
      name: "MGNREGA",
      image: MGNREGAImage
    },
    {
      name: "Rural Development Schemes",
      image: RuralDevImage
    }
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Recommended Yojanas
          </h2>
        </div>

        {/* Premium Sliding Cards Container */}
        <div className="relative">
          <div className="flex animate-slide gap-8 w-max">
            {/* First set of cards */}
            {schemes.map((scheme, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-yellow-400 hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={scheme.image} 
                    alt={scheme.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
                  <h3 className="text-xl font-bold text-black text-center group-hover:text-gray-800 transition-colors duration-300">
                    {scheme.name}
                  </h3>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {schemes.map((scheme, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-yellow-400 hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={scheme.image} 
                    alt={scheme.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
                  <h3 className="text-xl font-bold text-black text-center group-hover:text-gray-800 transition-colors duration-300">
                    {scheme.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-slide {
          animation: slide 30s linear infinite;
        }
        
        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PattaPortalSection;