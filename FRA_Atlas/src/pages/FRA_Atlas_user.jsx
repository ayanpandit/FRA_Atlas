import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Layers, 
  Satellite, 
  Navigation, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Download,
  Share2,
  Filter,
  Search,
  TreePine,
  Mountain,
  Home,
  Users,
  Target,
  Info,
  Settings,
  Globe,
  Compass,
  Camera,
  FileText,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Square,
  Droplet
} from 'lucide-react';

const FRAAtlas_user = ({ userData }) => {
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapMode, setMapMode] = useState('2d'); // '2d' or '3d'

  const mapLayers = [
    {
      id: 'satellite',
      name: 'Satellite View',
      description: 'High-resolution satellite imagery',
      icon: Satellite,
      enabled: true
    },
    {
      id: 'terrain',
      name: 'Terrain',
      description: 'Topographical features and elevation',
      icon: Mountain,
      enabled: false
    },
    {
      id: 'forest_cover',
      name: 'Forest Cover',
      description: 'Forest density and vegetation type',
      icon: TreePine,
      enabled: true
    },
    {
      id: 'water_bodies',
      name: 'Water Bodies',
      description: 'Rivers, lakes, and water sources',
      icon: Droplet,
      enabled: false
    },
    {
      id: 'settlements',
      name: 'Settlements',
      description: 'Villages and residential areas',
      icon: Home,
      enabled: true
    },
    {
      id: 'boundaries',
      name: 'Administrative Boundaries',
      description: 'District, block, and village boundaries',
      icon: Target,
      enabled: false
    }
  ];

  const myLands = [
    {
      id: 'FRA001',
      name: 'Main Residential Plot',
      area: '2.5 hectares',
      status: 'Verified',
      coordinates: { lat: 24.8318, lng: 79.9199 },
      color: '#10B981' // green
    },
    {
      id: 'FRA002',
      name: 'Agricultural Land North',
      area: '1.8 hectares',
      status: 'Pending',
      coordinates: { lat: 24.8405, lng: 79.9245 },
      color: '#F59E0B' // yellow
    },
    {
      id: 'FRA003',
      name: 'Community Forest Rights',
      area: '3.2 hectares',
      status: 'Approved',
      coordinates: { lat: 24.8392, lng: 79.9178 },
      color: '#3B82F6' // blue
    }
  ];

  const nearbyFeatures = [
    {
      id: 1,
      name: 'Village Primary School',
      type: 'Education',
      distance: '0.5 km',
      icon: Users,
      coordinates: { lat: 24.8325, lng: 79.9205 }
    },
    {
      id: 2,
      name: 'Community Well',
      type: 'Water Source',
      distance: '0.3 km',
      icon: Droplet,
      coordinates: { lat: 24.8315, lng: 79.9195 }
    },
    {
      id: 3,
      name: 'Forest Check Post',
      type: 'Administrative',
      distance: '1.2 km',
      icon: TreePine,
      coordinates: { lat: 24.8380, lng: 79.9230 }
    },
    {
      id: 4,
      name: 'Village Temple',
      type: 'Religious',
      distance: '0.7 km',
      icon: Mountain,
      coordinates: { lat: 24.8335, lng: 79.9210 }
    }
  ];

  const measurements = [
    {
      label: 'Total Land Area',
      value: '7.5 hectares',
      subtext: 'Across 3 plots'
    },
    {
      label: 'Forest Coverage',
      value: '68%',
      subtext: 'Mixed deciduous forest'
    },
    {
      label: 'Nearest Water Source',
      value: '0.3 km',
      subtext: 'Community well'
    },
    {
      label: 'Village Distance',
      value: '0.8 km',
      subtext: 'To village center'
    }
  ];

  const LayerToggle = ({ layer }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <layer.icon className="h-5 w-5 text-gray-600" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{layer.name}</p>
          <p className="text-xs text-gray-500">{layer.description}</p>
        </div>
      </div>
      <button
        onClick={() => {
          // Toggle layer logic would go here
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          layer.enabled ? 'bg-green-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            layer.enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const LandPlot = ({ land }) => (
    <div 
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => setSelectedFeature(land)}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: land.color }}
        ></div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{land.name}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{land.area}</span>
            <span>•</span>
            <span className={
              land.status === 'Verified' ? 'text-green-600' :
              land.status === 'Approved' ? 'text-blue-600' : 'text-yellow-600'
            }>
              {land.status}
            </span>
          </div>
        </div>
      </div>
      <MapPin className="h-4 w-4 text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">FRA Atlas</h2>
          <p className="text-gray-600">Interactive map of your forest rights and surrounding areas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Download className="h-4 w-4" />
            <span>Export Map</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <Share2 className="h-4 w-4" />
            <span>Share Location</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        {/* Sidebar */}
        <div className={`absolute top-0 left-0 h-full bg-white border-r border-gray-200 z-10 transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-16'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-gray-900 ${sidebarOpen ? 'block' : 'hidden'}`}>
                Map Controls
              </h3>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              {/* View Controls */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">View Mode</h4>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMapMode('2d')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      mapMode === '2d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setMapMode('3d')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      mapMode === '3d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    3D
                  </button>
                </div>
              </div>

              {/* Map Layers */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Map Layers</h4>
                <div className="space-y-2">
                  {mapLayers.map((layer) => (
                    <LayerToggle key={layer.id} layer={layer} />
                  ))}
                </div>
              </div>

              {/* My Lands */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">My Lands</h4>
                <div className="space-y-2">
                  {myLands.map((land) => (
                    <LandPlot key={land.id} land={land} />
                  ))}
                </div>
              </div>

              {/* Nearby Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Nearby Features</h4>
                <div className="space-y-2">
                  {nearbyFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <div className="flex items-center space-x-3">
                        <feature.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{feature.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{feature.type}</span>
                            <span>•</span>
                            <span>{feature.distance}</span>
                          </div>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className={`h-full bg-gradient-to-br from-green-100 to-blue-100 ${sidebarOpen ? 'ml-80' : 'ml-16'} transition-all duration-300 relative overflow-hidden`}>
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 bg-white bg-opacity-50 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white border-opacity-30">
                <div className="relative">
                  <Map className="h-32 w-32 text-green-600" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="h-8 w-8 text-red-500 animate-bounce" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Map Loading...</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your personalized FRA Atlas with land boundaries, forest coverage, and nearby amenities
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white bg-opacity-70 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Verified Lands</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white bg-opacity-70 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending Verification</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white bg-opacity-70 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Community Lands</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors block w-full">
                <ZoomIn className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors block w-full">
                <ZoomOut className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors block w-full">
                <Compass className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors block w-full">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="text-sm">
              <p className="text-gray-600">Center Coordinates:</p>
              <p className="font-mono text-gray-900">24.8356° N, 79.9207° E</p>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Scale: 1:10,000</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gray-900"></div>
                <span className="text-xs text-gray-600">100m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {measurements.map((measurement, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">{measurement.value}</p>
              <p className="text-sm font-medium text-gray-700 mb-1">{measurement.label}</p>
              <p className="text-xs text-gray-500">{measurement.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Tools */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Analysis Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Compass className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Measure Distance</p>
                <p className="text-xs text-gray-500">Calculate distances between points</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Target className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Area Calculator</p>
                <p className="text-xs text-gray-500">Calculate area of selected regions</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <TreePine className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Forest Density</p>
                <p className="text-xs text-gray-500">Analyze vegetation coverage</p>
              </div>
            </button>
          </div>
        </div>

        {/* GPS Tools */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Navigation className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">GPS Tools</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Add Waypoint</p>
                <p className="text-xs text-gray-500">Mark important locations</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Globe className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Current Location</p>
                <p className="text-xs text-gray-500">Navigate to your position</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Export GPX</p>
                <p className="text-xs text-gray-500">Download GPS data</p>
              </div>
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Documentation</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Camera className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Geotagged Photos</p>
                <p className="text-xs text-gray-500">Capture location-based images</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Survey Notes</p>
                <p className="text-xs text-gray-500">Add field observations</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Share Report</p>
                <p className="text-xs text-gray-500">Generate location report</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Land Details Panel */}
      {selectedFeature && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedFeature.name || selectedFeature.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {selectedFeature.area && <span>Area: {selectedFeature.area}</span>}
                {selectedFeature.distance && <span>Distance: {selectedFeature.distance}</span>}
                {selectedFeature.type && <span>Type: {selectedFeature.type}</span>}
                {selectedFeature.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedFeature.status === 'Verified' ? 'bg-green-100 text-green-700' :
                    selectedFeature.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedFeature.status}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Details</h4>
              <div className="space-y-2 text-sm">
                {selectedFeature.coordinates && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-mono text-gray-900">
                      {selectedFeature.coordinates.lat.toFixed(4)}°, {selectedFeature.coordinates.lng.toFixed(4)}°
                    </span>
                  </div>
                )}
                {selectedFeature.id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="text-gray-900">{selectedFeature.id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Navigation className="h-4 w-4" />
                  <span>Navigate Here</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  <Share2 className="h-4 w-4" />
                  <span>Share Location</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Map Legend</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-sm text-gray-700">Verified Forest Rights</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-600"></div>
            <span className="text-sm text-gray-700">Pending Verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Community Rights</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded border-2 border-gray-500"></div>
            <span className="text-sm text-gray-700">Government Land</span>
          </div>
          <div className="flex items-center space-x-2">
            <TreePine className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Dense Forest</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">Water Bodies</span>
          </div>
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-700">Settlements</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mountain className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Hills & Elevation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRAAtlas_user;