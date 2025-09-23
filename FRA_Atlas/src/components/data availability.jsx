import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, MapPin, TrendingUp, Users, Globe, Shield } from 'lucide-react';
import mapImage from '../assets/states-map.jpg';
import impactImage from '../assets/back3.jpg';
import './data-availability.css';

const Data_Availability = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    verifiedPattas: 0,
    mappedBoundaries: 0,
    statesCovered: 0,
    recordsDigitized: 0,
    accuracyRate: 0
  });
  
  const sectionRef = useRef(null);
  const impactRef = useRef(null);
  const [impactVisible, setImpactVisible] = useState(false);

  // Animation function for counting numbers
  const animateCounter = (start, end, duration, callback) => {
    const startTime = performance.now();
    const range = end - start;
    
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (range * easeOutQuart));
      
      callback(current);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };

  // Intersection Observer for Data Availability section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          // Start counter animations with different delays
          setTimeout(() => {
            animateCounter(0, 245000, 2000, (val) => 
              setCounters(prev => ({ ...prev, verifiedPattas: val }))
            );
          }, 300);
          
          setTimeout(() => {
            animateCounter(0, 189000, 2200, (val) => 
              setCounters(prev => ({ ...prev, mappedBoundaries: val }))
            );
          }, 500);
        }
      },
      {
        threshold: 0.3,
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
  }, [isVisible]);

  // Intersection Observer for Impact section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impactVisible) {
          setImpactVisible(true);
          
          // Start impact counter animations
          setTimeout(() => {
            animateCounter(0, 5, 1500, (val) => 
              setCounters(prev => ({ ...prev, statesCovered: val }))
            );
          }, 200);
          
          setTimeout(() => {
            animateCounter(0, 250000, 2000, (val) => 
              setCounters(prev => ({ ...prev, recordsDigitized: val }))
            );
          }, 400);
          
          setTimeout(() => {
            animateCounter(0, 99.5, 1800, (val) => 
              setCounters(prev => ({ ...prev, accuracyRate: val }))
            );
          }, 600);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (impactRef.current) {
      observer.observe(impactRef.current);
    }

    return () => {
      if (impactRef.current) {
        observer.unobserve(impactRef.current);
      }
    };
  }, [impactVisible]);

  // Format number display
  const formatNumber = (num, isDecimal = false) => {
    if (isDecimal) {
      return num.toFixed(1);
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const states = [
    { name: 'Chhattisgarh', color: 'bg-emerald-600' },
    { name: 'Odisha', color: 'bg-blue-600' },
    { name: 'Maharashtra', color: 'bg-purple-600' },
    { name: 'Jharkhand', color: 'bg-orange-600' },
    { name: 'Telangana', color: 'bg-pink-600' }
  ];

  const features = [
    { icon: <Shield className="w-5 h-5" />, text: 'Blockchain Security', desc: 'Immutable record keeping' },
    { icon: <Globe className="w-5 h-5" />, text: 'Multi-language Support', desc: '12 regional languages' },
    { icon: <Users className="w-5 h-5" />, text: 'Community Verified', desc: 'Local validation process' }
  ];

  return (
    <div className="min-h-screen">
      {/* States Coverage & Data Availability Section */}
      <section ref={sectionRef} className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div 
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pan-India <span style={{ color: '#FACC15' }}>Coverage</span> & Data Analytics
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive digitization across multiple states with real-time data insights and advanced analytics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Enhanced States Coverage */}
            <div 
              className={`group transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="relative overflow-hidden">
                  <img 
                    src={mapImage} 
                    alt="States Coverage Map"
                    className="w-full h-96 sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ aspectRatio: '9/16', objectPosition: 'center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Floating Stats */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm font-semibold">Live Coverage</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                      Active States Coverage
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {states.map((state, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-2 ${state.color} text-white text-xs sm:text-sm rounded-full font-medium shadow-lg transform transition-all duration-300 hover:scale-105`}
                          style={{
                            animationDelay: `${index * 200}ms`,
                            animation: isVisible ? 'slideInUp 0.8s ease-out forwards' : 'none'
                          }}
                        >
                          {state.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Additional Features */}
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20"
                        >
                          <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                            {React.cloneElement(feature.icon, { className: "w-4 h-4 text-yellow-400" })}
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{feature.text}</p>
                            <p className="text-gray-300 text-xs">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Data Availability */}
            <div 
              className={`space-y-6 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="mb-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3" style={{ color: '#FACC15' }} />
                  Real-time Data Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Live insights from our comprehensive database with automated validation and continuous monitoring
                </p>
              </div>
              
              {/* Enhanced Data Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="text-base font-semibold">Verified Patta Records</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FACC15' }}></div>
                      <span className="text-xs text-gray-300">Live</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#FACC15' }}>
                    {formatNumber(counters.verifiedPattas)}+
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    <span className="text-green-400">↗ +12.5%</span> this month
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-base font-semibold">Mapped Boundaries</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-300">Active</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#FACC15' }}>
                    {formatNumber(counters.mappedBoundaries)}+
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    <span className="text-green-400">↗ +8.3%</span> this quarter
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-gray-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold" style={{ color: '#FACC15' }}>98.7%</div>
                    <div className="text-sm text-gray-600">Validation Rate</div>
                  </div>
                  <div className="bg-white border-2 border-gray-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-2xl font-bold" style={{ color: '#FACC15' }}>24/7</div>
                    <div className="text-sm text-gray-600">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Impact & Vision Section */}
      <section 
        ref={impactRef}
        className="relative py-16 sm:py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${impactImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <div 
              className={`transition-all duration-1000 ${
                impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Transforming <span style={{ color: '#FACC15' }}>Tribal Governance</span> with Technology
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 sm:mb-10">
                We are revolutionizing tribal land governance through cutting-edge AI and blockchain technology. 
                Our platform enables transparent, efficient, and data-driven decision making that empowers 
                thousands of tribal families across India. Together, we're building a more inclusive and 
                technologically advanced future for forest land management and community development.
              </p>
            </div>
            
            {/* Enhanced Impact Stats */}
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-1000 delay-500 ${
                impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
            >
              <div className="text-center sm:text-left bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#FACC15' }}>
                  {counters.statesCovered}+
                </div>
                <div className="text-sm sm:text-base text-gray-300 font-medium">States Covered</div>
                <div className="text-xs text-gray-400 mt-1">Pan-India Presence</div>
              </div>
              
              <div className="text-center sm:text-left bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#FACC15' }}>
                  {formatNumber(counters.recordsDigitized)}+
                </div>
                <div className="text-sm sm:text-base text-gray-300 font-medium">Records Digitized</div>
                <div className="text-xs text-gray-400 mt-1">Growing Daily</div>
              </div>
              
              <div className="text-center sm:text-left bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#FACC15' }}>
                  {formatNumber(counters.accuracyRate, true)}%
                </div>
                <div className="text-sm sm:text-base text-gray-300 font-medium">Accuracy Rate</div>
                <div className="text-xs text-gray-400 mt-1">AI-Powered Precision</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SVG Wave Pattern at Bottom for Smooth Transition */}
        <div className="absolute left-0 right-0 bottom-0 w-full overflow-hidden pointer-events-none" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100vw', height: '120px', display: 'block' }}>
            <path fill="#F0F1C5" fillOpacity="1" d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

    </div>
  );
};

// Import animation styles
import './data-availability.css';

export default Data_Availability;