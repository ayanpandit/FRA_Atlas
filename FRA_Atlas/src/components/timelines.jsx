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
      quarter: 'Q4 2024',
      title: 'AI-Powered Verification',
      status: 'current'
    },
    {
      quarter: 'Q1 2025',
      title: 'Blockchain Integration',
      status: 'upcoming'
    },
    {
      quarter: 'Q2 2025',
      title: '3D Interactive Maps',
      status: 'future'
    }
  ];

  return (
  <div ref={containerRef} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Shaping the Future of Land Data
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The journey doesn't end here. We are constantly innovating to make land data more 
            intelligent, interactive, and integrated. Explore our roadmap to see how we're planning to 
            introduce new features that will further revolutionize land management.
          </p>
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
                          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm w-full">
                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#FACC15' }}>
                              {item.quarter}
                            </h3>
                            <p className="text-lg text-gray-700 font-medium">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Side Card (Odd indices - 1, 3, 5...) */}
                      <div className="flex justify-start">
                        {index % 2 !== 0 && (
                          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm w-full">
                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#FACC15' }}>
                              {item.quarter}
                            </h3>
                            <p className="text-lg text-gray-700 font-medium">
                              {item.title}
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
                      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#FACC15' }}>
                          {item.quarter}
                        </h3>
                        <p className="text-base text-gray-700 font-medium">
                          {item.title}
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