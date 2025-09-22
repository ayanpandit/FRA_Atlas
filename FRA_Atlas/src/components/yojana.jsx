// src/components/Yojana.jsx
import React, { useState, useEffect, useRef } from "react";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";

const Yojana = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of the component is visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const yojanas = [
    {
      id: 1,
      title: "PM Kisan Samman Nidhi",
      description: "Financial support for small farmers",
      image: img1,
      status: "Eligible",
      statusColor: "bg-green-500",
      icon: "💰",
      cardColor: "bg-white"
    },
    {
      id: 2,
      title: "PM Fasal Bima Yojana",
      description: "Crop insurance against natural calamities",
      image: img2,
      status: "Needs Verification",
      statusColor: "bg-yellow-500",
      icon: "🌾",
      cardColor: "bg-yellow-400"
    },
    {
      id: 3,
      title: "PM Krishi Sinchai Yojana",
      description: "Irrigation support for productivity",
      image: img3,
      status: "Eligible",
      statusColor: "bg-green-500",
      icon: "💧",
      cardColor: "bg-white"
    },
    {
      id: 4,
      title: "PM Matsya Sampada Yojana",
      description: "Support for fisheries and aquaculture",
      image: img4,
      status: "Needs Verification",
      statusColor: "bg-yellow-500",
      icon: "🐟",
      cardColor: "bg-white"
    },
    {
      id: 5,
      title: "PM Kisan Maan Dhan Yojana",
      description: "Pension scheme for small and marginal farmers",
      image: img5,
      status: "Eligible",
      statusColor: "bg-green-500",
      icon: "👨‍🌾",
      cardColor: "bg-yellow-400"
    },
    {
      id: 6,
      title: "PM Matsya Sampada Yojana",
      description: "Support for fisheries and aquaculture",
      image: img6,
      status: "Needs Verification",
      statusColor: "bg-yellow-500",
      icon: "🐟",
      cardColor: "bg-white"
    },  
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-16 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        
        <style>{`
          @keyframes dataFlow {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes dataPacket1 {
            0% { left: -20px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: calc(100% + 20px); opacity: 0; }
          }
          
          @keyframes dataPacket2 {
            0% { left: -25px; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { left: calc(100% + 25px); opacity: 0; }
          }
          
          @keyframes dataPacket3 {
            0% { left: -15px; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: calc(100% + 15px); opacity: 0; }
          }
        `}</style>
        
        {/* Header Section */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Smart PM <span style={{ color: '#FACC15' }}>Yojana</span> Matching
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyses your land records to recommend government schemes tailored to your needs.
          </p>
        </div>

        {/* Process Steps */}
        <div 
          className={`relative mb-16 transition-all duration-1000 delay-300 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Connecting Lines with Data Transfer Animation */}
          <div className="hidden md:block absolute top-8 left-0 w-full">
            {/* Background Line */}
            <div className="absolute left-[16.66%] right-[16.66%] top-0 h-1 bg-gray-200 rounded-full"></div>
            
            {/* Animated Data Stream */}
            <div className="absolute left-[16.66%] right-[16.66%] top-0 h-1 bg-gray-200 rounded-full overflow-hidden">
              {/* Primary Data Flow */}
              <div 
                className={`absolute top-0 h-full rounded-full transition-all duration-1000 ${
                  isVisible ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(90deg, #FACC15 0%, #F59E0B 50%, #FACC15 100%)',
                  animation: isVisible ? 'dataFlow 2.5s infinite linear' : 'none'
                }}
              ></div>
              
              {/* Data Packets */}
              <div 
                className={`absolute top-0 h-full w-4 rounded-full ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #FACC15 50%, transparent 100%)',
                  animation: isVisible ? 'dataPacket1 3s infinite linear' : 'none',
                  boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)'
                }}
              ></div>
              
              <div 
                className={`absolute top-0 h-full w-6 rounded-full ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #F59E0B 50%, transparent 100%)',
                  animation: isVisible ? 'dataPacket2 3s infinite linear 1s' : 'none',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)'
                }}
              ></div>
              
              <div 
                className={`absolute top-0 h-full w-3 rounded-full ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #FACC15 50%, transparent 100%)',
                  animation: isVisible ? 'dataPacket3 3s infinite linear 2s' : 'none',
                  boxShadow: '0 0 6px rgba(250, 204, 21, 0.8)'
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="text-center">
              <div className={`bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Patta Upload</h3>
              <p className="text-gray-600">Securely upload your land document.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className={`bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 delay-1000 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">System analyses for key details.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className={`bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 delay-2000 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scheme Recommendation</h3>
              <p className="text-gray-600">Receive personalized scheme list.</p>
            </div>
          </div>
        </div>

        {/* Recommended Yojanas Title */}
        <div 
          className={`text-center mb-12 transition-all duration-1000 delay-500 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
        </div>

        {/* Yojana Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yojanas.map((yojana, index) => (
            <div 
              key={yojana.id}
              className={`${yojana.cardColor} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-105 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${700 + index * 200}ms`
              }}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{yojana.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">
                        {yojana.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {yojana.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="rounded-lg overflow-hidden mb-4 shadow-md">
                  <img 
                    src={yojana.image} 
                    alt={yojana.title}
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Status Badge */}
                <div className="flex justify-start">
                  <span className={`${yojana.statusColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                    {yojana.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Yojana;