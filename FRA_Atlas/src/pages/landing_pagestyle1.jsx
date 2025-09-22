import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const FRAAtlasLanding = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [satelliteLayer, setSatelliteLayer] = useState('truecolor');
  const [schemeHover, setSchemeHover] = useState(null);
  const [stats, setStats] = useState({
    pattasVerified: 0,
    villagesCovered: 0,
    beneficiaries: 0,
    accuracy: 0
  });

  // 3D Globe Component
  const AnimatedGlobe = () => {
    const meshRef = useRef();
    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      }
    });

    return (
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    );
  };

  // Satellite Layer Component
  const SatelliteViewer = () => {
    const layers = {
      truecolor: 'bg-gradient-to-br from-blue-400 to-green-400',
      falsecolor: 'bg-gradient-to-br from-red-400 to-purple-400',
      ndvi: 'bg-gradient-to-br from-red-500 via-yellow-500 to-green-500',
      ndwi: 'bg-gradient-to-br from-blue-300 via-cyan-400 to-blue-600'
    };

    return (
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 ${layers[satelliteLayer]} transition-all duration-1000`}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"></div>
          {/* Feature points */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* Layer controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
          {Object.keys(layers).map(layer => (
            <button
              key={layer}
              onClick={() => setSatelliteLayer(layer)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                satelliteLayer === layer 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {layer.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // PM Yojanas Data
  const pmYojanas = [
    {
      id: 'pm-kisan',
      name: 'PM-Kisan Samman Nidhi',
      icon: '💰',
      description: 'Income support for farmers',
      eligibility: 'Land ownership, cultivation status',
      beneficiaries: '12+ crore farmers'
    },
    {
      id: 'jal-jeevan',
      name: 'Jal Jeevan Mission',
      icon: '💧',
      description: 'Tap water to every household',
      eligibility: 'Rural households, water scarcity areas',
      beneficiaries: '18+ crore households'
    },
    {
      id: 'mgnrega',
      name: 'MGNREGA',
      icon: '🏗️',
      description: 'Employment guarantee scheme',
      eligibility: 'Rural adults, unskilled labor',
      beneficiaries: '15+ crore workers'
    },
    {
      id: 'pm-awas',
      name: 'PM Awas Yojana',
      icon: '🏠',
      description: 'Housing for all',
      eligibility: 'Economically weaker sections',
      beneficiaries: '3+ crore houses'
    },
    {
      id: 'fasal-bima',
      name: 'PM Fasal Bima Yojana',
      icon: '🛡️',
      description: 'Crop insurance scheme',
      eligibility: 'Farmers with insurable crops',
      beneficiaries: '8+ crore farmers'
    },
    {
      id: 'soil-health',
      name: 'Soil Health Card',
      icon: '🧪',
      description: 'Soil nutrient management',
      eligibility: 'All landholding farmers',
      beneficiaries: '22+ crore cards'
    }
  ];

  // Impact Statistics Animation
  useEffect(() => {
    const targetStats = {
      pattasVerified: 1250,
      villagesCovered: 67,
      beneficiaries: 18450,
      accuracy: 98.7
    };

    const duration = 3000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        pattasVerified: Math.floor(targetStats.pattasVerified * progress),
        villagesCovered: Math.floor(targetStats.villagesCovered * progress),
        beneficiaries: Math.floor(targetStats.beneficiaries * progress),
        accuracy: Math.floor(targetStats.accuracy * progress)
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Responsive Design Detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll Animation Handler
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'problem', 'solution', 'recommendation', 'yojanas', 'satellite', 'blockchain', 'impact', 'cta'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">FRA</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FRA Atlas
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Solutions', 'Yojanas', 'Impact', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-indigo-400/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered FRA Atlas
                </span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl text-gray-600">
                  Smarter Land Rights & PM Yojana Recommendations
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
                Empowering patta holders and government officers with AI, GIS, and Earth Observation 
                for transparent, data-driven forest rights management and benefit distribution.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Started Free
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                  See Live Demo
                </button>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.pattasVerified}+</div>
                  <div className="text-sm text-gray-600">Pattas Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.villagesCovered}+</div>
                  <div className="text-sm text-gray-600">Villages Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.beneficiaries.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Beneficiaries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats.accuracy}%</div>
                  <div className="text-sm text-gray-600">AI Accuracy</div>
                </div>
              </div>
            </div>

            {/* 3D Globe */}
            <div className="relative h-96 lg:h-full">
              <Canvas className="rounded-2xl">
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <AnimatedGlobe />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
              </Canvas>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Satellite Feed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transforming Forest Rights Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From manual, opaque processes to AI-driven, transparent solutions that benefit both 
              patta holders and government officers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Problem Side */}
            <div className="space-y-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-800">Manual Verification Chaos</h3>
                </div>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>Paper-based patta documents prone to damage and loss</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>Months-long verification processes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>High error rates in manual data entry</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-800">Benefit Distribution Gaps</h3>
                </div>
                <ul className="space-y-2 text-orange-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-orange-500">•</span>
                    <span>Eligible beneficiaries miss out on PM Yojanas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-orange-500">•</span>
                    <span>No scientific basis for scheme recommendations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-orange-500">•</span>
                    <span>Lack of transparency in benefit allocation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Solution Side */}
            <div className="space-y-8">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-800">AI-Powered Automation</h3>
                </div>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">•</span>
                    <span>OCR technology digitizes pattas in seconds</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">•</span>
                    <span>AI verification with 98.7% accuracy</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">•</span>
                    <span>Real-time status tracking</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📡</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Data-Driven Recommendations</h3>
                </div>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Satellite-based land health analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Smart matching with PM Yojana criteria</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Transparent eligibility scoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Level Recommendation Section */}
      <section id="recommendation" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Intelligent Recommendation Engine
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI-powered suggestions at both individual and community levels for maximum impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Individual Level */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span className="text-3xl">👤</span>
                  <span>Individual Patta Holder Level</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🌾</span>
                  </div>
                  <div>
                    <div className="font-semibold">Ramesh Kumar</div>
                    <div className="text-sm text-gray-600">2.5 acres • Mixed Farming</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Recommended Schemes:</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="font-medium">PM-Kisan Samman Nidhi</span>
                      <span className="text-green-600 text-sm">95% Match</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="font-medium">Soil Health Card</span>
                      <span className="text-blue-600 text-sm">88% Match</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="font-medium">PM Fasal Bima</span>
                      <span className="text-purple-600 text-sm">82% Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Level */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span className="text-3xl">🏘️</span>
                  <span>Community Level</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🗺️</span>
                  </div>
                  <div>
                    <div className="font-semibold">Bhopal Forest Division</div>
                    <div className="text-sm text-gray-600">247 Pattas • 1847 Beneficiaries</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Priority Schemes:</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="font-medium">Watershed Development</span>
                      <span className="text-yellow-600 text-sm">High Priority</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-indigo-50 rounded">
                      <span className="font-medium">Afforestation Program</span>
                      <span className="text-indigo-600 text-sm">Medium Priority</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="font-medium">Skill Development</span>
                      <span className="text-red-600 text-sm">Medium Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PM Yojanas Section */}
      <section id="yojanas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integrated PM Yojanas
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Seamlessly integrated government schemes with AI-powered eligibility matching
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pmYojanas.map((scheme, index) => (
              <div
                key={scheme.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setSchemeHover(scheme.id)}
                onMouseLeave={() => setSchemeHover(null)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
                    {scheme.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{scheme.name}</h3>
                    <p className="text-sm text-gray-600">{scheme.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Eligibility:</span>
                    <span className="font-medium">{scheme.eligibility}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Beneficiaries:</span>
                    <span className="font-medium text-green-600">{scheme.beneficiaries}</span>
                  </div>
                </div>

                {/* Hover effect */}
                {schemeHover === scheme.id && (
                  <div className="absolute inset-0 bg-blue-600/10 rounded-2xl border-2 border-blue-400 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Satellite Imagery Section */}
      <section id="satellite" className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Satellite Analysis
            </h2>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              Real-time earth observation data powered by Google Earth Engine and Sentinel-2
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SatelliteViewer />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span>🌿</span>
                  <span>NDVI - Vegetation Health</span>
                </h3>
                <p className="text-blue-200">
                  Normalized Difference Vegetation Index measures plant health and density. 
                  Values from -1 to 1 indicate vegetation quality.
                </p>
                <div className="mt-4 flex space-x-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span>💧</span>
                  <span>NDWI - Water Content</span>
                </h3>
                <p className="text-blue-200">
                  Normalized Difference Water Index detects water bodies and moisture content 
                  in vegetation and soil.
                </p>
                <div className="mt-4 flex space-x-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-gray-500 via-blue-400 to-blue-600 h-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span>🛰️</span>
                  <span>Live Satellite Integration</span>
                </h3>
                <p className="text-blue-200">
                  Real-time data from multiple satellite sources including Sentinel-2, 
                  Landsat 8, and MODIS for comprehensive land monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Transparency Section */}
      <section id="blockchain" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Blockchain-Powered Transparency
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Immutable records and transparent transactions using blockchain technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span className="text-2xl">🔒</span>
                  <span>Tamper-Proof Records</span>
                </h3>
                <p className="text-gray-700">
                  Every patta verification and scheme recommendation is recorded on an 
                  immutable blockchain ledger, ensuring complete transparency and auditability.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <span>Real-Time Audit Trail</span>
                </h3>
                <p className="text-gray-700">
                  Complete transaction history with timestamps and digital signatures 
                  for every action taken in the system.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <span className="text-2xl">👥</span>
                  <span>Multi-Stakeholder Access</span>
                </h3>
                <p className="text-gray-700">
                  Government officers, patta holders, and auditors can access verified 
                  records with appropriate permission levels.
                </p>
              </div>
            </div>

            <div className="relative">
              {/* Blockchain Visualization */}
              <div className="bg-gray-900 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold mb-2">Live Blockchain Ledger</h4>
                  <div className="text-green-400 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Synced & Secure</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { hash: '0x1a2b...c3d4', action: 'Patta Verified', user: 'Officer_001', time: '2 min ago' },
                    { hash: '0x3e4f...g5h6', action: 'Scheme Recommended', user: 'AI_Engine', time: '5 min ago' },
                    { hash: '0x7i8j...k9l0', action: 'Document Uploaded', user: 'Holder_045', time: '10 min ago' }
                  ].map((block, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 border-l-4 border-green-500">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono">{block.hash}</span>
                        <span className="text-gray-400">{block.time}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>{block.action}</span>
                        <span className="text-blue-400">{block.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Measurable Impact
            </h2>
            <p className="text-lg text-indigo-200 max-w-3xl mx-auto">
              Transforming forest rights management across multiple states and communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.pattasVerified}+</div>
              <div className="text-indigo-200">Pattas Digitized</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.villagesCovered}+</div>
              <div className="text-indigo-200">Villages Covered</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.beneficiaries.toLocaleString()}+</div>
              <div className="text-indigo-200">Beneficiaries Reached</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold mb-2">{stats.accuracy}%</div>
              <div className="text-indigo-200">AI Accuracy Rate</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Implementation Timeline</h3>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {[
                { phase: 'Pilot Launch', date: 'Jan 2024', status: 'Completed' },
                { phase: 'State Expansion', date: 'Mar 2024', status: 'In Progress' },
                { phase: 'National Rollout', date: 'Jun 2024', status: 'Upcoming' },
                { phase: 'AI Enhancement', date: 'Dec 2024', status: 'Planned' }
              ].map((item, index) => (
                <div key={index} className="text-center flex-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold">{item.phase}</div>
                  <div className="text-indigo-200 text-sm">{item.date}</div>
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                    item.status === 'Completed' ? 'bg-green-500' :
                    item.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Forest Rights Management?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of government officers and patta holders already using FRA Atlas 
            for transparent, efficient, and data-driven forest rights management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              Schedule Demo
            </button>
          </div>
          
          <div className="text-blue-200 text-sm">
            🚀 No credit card required • 14-day free trial • Setup in 5 minutes
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FRA</span>
                </div>
                <span className="text-xl font-bold">FRA Atlas</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered platform for transparent forest rights management and PM Yojana recommendations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>contact@fratlas.gov.in</li>
                <li>+91 1800-XXX-XXXX</li>
                <li>New Delhi, India</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 FRA Atlas. Built for the Ministry of Tribal Affairs, Government of India.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FRAAtlasLanding;