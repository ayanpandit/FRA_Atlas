import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Shield, MapPin, Brain, FileText, Users, Zap } from 'lucide-react';
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';
import img6 from '../assets/6.png';


const States = () => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef();
  const startTimeRef = useRef(Date.now());

  const features = [
    {
      id: 1,
      title: "OCR + NER Technology",
      description: "Advanced Optical Character Recognition combined with Named Entity Recognition to digitize paper FRA pattas with 99.5% accuracy.",
      image: img1,
      icon: <FileText className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: 2,
      title: "WebGIS Mapping",
      description: "Interactive geographic mapping system that visualizes forest land boundaries and patta locations in real-time.",
      image: img2,
      icon: <MapPin className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      title: "AI-Powered Verification",
      description: "Machine learning algorithms verify patta authenticity and match holders with eligible government schemes automatically.",
      image: img3,
      icon: <Brain className="w-8 h-8" />,
      color: "from-teal-500 to-cyan-600"
    },
    {
      id: 4,
      title: "Secure Digital Storage",
      description: "Blockchain-backed secure storage ensures tamper-proof records with multi-layer encryption and backup systems.",
      image: img4,
      icon: <Shield className="w-8 h-8" />,
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 5,
      title: "Beneficiary Management",
      description: "Comprehensive system to track, manage and notify patta holders about available schemes and benefits.",
      image: img5,
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 6,
      title: "Real-time Processing",
      description: "Lightning-fast document processing and instant verification with live updates and notifications.",
      image: img6,
      icon: <Zap className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-600"
    }
  ];

  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      const rotationSpeed = 0.02; // Adjust this for speed (lower = slower, higher = faster)
      
      setRotation(elapsed * rotationSpeed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    
    <section 
      className="relative min-h-screen py-20 overflow-hidden flex items-center justify-center"
    >
     <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2" style={{ marginTop: '1em' }}>
            Our <span style={{ color: '#FACC15' }}>Reach</span> Across India
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4">
            Currently, our platform is live and providing verified data in the following states. We are continuously expanding to cover more regions, ensuring every record is digitized and accessible
          </p>
        </div>

        {/* 3D Moving Cards Container */}
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] mb-16">
          <div className="absolute inset-0 flex items-center justify-center">
            {features.map((feature, index) => {
              const angle = (index * 60) + rotation;
              
              // Responsive radius
              const baseRadius = window.innerWidth < 640 ? 180 : 
                                window.innerWidth < 768 ? 220 :
                                window.innerWidth < 1024 ? 280 : 350;
              
              const x = Math.cos((angle * Math.PI) / 180) * baseRadius;
              const z = Math.sin((angle * Math.PI) / 180) * baseRadius;
              
              // Enhanced scale calculation for smoother transitions
              const normalizedZ = (z + baseRadius) / (2 * baseRadius);
              const scale = 0.6 + normalizedZ * 0.6; // Bigger cards: 0.6 to 1.2
              const opacity = 0.4 + normalizedZ * 0.6;
              
              // Card size based on screen size
              const cardSize = window.innerWidth < 640 ? 'w-72 h-72' : 
                              window.innerWidth < 768 ? 'w-80 h-80' :
                              window.innerWidth < 1024 ? 'w-96 h-96' : 'w-[450px] h-[450px]';
              
              return (
                <div
                  key={feature.id}
                  className="absolute will-change-transform"
                  style={{
                    transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
                    zIndex: Math.round(z + baseRadius),
                    opacity: opacity,
                    transition: 'none' // Remove transitions for smooth continuous movement
                  }}
                >
                  <div className={`relative ${cardSize} bg-transparent`}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        style={{
                          filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default States;