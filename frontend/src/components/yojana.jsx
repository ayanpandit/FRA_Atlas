// src/components/Yojana.jsx
import React, { useState, useEffect, useRef } from "react";
import img1 from "/pmsamman.jpg";
import img2 from "/pmfasal.jpg";
import img3 from "/pmkrishi.webp";
import img4 from "/pmmatsya.jpg";
import img5 from "/pmsichai.webp";
import img6 from "/pmsampda.jpg";

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
        threshold: 0.2,
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
      title: "PM KISAN SAMMAN NIDHI",
      heading: "Direct income support for small farmers",
      description: "This scheme provides direct financial assistance to small and marginal farmers across India. Eligible farmers receive regular income support to help with agricultural expenses, improve their livelihoods, and ensure food security for their families. The scheme is designed to reduce rural poverty and empower farmers to invest in better farming practices. Timely payments and easy application make it accessible to millions.",
      image: img1
    },
    {
      id: 2,
      title: "PM FASAL BIMA YOJANA",
      heading: "Insurance for crops against natural disasters",
      description: "PM Fasal Bima Yojana offers comprehensive crop insurance to farmers, protecting them from losses due to natural calamities like drought, flood, and pests. The scheme covers a wide range of crops and ensures quick claim settlements. It aims to stabilize farmer incomes, encourage risk management, and promote sustainable agriculture. Affordable premiums and government support make it widely accessible.",
      image: img2
    },
    {
      id: 3,
      title: "PM KRISHI SINCHAI YOJANA",
      heading: "Irrigation support to boost productivity",
      description: "This scheme focuses on improving irrigation infrastructure and water management for farmers. It provides financial and technical support for building canals, wells, and micro-irrigation systems. The goal is to increase crop yields, reduce water wastage, and promote efficient farming. Farmers benefit from better access to water resources and training in modern irrigation techniques.",
      image: img3
    },
    {
      id: 4,
      title: "PM MATSYA SAMPADA YOJANA",
      heading: "Support for fisheries and aquaculture",
      description: "PM Matsya Sampada Yojana is designed to boost fisheries and aquaculture in India. It offers financial aid for fish farmers, infrastructure development, and market access. The scheme aims to increase fish production, create jobs, and improve the income of fishing communities. Training and technology adoption are key components, making the sector more competitive and sustainable.",
      image: img4
    },
    {
      id: 5,
      title: "PM KISAN MAAN DHAN YOJANA",
      heading: "Pension scheme for marginal farmers",
      description: "This pension scheme provides social security to small and marginal farmers after retirement. Eligible farmers receive a monthly pension, helping them maintain a stable income in old age. The scheme encourages long-term savings and financial planning, reducing vulnerability and improving the quality of life for rural families. Simple enrollment and government backing ensure wide coverage.",
      image: img5
    },
    {
      id: 6,
      title: "PM MATSYA SAMPADA YOJANA",
      heading: "Aquaculture and fisheries development",
      description: "This scheme supports the development of aquaculture and fisheries through financial grants, infrastructure upgrades, and training. It aims to increase fish production, improve market linkages, and enhance the livelihoods of fish farmers. The scheme also focuses on sustainable practices and environmental conservation, making fisheries a viable and profitable sector for rural communities.",
      image: img6
    },  
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-12 xs:py-16 sm:py-20 md:py-28 lg:py-32 xl:py-36 px-3 xs:px-4 sm:px-6 md:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4">
        
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
          className={`text-center mb-12 xs:mb-14 sm:mb-16 md:mb-20 lg:mb-24 transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 xs:mb-4 px-2">
            SMART <span
              className="bg-gradient-to-r from-[#FF9933] via-blue-300 to-[#138808] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >YOJANA</span> CONNECT
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Our AI analyses your land records to recommend government schemes tailored to your needs.
          </p>
        </div>

        {/* Process Steps */}
        <div 
          className={`relative mb-10 xs:mb-12 sm:mb-14 md:mb-16 lg:mb-16 xl:mb-16 transition-all duration-1000 delay-300 ${
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 relative z-10">
            {/* Step 1 */}
            <div className="text-center px-2">
              <div className={`bg-yellow-100 w-14 h-14 xs:w-16 xs:h-16 rounded-lg flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2">Patta Upload</h3>
              <p className="text-sm xs:text-base text-gray-600">Securely upload your land document.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center px-2">
              <div className={`bg-yellow-100 w-14 h-14 xs:w-16 xs:h-16 rounded-lg flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 delay-1000 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm xs:text-base text-gray-600">System analyses for key details.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center px-2">
              <div className={`bg-yellow-100 w-14 h-14 xs:w-16 xs:h-16 rounded-lg flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-lg border-2 border-yellow-200 transition-all duration-500 delay-2000 ${
                isVisible ? 'animate-pulse' : ''
              }`}>
                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2">Scheme Recommendation</h3>
              <p className="text-sm xs:text-base text-gray-600">Receive personalized scheme list.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 xs:gap-6 sm:gap-7 md:gap-8">
          {yojanas.map((yojana, index) => (
            <div 
              key={yojana.id}
              className={`bg-white/25 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-105 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8">
                <div className="mb-3 xs:mb-4 group">
                  <h4 className="font-bold text-[#607100] text-lg xs:text-xl sm:text-xl md:text-xl leading-tight uppercase">
                    {yojana.title}
                  </h4>
                  <div>
                    <p className="text-sm xs:text-base sm:text-base text-[#4e5c02] font-semibold mt-2 mb-2 relative">
                      {yojana.heading}
                      <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#b49f00] rounded transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
                    </p>
                  </div>
                  <p className="text-gray-600 text-xs xs:text-sm sm:text-sm mt-1 leading-relaxed">
                    {yojana.description}
                  </p>
                </div>

                {/* Image */}
                <div className="rounded-lg overflow-hidden mb-4 xs:mb-5 sm:mb-6 shadow-md">
                  <img 
                    src={yojana.image} 
                    alt={yojana.title}
                    className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Status Badge removed */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Yojana;