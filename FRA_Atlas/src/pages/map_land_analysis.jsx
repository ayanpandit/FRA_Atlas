import React, { useState, useRef, useEffect } from 'react';

const Map_Land_Analysis = () => {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [activeTab, setActiveTab] = useState('ndvi');
  const [showLayers, setShowLayers] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]);
  const [activeLayers, setActiveLayers] = useState({
    boundaries: true,
    ndvi: false,
    ndwi: false,
    soil: false,
    rainfall: false,
    irrigation: false
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const mapRef = useRef(null);

  // Enhanced plot data with more realistic information
  const plotData = [
    {
      id: 'FRA001',
      coordinates: [23.2599, 77.4126],
      holderName: 'Ramesh Kumar',
      landSize: '2.5 acres',
      cropType: 'Mixed Farming',
      ndvi: 0.72,
      ndwi: 0.34,
      soilType: 'Red Soil',
      lastUpdated: '2024-01-15',
      healthScore: 8.2,
      boundary: [[23.2590, 77.4120], [23.2608, 77.4120], [23.2608, 77.4132], [23.2590, 77.4132]],
      elevation: '450m',
      slope: '2°',
      vegetation: 'Dense'
    },
    {
      id: 'FRA002',
      coordinates: [23.2650, 77.4200],
      holderName: 'Sunita Devi',
      landSize: '1.8 acres',
      cropType: 'Vegetable Farming',
      ndvi: 0.45,
      ndwi: 0.12,
      soilType: 'Black Soil',
      lastUpdated: '2024-01-14',
      healthScore: 5.8,
      boundary: [[23.2642, 77.4192], [23.2658, 77.4192], [23.2658, 77.4208], [23.2642, 77.4208]],
      elevation: '420m',
      slope: '1°',
      vegetation: 'Sparse'
    },
    {
      id: 'FRA003',
      coordinates: [23.2550, 77.4150],
      holderName: 'Mohan Singh',
      landSize: '3.2 acres',
      cropType: 'Forest Plantation',
      ndvi: 0.84,
      ndwi: 0.56,
      soilType: 'Alluvial Soil',
      lastUpdated: '2024-01-16',
      healthScore: 9.1,
      boundary: [[23.2540, 77.4140], [23.2560, 77.4140], [23.2560, 77.4160], [23.2540, 77.4160]],
      elevation: '480m',
      slope: '3°',
      vegetation: 'Very Dense'
    },
    {
      id: 'FRA004',
      coordinates: [23.2580, 77.4080],
      holderName: 'Priya Sharma',
      landSize: '1.5 acres',
      cropType: 'Organic Farming',
      ndvi: 0.68,
      ndwi: 0.28,
      soilType: 'Loamy Soil',
      lastUpdated: '2024-01-17',
      healthScore: 7.5,
      boundary: [[23.2575, 77.4075], [23.2585, 77.4075], [23.2585, 77.4085], [23.2575, 77.4085]],
      elevation: '430m',
      slope: '1°',
      vegetation: 'Moderate'
    }
  ];

  // Enhanced trend data
  const ndviTrendData = [
    { month: 'Jan', value: 0.65, year: 2024 },
    { month: 'Feb', value: 0.68, year: 2024 },
    { month: 'Mar', value: 0.72, year: 2024 },
    { month: 'Apr', value: 0.69, year: 2024 },
    { month: 'May', value: 0.58, year: 2024 },
    { month: 'Jun', value: 0.45, year: 2024 }
  ];

  const ndwiSeasonalData = [
    { season: 'Summer', current: 0.25, previous: 0.18 },
    { season: 'Monsoon', current: 0.65, previous: 0.72 },
    { season: 'Winter', current: 0.42, previous: 0.38 },
    { season: 'Post-Monsoon', current: 0.35, previous: 0.41 }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlotClick = (plot) => {
    setSelectedPlot(plot);
    if (isMobile) {
      setShowBottomPanel(true);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 5));
  };

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const getNDVIColor = (value) => {
    if (value >= 0.7) return '#16a34a'; // Green
    if (value >= 0.5) return '#ca8a04'; // Yellow
    if (value >= 0.3) return '#ea580c'; // Orange
    return '#dc2626'; // Red
  };

  const getNDWIColor = (value) => {
    if (value >= 0.5) return '#2563eb'; // Blue
    if (value >= 0.3) return '#0891b2'; // Cyan
    if (value >= 0.1) return '#7c3aed'; // Purple
    return '#6b7280'; // Gray
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return 'text-green-800 bg-green-100 border-green-200';
    if (score >= 6) return 'text-yellow-800 bg-yellow-100 border-yellow-200';
    return 'text-red-800 bg-red-100 border-red-200';
  };

  const getVegetationColor = (vegetation) => {
    switch(vegetation) {
      case 'Very Dense': return 'text-green-800 bg-green-50';
      case 'Dense': return 'text-green-700 bg-green-50';
      case 'Moderate': return 'text-yellow-700 bg-yellow-50';
      case 'Sparse': return 'text-orange-700 bg-orange-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Map & Land Analysis</h1>
              <p className="text-sm text-gray-600">GIS Integration with Satellite Data</p>
            </div>
          </div>
          
          {/* Enhanced Layer Toggle */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
                {selectedPlot ? `${selectedPlot.id} Selected` : 'No Plot Selected'}
              </div>
              <button
                onClick={() => setShowLayers(!showLayers)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>Layers</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Map Area */}
        <div className={`${isMobile ? 'w-full' : selectedPlot ? 'w-2/3' : 'w-3/4'} relative`}>
          {/* Map Container */}
          <div ref={mapRef} className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
            {/* Professional Map Background */}
            <div className="absolute inset-0 bg-blue-50">
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
                  {[...Array(400)].map((_, i) => (
                    <div key={i} className="border border-gray-200"></div>
                  ))}
                </div>
              </div>
              
              {/* Terrain features */}
              <div className="absolute top-1/4 left-1/4 w-32 h-24 bg-blue-100 rounded-full opacity-30"></div>
              <div className="absolute top-1/2 right-1/4 w-40 h-16 bg-green-100 rounded-lg opacity-20"></div>
              <div className="absolute bottom-1/3 left-1/3 w-24 h-32 bg-amber-100 rounded-full opacity-15"></div>
            </div>

            {/* Plot Boundaries and Markers */}
            {plotData.map((plot) => (
              <div key={plot.id}>
                {/* Plot Boundary */}
                {activeLayers.boundaries && (
                  <div
                    className={`absolute border-2 ${
                      selectedPlot?.id === plot.id 
                        ? 'border-blue-600 bg-blue-500/10 shadow-lg' 
                        : 'border-green-500 bg-green-500/5'
                    } hover:bg-blue-500/10 cursor-pointer transition-all duration-200 rounded-sm`}
                    style={{
                      left: `${((plot.coordinates[1] - 77.4000) / 0.03) * 100}%`,
                      top: `${((23.2800 - plot.coordinates[0]) / 0.04) * 100}%`,
                      width: '120px',
                      height: '80px',
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handlePlotClick(plot)}
                  />
                )}
                
                {/* Enhanced Plot Marker */}
                <div
                  className={`absolute w-8 h-8 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-110 shadow-lg ${
                    selectedPlot?.id === plot.id 
                      ? 'bg-blue-600 ring-4 ring-blue-100 scale-110' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  style={{
                    left: `${((plot.coordinates[1] - 77.4000) / 0.03) * 100}%`,
                    top: `${((23.2800 - plot.coordinates[0]) / 0.04) * 100}%`,
                    zIndex: selectedPlot?.id === plot.id ? 20 : 10
                  }}
                  onClick={() => handlePlotClick(plot)}
                  title={`${plot.holderName} - ${plot.id}`}
                >
                  {plot.id.slice(-2)}
                </div>
              </div>
            ))}

            {/* Enhanced Overlays */}
            {activeLayers.ndvi && (
              <div className="absolute inset-0 pointer-events-none">
                {plotData.map((plot) => (
                  <div
                    key={`ndvi-${plot.id}`}
                    className="absolute rounded-sm opacity-70"
                    style={{
                      left: `${((plot.coordinates[1] - 77.4000) / 0.03) * 100}%`,
                      top: `${((23.2800 - plot.coordinates[0]) / 0.04) * 100}%`,
                      width: '120px',
                      height: '80px',
                      backgroundColor: getNDVIColor(plot.ndvi),
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            )}

            {activeLayers.ndwi && (
              <div className="absolute inset-0 pointer-events-none">
                {plotData.map((plot) => (
                  <div
                    key={`ndwi-${plot.id}`}
                    className="absolute rounded-sm opacity-70"
                    style={{
                      left: `${((plot.coordinates[1] - 77.4000) / 0.03) * 100}%`,
                      top: `${((23.2800 - plot.coordinates[0]) / 0.04) * 100}%`,
                      width: '120px',
                      height: '80px',
                      backgroundColor: getNDWIColor(plot.ndwi),
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Enhanced Map Controls */}
            <div className="absolute top-6 right-6 flex flex-col space-y-3 z-30">
              <button
                onClick={handleZoomIn}
                className="w-12 h-12 bg-white border border-gray-300 shadow-md rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl font-semibold text-gray-700 group-hover:text-gray-900">+</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="w-12 h-12 bg-white border border-gray-300 shadow-md rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl font-semibold text-gray-700 group-hover:text-gray-900">−</span>
              </button>
              <div className="bg-white border border-gray-300 shadow-md rounded-lg px-3 py-2 text-sm font-medium text-gray-700 text-center">
                {zoomLevel}x
              </div>
            </div>

            {/* Enhanced Mobile Layer Toggle */}
            {isMobile && (
              <button
                onClick={() => setShowLayers(!showLayers)}
                className="absolute top-6 left-6 bg-white border border-gray-300 text-gray-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-md z-30 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </button>
            )}

            {/* Enhanced Legend */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg max-w-xs">
              <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Legend
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-700">Forest Land Plots</span>
                </div>
                {activeLayers.ndvi && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getNDVIColor(0.7) }}></div>
                    <span className="text-gray-700">Vegetation Health</span>
                  </div>
                )}
                {activeLayers.ndwi && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getNDWIColor(0.5) }}></div>
                    <span className="text-gray-700">Water Content</span>
                  </div>
                )}
                {selectedPlot && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Selected Plot</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Layer Panel */}
          {showLayers && (
            <div className={`absolute ${isMobile ? 'inset-4 z-40' : 'top-6 right-24 w-80 z-30'} bg-white border border-gray-200 rounded-lg shadow-xl p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Map Layers</h3>
                <button
                  onClick={() => setShowLayers(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'boundaries', label: 'Plot Boundaries', color: 'green' },
                  { key: 'ndvi', label: 'NDVI (Vegetation)', color: 'green' },
                  { key: 'ndwi', label: 'NDWI (Water Index)', color: 'blue' },
                  { key: 'soil', label: 'Soil Type', color: 'yellow' },
                  { key: 'rainfall', label: 'Rainfall Data', color: 'indigo' },
                  { key: 'irrigation', label: 'Irrigation Network', color: 'purple' }
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                      <div className={`w-3 h-3 bg-${color}-500 rounded-sm mr-3`}></div>
                      {label}
                    </label>
                    <input
                      type="checkbox"
                      checked={activeLayers[key]}
                      onChange={() => toggleLayer(key)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Desktop Analysis Panel */}
        {!isMobile && (
          <div className={`${selectedPlot ? 'w-1/3' : 'w-1/4'} bg-white border-l border-gray-200 flex flex-col`}>
            {/* Enhanced Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'ndvi', label: 'NDVI Analysis', icon: '🌿' },
                { id: 'ndwi', label: 'NDWI Analysis', icon: '💧' },
                { id: 'custom', label: 'Custom Layers', icon: '🗺️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Enhanced Analysis Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'ndvi' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vegetation Health Analysis</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Health Scale</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Excellent (0.7+)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>Good (0.5-0.7)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          <span>Fair (0.3-0.5)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Poor (0.0-0.3)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">6-Month Trend</h4>
                      <div className="h-32 flex items-end space-x-3">
                        {ndviTrendData.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="bg-green-500 rounded-t w-full transition-all duration-500"
                              style={{ height: `${data.value * 100}%` }}
                            ></div>
                            <span className="text-xs mt-2 text-gray-600">{data.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ndwi' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Content Analysis</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Water Index Scale</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>High (0.5+)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                          <span>Moderate (0.3-0.5)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded"></div>
                          <span>Low (0.1-0.3)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-500 rounded"></div>
                          <span>Very Low (0.0-0.1)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Seasonal Comparison</h4>
                      <div className="space-y-4">
                        {ndwiSeasonalData.map((season, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">{season.season}</span>
                              <span className="text-gray-600">{season.current}</span>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${season.current * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div 
                                  className="bg-gray-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${season.previous * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Current</span>
                              <span>Previous</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analysis</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Soil Analysis</h4>
                        <p className="text-sm text-yellow-700">Red soil: 45%, Black soil: 30%, Alluvial: 25%</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Rainfall Pattern</h4>
                        <p className="text-sm text-blue-700">Average: 1200mm/year, Current: 950mm</p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-purple-800 mb-2">Irrigation Network</h4>
                        <p className="text-sm text-purple-700">Coverage: 68%, Active wells: 12, Canals: 3</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Selected Plot Info */}
            {selectedPlot && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plot Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Plot ID:</span>
                      <div className="font-semibold">{selectedPlot.id}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Land Size:</span>
                      <div className="font-semibold">{selectedPlot.landSize}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Crop Type:</span>
                      <div className="font-semibold">{selectedPlot.cropType}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Soil Type:</span>
                      <div className="font-semibold">{selectedPlot.soilType}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Holder Information</h4>
                    <div className="text-lg font-semibold text-gray-900">{selectedPlot.holderName}</div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Health Indicators</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">NDVI:</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: getNDVIColor(selectedPlot.ndvi) }}
                          ></div>
                          <span className="font-semibold">{selectedPlot.ndvi}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">NDWI:</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: getNDWIColor(selectedPlot.ndwi) }}
                          ></div>
                          <span className="font-semibold">{selectedPlot.ndwi}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Health Score:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full border ${getHealthScoreColor(selectedPlot.healthScore)}`}>
                          {selectedPlot.healthScore}/10
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Vegetation:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full ${getVegetationColor(selectedPlot.vegetation)}`}>
                          {selectedPlot.vegetation}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Last Updated: {selectedPlot.lastUpdated}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Mobile Bottom Panel */}
      {isMobile && showBottomPanel && selectedPlot && (
        <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-96 overflow-y-auto border-t border-gray-200">
          <div className="p-6">
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Plot Analysis</h3>
              <button
                onClick={() => setShowBottomPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Enhanced Mobile Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'info', label: 'Overview' },
                { id: 'ndvi', label: 'Vegetation' },
                { id: 'ndwi', label: 'Water' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Enhanced Mobile Content */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Plot ID</div>
                    <div className="font-semibold text-sm">{selectedPlot.id}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Land Size</div>
                    <div className="font-semibold text-sm">{selectedPlot.landSize}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Crop Type</div>
                    <div className="font-semibold text-sm">{selectedPlot.cropType}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Soil Type</div>
                    <div className="font-semibold text-sm">{selectedPlot.soilType}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-1">Holder Information</div>
                  <div className="text-lg font-bold text-blue-800">{selectedPlot.holderName}</div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">AI Health Score</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getHealthScoreColor(selectedPlot.healthScore)}`}>
                      {selectedPlot.healthScore}/10
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getNDVIColor(selectedPlot.ndvi) }}
                      ></div>
                      <span>NDVI: {selectedPlot.ndvi}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getNDWIColor(selectedPlot.ndwi) }}
                      ></div>
                      <span>NDWI: {selectedPlot.ndwi}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ndvi' && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-3">Vegetation Health</h4>
                  
                  <div className="h-20 flex items-end space-x-2 mb-4">
                    {ndviTrendData.slice(-6).map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-green-500 rounded-t w-full transition-all duration-500"
                          style={{ height: `${data.value * 60}%` }}
                        ></div>
                        <span className="text-xs mt-1 text-green-700">{data.month}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-green-700">
                    Current NDVI: <span className="font-semibold">{selectedPlot.ndvi}</span>
                    {selectedPlot.ndvi > 0.7 ? ' (Excellent)' : selectedPlot.ndvi > 0.5 ? ' (Good)' : ' (Needs Attention)'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ndwi' && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Water Content</h4>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Water Index</span>
                      <span className="font-semibold">{selectedPlot.ndwi}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedPlot.ndwi * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-700">
                    {selectedPlot.ndwi > 0.5 ? 'High Water Content' : selectedPlot.ndwi > 0.3 ? 'Moderate Water' : 'Low Water Content'}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              Last Updated: {selectedPlot.lastUpdated}
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && showBottomPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowBottomPanel(false)}
        ></div>
      )}
    </div>
  );
}

export default Map_Land_Analysis;