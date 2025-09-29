import { Timeline } from 'gsap/gsap-core';
import React, { useState, useEffect, useRef } from 'react';

const Timelines = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !timelineRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const timelineRect = timelineRef.current.getBoundingClientRect();
      
      // Calculate when timeline section is in view
      const viewportHeight = window.innerHeight;
      const sectionTop = containerRect.top;
      const sectionHeight = containerRect.height;
      
      // Start animation when section is 20% visible from bottom
      const triggerPoint = viewportHeight * 0.8;
      const endPoint = -sectionHeight * 0.2;
      
      if (sectionTop <= triggerPoint && sectionTop >= endPoint) {
        const progress = Math.max(0, Math.min(1, (triggerPoint - sectionTop) / (triggerPoint - endPoint)));
        setScrollProgress(progress);
      } else if (sectionTop < endPoint) {
        setScrollProgress(1);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    // Smooth animation for the yellow line
    let animationFrame;
    const animate = () => {
      setAnimatedProgress(prev => {
        const speed = 0.08; // Lower = slower, higher = faster
        return prev + (scrollProgress - prev) * speed;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [scrollProgress]);

  const roadmapItems = [
    {
      quarter: 'PHASE 1',
      title: 'DATA FOUNDATION AND CORE-AI SETUP',
      description: 'This foundational phase converts paper records into digital assets. We use OCR and NER models to extract and structure data from historical FRA claims. Simultaneously, we gather initial geospatial layers, set up the database, and establish the core AI-processed digital archive and geocoded repository necessary for all subsequent mapping and decision-making processes.',
      status: 'current'
    },
    {
      quarter: 'PHASE 2',
      title: 'DSS-VALUE CHAIN AND MOBILE-FIRST INTEGRATION',
      description: 'The focus shifts to economic empowerment and community transparency. We develop the advanced Value Chain DSS by integrating market and VDVK data to recommend profitable MFP strategies for CR holders. Concurrently, we launch the Mobile-First App, enabling Gram Sabha members to geotag boundaries and report grievances, ensuring data is validated from the bottom-up.',
      status: 'upcoming'
    },
    {
      quarter: 'PHASE 3',
      title: 'REAL-TIME MONITORING and STRATEGIC SCALABILITY',
      description: 'This final phase achieves proactive governance and long-term sustainability. We integrate SAR and time-series analysis to build the Real-Time Encroachment Alert System for CFR areas. We also integrate strategic data like Soil Health and Topography to refine DAJGUA recommendations, completing the platform evolution into a robust, national-scale solution.',
      status: 'future'
    }
  ];

  return (
  <div
    ref={containerRef}
    className="min-h-screen py-36 px-4 sm:px-6 lg:px-8 relative"
    style={{
      backgroundImage: 'url(/timeline-bg.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-16 px-2 md:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-200 mb-4 md:mb-0 text-left">
                <span className='text-2xl text-[#a8aa97]'>SHAPING</span>
                <br className='hidden md:block' /> THE FUTURE
              </h1>
            </div>
            <div>
              <p className="text-lg md:text-base text-gray-300 max-w-xl md:ml-auto text-left leading-relaxed">
                The journey doesn't end here. We are constantly innovating to make land data more intelligent, interactive, and integrated. Explore our roadmap to see how we're planning to introduce new features that will further revolutionize land management.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div ref={timelineRef} className="relative">
          {/* Vertical Line - Desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-0.5 w-1 h-full z-0">
            {/* Background white line */}
            <div className="w-full h-full bg-gray-200"></div>
            {/* Animated yellow line */}
            <div 
              className="absolute top-0 left-0 w-full"
              style={{ 
                backgroundColor: '#FACC15',
                height: `${animatedProgress * 100}%`,
                transition: 'height 0.2s cubic-bezier(0.4,0,0.2,1)'
              }}
            ></div>
          </div>

          {/* Mobile Timeline Line */}
          <div className="md:hidden absolute left-8 w-1 h-full z-0">
            {/* Background white line */}
            <div className="w-full h-full bg-gray-200"></div>
            {/* Animated yellow line */}
            <div 
              className="absolute top-0 left-0 w-full"
              style={{ 
                backgroundColor: '#FACC15',
                height: `${animatedProgress * 100}%`,
                transition: 'height 0.2s cubic-bezier(0.4,0,0.2,1)'
              }}
            ></div>
          </div>

          <div className="space-y-16 md:space-y-20">
            {roadmapItems.map((item, index) => {
              // Calculate if this dot should be yellow based on scroll progress
              const dotProgress = (index + 1) / roadmapItems.length;
              const isDotActive = animatedProgress >= dotProgress;
              
              return (
                <div key={index} className="relative">
                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-2 gap-8 items-center relative">
                      {/* Left Side Card (Even indices - 0, 2, 4...) */}
                      <div className="flex justify-end">
                        {index % 2 === 0 && (
                          <div className="border-2 group border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-xl w-full" style={{background: 'linear-gradient(135deg, #f6ffb2 0%, #ffffff 100%)'}}>
                            <h3 className="text-2xl font-bold mb-3 text-[#4e5425]">
                              {item.quarter}
                            </h3>
                            <div>
                              <p className="text-lg text-gray-700 font-medium mb-6 relative">
                                {item.title}
                                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#3e4130] rounded transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
                              </p>
                            </div>
                            <p className="text-base leading-tight text-[#525e11]">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Side Card (Odd indices - 1, 3, 5...) */}
                      <div className="flex justify-start">
                        {index % 2 !== 0 && (
                          <div className="border-2 group border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-xl w-full" style={{background: 'linear-gradient(135deg, #f6ffb2 0%, #ffffff 100%)'}}>
                            <h3 className="text-2xl font-bold mb-3 text-[#4e5425]">
                              {item.quarter}
                            </h3>
                            <div>
                              <p className="text-lg text-gray-700 font-medium mb-6 relative">
                                {item.title}
                                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#313325] rounded transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
                              </p>
                            </div>
                            <p className="text-base leading-tight text-[#67770a]">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Center Dot - Perfectly centered on the line */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div 
                          className="w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-500 ease-out" 
                          style={{ 
                            backgroundColor: isDotActive ? '#FACC15' : '#ffffff',
                            borderColor: isDotActive ? '#FACC15' : '#e5e7eb'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden flex items-start">
                    {/* Circle - Precisely on the line */}
                    <div className="relative z-10 flex items-center justify-center mt-2 mr-6">
                      <div 
                        className="w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-500 ease-out" 
                        style={{ 
                          backgroundColor: isDotActive ? '#FACC15' : '#ffffff',
                          borderColor: isDotActive ? '#FACC15' : '#e5e7eb'
                        }}
                      ></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="border-2 border-gray-100 rounded-2xl p-6 shadow-lg max-w-xl w-full" style={{background: 'linear-gradient(135deg, #f6ffb2 0%, #ffffff 100%)'}}>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#FACC15' }}>
                          {item.quarter}
                        </h3>
                        <div className="group">
                          <p className="text-base text-gray-700 font-medium mb-2 relative">
                            {item.title}
                            <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#FACC15] rounded transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timelines;