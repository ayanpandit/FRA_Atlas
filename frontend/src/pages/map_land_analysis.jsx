import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabaseClient';

const Map_Land_Analysis = () => {
  // Add missing patta search handler
  const handlePattaSearch = async () => {
    let query = supabase.from('pattas').select('*');
    if (searchType === 'patta_id' && searchValue) {
      query = query.ilike('patta_id', `%${searchValue}%`);
    } else if (searchType === 'holder_name' && searchValue) {
      query = query.ilike('holder_name', `%${searchValue}%`);
    } else if (searchType === 'village' && searchValue) {
      query = query.ilike('village', `%${searchValue}%`);
    } else if (searchType === 'state' && searchValue) {
      query = query.ilike('state', `%${searchValue}%`);
    }
    const { data, error } = await query;
    if (error) {
      setPattaResults([]);
      setMapPoints([]);
      return;
    }
    setPattaResults(data || []);
    if ((searchType === 'village' || searchType === 'state') && data) {
      setMapPoints(data.filter(p => p.coordinates).map(p => p.coordinates));
    } else {
      setMapPoints([]);
    }
  };
  // Patta search states (required for search UI)
  const [searchType, setSearchType] = useState('patta_id');
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [pattaResults, setPattaResults] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // User input states
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  
  // API and loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState('true_color');
  const [isMobile, setIsMobile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // API endpoint - change this to your backend URL
  const API_BASE_URL = 'http://localhost:5000';

  // ============================================
  // RESPONSIVE DESIGN HANDLER
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // API INTEGRATION - FETCH ANALYSIS DATA
  // ============================================
  const fetchAnalysis = async () => {
    // Validate inputs
    if (!latitude || !longitude) {
      setError('Please enter both latitude and longitude');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      setError('Please enter valid numbers');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Invalid coordinates. Lat: -90 to 90, Lon: -180 to 180');
      return;
    }

    if (rad < 10) {
      setError('Radius must be at least 10 meters');
      return;
    }

    // Reset states
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      // Call Flask API
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          radius: rad
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisData(data);
      setActiveTab('overview');
      
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis. Make sure the Flask server is running.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS - COLOR CODING
  // ============================================
  
  const getNDVIColor = (value) => {
    if (value >= 0.7) return 'bg-green-500';
    if (value >= 0.5) return 'bg-yellow-500';
    if (value >= 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getNDVILabel = (value) => {
    if (value >= 0.7) return 'Excellent';
    if (value >= 0.5) return 'Good';
    if (value >= 0.3) return 'Fair';
    return 'Poor';
  };

  const getWaterColor = (value) => {
    if (value >= 0.5) return 'bg-blue-500';
    if (value >= 0.3) return 'bg-cyan-500';
    if (value >= 0.1) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const getWaterLabel = (value) => {
    if (value >= 0.5) return 'High';
    if (value >= 0.3) return 'Moderate';
    if (value >= 0.1) return 'Low';
    return 'Very Low';
  };

  // ============================================
  // IMAGE DISPLAY CONFIGURATION
  // ============================================
  const imageTypes = [
    { id: 'true_color', label: 'True Color', description: 'Natural RGB view', icon: '🌍' },
    { id: 'false_color_vegetation', label: 'False Color', description: 'Enhanced vegetation', icon: '🌿' },
    { id: 'ndvi', label: 'NDVI', description: 'Vegetation health', icon: '🌱' },
    { id: 'mndwi', label: 'MNDWI', description: 'Water bodies', icon: '💧' },
    { id: 'ndwi', label: 'NDWI', description: 'Water content', icon: '💦' }
  ];

  // ============================================
  // RENDER: MAIN COMPONENT
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* ============================================ */}
      {/* HEADER SECTION */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Satellite Land Analysis</h1>
                <p className="text-xs sm:text-sm text-gray-600">Real-time Earth Engine Integration</p>
              </div>
            </div>
            {analysisData && (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Analysis Complete</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* ============================================ */}
        {/* PATTA SEARCH SECTION */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select value={searchType} onChange={e => setSearchType(e.target.value)} className="border px-3 py-2 rounded-lg text-sm">
              <option value="patta_id">Patta ID</option>
              <option value="holder_name">Holder Name</option>
              <option value="village">Village</option>
              <option value="state">State</option>
            </select>
            <div className="relative w-full">
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder={`Search by ${searchType.replace('_', ' ')}`}
                className="border px-3 py-2 rounded-lg w-full text-sm"
                autoComplete="off"
              />
              {suggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border rounded-lg shadow z-10 mt-1">
                  {suggestions.map(s => (
                    <li key={s} className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => { setSearchValue(s); setSuggestions([]); }}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={handlePattaSearch} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Search</button>
          </div>
        </div>

        {/* Patta Results Cards */}
        {pattaResults && pattaResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {pattaResults.map((patta, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-blue-700">{patta.patta_id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${patta.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : patta.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{patta.status}</span>
                </div>
                <div className="mb-1 text-gray-700"><b>Holder:</b> {patta.holder_name}</div>
                <div className="mb-1 text-gray-700"><b>Category:</b> {patta.category}</div>
                <div className="mb-1 text-gray-700"><b>Village:</b> {patta.village}</div>
                <div className="mb-1 text-gray-700"><b>State:</b> {patta.state}</div>
                <div className="mb-1 text-gray-700"><b>Area:</b> {patta.area_hectares} ha</div>
                <div className="mb-1 text-gray-700"><b>Coordinates:</b> {patta.coordinates ? JSON.stringify(patta.coordinates) : 'Not available'}</div>
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded-lg font-semibold hover:bg-green-700 transition"
                  onClick={() => {
                    // Autofill location analysis form and trigger analysis
                    let lat, lon;
                    if (patta.coordinates) {
                      let coords = patta.coordinates;
                      if (typeof coords === 'string') {
                        try {
                          const parsed = JSON.parse(coords);
                          if (Array.isArray(parsed) && parsed.length === 2) {
                            lat = parsed[0];
                            lon = parsed[1];
                          }
                        } catch {}
                      } else if (Array.isArray(coords) && coords.length === 2) {
                        lat = coords[0];
                        lon = coords[1];
                      } else if (typeof coords === 'object') {
                        lat = coords.latitude ?? coords.lat;
                        lon = coords.longitude ?? coords.lon;
                      }
                    }
                    if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
                      setLatitude(lat);
                      setLongitude(lon);
                      setRadius('1000');
                      fetchAnalysis();
                    } else {
                      alert('Coordinates not available for this patta.');
                    }
                  }}
                >Analyze</button>
              </div>
            ))}
          </div>
        )}

        {/* Map Visualization for village/state search */}
        {(searchType === 'village' || searchType === 'state') && mapPoints && mapPoints.length > 0 && (() => {
          // Find first valid coordinate for map center
          const validCoords = mapPoints.filter(pt => {
            let lat, lon;
            if (Array.isArray(pt) && pt.length === 2) {
              lat = pt[0];
              lon = pt[1];
            } else if (typeof pt === 'object') {
              lat = pt.latitude ?? pt.lat;
              lon = pt.longitude ?? pt.lon;
            }
            return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);
          });
          if (validCoords.length === 0) return null;
          let center;
          const first = validCoords[0];
          if (Array.isArray(first) && first.length === 2) {
            center = first;
          } else if (typeof first === 'object') {
            center = [first.latitude ?? first.lat, first.longitude ?? first.lon];
          }
          return (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-lg font-bold mb-2 text-blue-700">Patta Locations Map</h3>
              <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {validCoords.map((pt, i) => {
                  let lat, lon;
                  if (Array.isArray(pt) && pt.length === 2) {
                    lat = pt[0];
                    lon = pt[1];
                  } else if (typeof pt === 'object') {
                    lat = pt.latitude ?? pt.lat;
                    lon = pt.longitude ?? pt.lon;
                  }
                  if (typeof lat === 'number' && typeof lon === 'number') {
                    // Random polygon near marker
                    const poly = [
                      [lat, lon],
                      [lat + 0.01, lon],
                      [lat + 0.01, lon + 0.01],
                      [lat, lon + 0.01],
                    ];
                    return (
                      <React.Fragment key={i}>
                        <Marker position={[lat, lon]}>
                          <Popup>Patta Location</Popup>
                        </Marker>
                        <Polygon positions={poly} pathOptions={{ color: 'blue', fillOpacity: 0.2 }} />
                      </React.Fragment>
                    );
                  }
                  return null;
                })}
              </MapContainer>
            </div>
          );
        })()}
        {/* ============================================ */}
        {/* INPUT FORM SECTION */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Analysis Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Latitude Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude (-90 to 90)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 25.76177"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Longitude Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude (-180 to 180)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 84.15032"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Radius Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (meters, min 10)
              </label>
              <input
                type="number"
                step="10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Satellite Data...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Analyze Location</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setLatitude('25.76177');
                  setLongitude('84.15032');
                  setRadius('100');
                }}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200"
              >
                Bihar, India
              </button>
              <button
                onClick={() => {
                  setLatitude('28.6139');
                  setLongitude('77.2090');
                  setRadius('150');
                }}
                className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 border border-green-200"
              >
                Delhi, India
              </button>
              <button
                onClick={() => {
                  setLatitude('37.7749');
                  setLongitude('-122.4194');
                  setRadius('200');
                }}
                className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 border border-purple-200"
              >
                San Francisco, USA
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RESULTS SECTION - ONLY SHOWN WHEN DATA EXISTS */}
        {/* ============================================ */}
        {analysisData && (
          <>
            {/* ============================================ */}
            {/* METADATA SUMMARY CARDS */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Location Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Location</span>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-800 font-mono">
                  {analysisData.metadata.location.latitude.toFixed(5)}, {analysisData.metadata.location.longitude.toFixed(5)}
                </p>
              </div>

              {/* Radius Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Analysis Area</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900">{analysisData.metadata.location.radius_meters}m</p>
              </div>

              {/* Acquisition Date Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Satellite Image</span>
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-800">{analysisData.metadata.acquisition_date || 'N/A'}</p>
              </div>

              {/* Land Classification Card */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Land Type</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {analysisData.analysis.land_classification}
                </p>
              </div>
            </div>

            {/* ============================================ */}
            {/* NAVIGATION TABS */}
            {/* ============================================ */}
            <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 overflow-x-auto">
              <div className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'images', label: 'Satellite Images', icon: '🛰️' },
                  { id: 'vegetation', label: 'Vegetation', icon: '🌿' },
                  { id: 'water', label: 'Water', icon: '💧' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-max px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================ */}
            {/* TAB CONTENT AREA */}
            {/* ============================================ */}
            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 p-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis Summary</h3>
                  
                  {/* Vegetation and Water Coverage Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vegetation Coverage */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-green-900">Vegetation Coverage</h4>
                        <span className="text-3xl">🌿</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-green-700 mb-2">
                          {analysisData.analysis.vegetation.coverage_percentage}%
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${analysisData.analysis.vegetation.coverage_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* NDVI Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-800">Mean NDVI:</span>
                          <span className="font-semibold text-green-900">
                            {analysisData.analysis.vegetation.statistics.mean}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Range:</span>
                          <span className="font-semibold text-green-900">
                            {analysisData.analysis.vegetation.statistics.min} to {analysisData.analysis.vegetation.statistics.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Status:</span>
                          <span className={`font-semibold px-2 py-1 rounded ${
                            analysisData.analysis.vegetation.statistics.mean >= 0.7 ? 'bg-green-600 text-white' :
                            analysisData.analysis.vegetation.statistics.mean >= 0.5 ? 'bg-yellow-500 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {getNDVILabel(analysisData.analysis.vegetation.statistics.mean)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Water Coverage */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-blue-900">Water Coverage</h4>
                        <span className="text-3xl">💧</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-blue-700 mb-2">
                          {analysisData.analysis.water.coverage_percentage}%
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${analysisData.analysis.water.coverage_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* MNDWI Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-800">Mean MNDWI:</span>
                          <span className="font-semibold text-blue-900">
                            {analysisData.analysis.water.statistics.mean}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">Range:</span>
                          <span className="font-semibold text-blue-900">
                            {analysisData.analysis.water.statistics.min} to {analysisData.analysis.water.statistics.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-800">Status:</span>
                          <span className={`font-semibold px-2 py-1 rounded ${
                            analysisData.analysis.water.statistics.mean >= 0.5 ? 'bg-blue-600 text-white' :
                            analysisData.analysis.water.statistics.mean >= 0.3 ? 'bg-cyan-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {getWaterLabel(analysisData.analysis.water.statistics.mean)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Land Classification Detail */}
                  <div className="bg-gradient-to-r from-amber-50 to-green-50 rounded-lg p-6 border border-amber-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Land Classification Analysis
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {analysisData.analysis.land_classification}
                    </p>
                    <p className="text-sm text-gray-600">
                      This classification is based on vegetation density, water content, and spectral analysis of the satellite imagery.
                    </p>
                  </div>
                </div>
              )}

              {/* SATELLITE IMAGES TAB */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Satellite Imagery</h3>
                  
                  {/* Image Type Selector */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {imageTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedImage(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedImage === type.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-semibold text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Image Display */}
                  <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {imageTypes.find(t => t.id === selectedImage)?.label} View
                      </h4>
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Fullscreen
                      </button>
                    </div>
                    
                    {analysisData.images[selectedImage] ? (
                                              <div className="relative">
                        <img
                          src={analysisData.images[selectedImage]}
                          alt={imageTypes.find(t => t.id === selectedImage)?.label}
                          className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setShowImageModal(true)}
                        />
                        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg text-xs text-gray-700">
                          Click to enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        Image not available
                      </div>
                    )}
                  </div>

                  {/* Image Download Section */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Download Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {imageTypes.map((type) => (
                        analysisData.images[type.id] && (
                          <a
                            key={type.id}
                            href={analysisData.images[type.id]}
                            download={`${type.label.replace(/\s/g, '_')}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-colors text-center font-medium"
                          >
                            {type.icon} {type.label}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VEGETATION TAB */}
              {activeTab === 'vegetation' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Vegetation Analysis (NDVI)</h3>
                  
                  {/* NDVI Explanation */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      What is NDVI?
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                      <strong>Normalized Difference Vegetation Index (NDVI)</strong> measures vegetation health and density. 
                      Values range from -1 to +1, where higher values indicate healthier, denser vegetation. 
                      This is calculated from near-infrared and red light reflectance captured by satellites.
                    </p>
                  </div>

                  {/* NDVI Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Mean NDVI</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analysisData.analysis.vegetation.statistics.mean}
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        analysisData.analysis.vegetation.statistics.mean >= 0.7 ? 'bg-green-100 text-green-800' :
                        analysisData.analysis.vegetation.statistics.mean >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {getNDVILabel(analysisData.analysis.vegetation.statistics.mean)} Health
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Maximum NDVI</div>
                      <div className="text-3xl font-bold text-green-700">
                        {analysisData.analysis.vegetation.statistics.max}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Peak vegetation health in area
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Minimum NDVI</div>
                      <div className="text-3xl font-bold text-gray-700">
                        {analysisData.analysis.vegetation.statistics.min}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Lowest vegetation in area
                      </div>
                    </div>
                  </div>

                  {/* NDVI Color Scale Reference */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">NDVI Color Scale Reference</h4>
                    <div className="space-y-3">
                      {[
                        { range: '0.7 to 1.0', color: 'bg-green-600', label: 'Excellent', desc: 'Dense, healthy vegetation' },
                        { range: '0.5 to 0.7', color: 'bg-yellow-500', label: 'Good', desc: 'Moderate vegetation cover' },
                        { range: '0.3 to 0.5', color: 'bg-orange-500', label: 'Fair', desc: 'Sparse vegetation' },
                        { range: '0.0 to 0.3', color: 'bg-red-500', label: 'Poor', desc: 'Little to no vegetation' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-4">
                          <div className={`w-16 h-8 ${item.color} rounded`}></div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.label} ({item.range})</div>
                            <div className="text-xs text-gray-600">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coverage Visualization */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Vegetation Coverage</h4>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Area with healthy vegetation (NDVI &gt; 0.2)</span>
                        <span className="font-bold text-green-700">
                          {analysisData.analysis.vegetation.coverage_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                          style={{ width: `${analysisData.analysis.vegetation.coverage_percentage}%` }}
                        >
                          {analysisData.analysis.vegetation.coverage_percentage > 10 && (
                            <span className="text-xs font-bold text-white">
                              {analysisData.analysis.vegetation.coverage_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WATER TAB */}
              {activeTab === 'water' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Water Analysis (MNDWI)</h3>
                  
                  {/* MNDWI Explanation */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      What is MNDWI?
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>Modified Normalized Difference Water Index (MNDWI)</strong> detects water bodies and measures water content. 
                      Values range from -1 to +1, where positive values indicate water presence. 
                      This enhanced version is better at distinguishing water from built-up areas.
                    </p>
                  </div>

                  {/* MNDWI Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Mean MNDWI</div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {analysisData.analysis.water.statistics.mean}
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        analysisData.analysis.water.statistics.mean >= 0.5 ? 'bg-blue-100 text-blue-800' :
                        analysisData.analysis.water.statistics.mean >= 0.3 ? 'bg-cyan-100 text-cyan-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getWaterLabel(analysisData.analysis.water.statistics.mean)} Water Content
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Maximum MNDWI</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {analysisData.analysis.water.statistics.max}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Peak water detection in area
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Minimum MNDWI</div>
                      <div className="text-3xl font-bold text-gray-700">
                        {analysisData.analysis.water.statistics.min}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Lowest water presence
                      </div>
                    </div>
                  </div>

                  {/* MNDWI Color Scale Reference */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">MNDWI Color Scale Reference</h4>
                    <div className="space-y-3">
                      {[
                        { range: '0.5 to 1.0', color: 'bg-blue-600', label: 'High', desc: 'Clear water bodies' },
                        { range: '0.3 to 0.5', color: 'bg-cyan-500', label: 'Moderate', desc: 'Wet areas, moisture' },
                        { range: '0.1 to 0.3', color: 'bg-purple-500', label: 'Low', desc: 'Damp soil, vegetation' },
                        { range: '-1.0 to 0.1', color: 'bg-gray-500', label: 'Very Low', desc: 'Dry land, vegetation' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-4">
                          <div className={`w-16 h-8 ${item.color} rounded`}></div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.label} ({item.range})</div>
                            <div className="text-xs text-gray-600">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coverage Visualization */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Water Coverage</h4>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Area with water presence (MNDWI &gt; 0.0)</span>
                        <span className="font-bold text-blue-700">
                          {analysisData.analysis.water.coverage_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                          style={{ width: `${analysisData.analysis.water.coverage_percentage}%` }}
                        >
                          {analysisData.analysis.water.coverage_percentage > 10 && (
                            <span className="text-xs font-bold text-white">
                              {analysisData.analysis.water.coverage_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* TECHNICAL DETAILS SECTION */}
            {/* ============================================ */}
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Technical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Data Source</div>
                  <div className="text-gray-600">Sentinel-2 Satellite (ESA/Copernicus)</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Processing Date</div>
                  <div className="text-gray-600">{analysisData.metadata.processing_date}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Image Acquisition</div>
                  <div className="text-gray-600">{analysisData.metadata.acquisition_date || 'N/A'}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Analysis Status</div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* FULLSCREEN IMAGE MODAL */}
      {/* ============================================ */}
      {showImageModal && analysisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative max-w-6xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                {imageTypes.find(t => t.id === selectedImage)?.label}
              </h3>
              <img
                src={analysisData.images[selectedImage]}
                alt={imageTypes.find(t => t.id === selectedImage)?.label}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {imageTypes.find(t => t.id === selectedImage)?.description}
                </p>
                <a
                  href={analysisData.images[selectedImage]}
                  download={`${imageTypes.find(t => t.id === selectedImage)?.label.replace(/\s/g, '_')}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Download Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Powered by Google Earth Engine & Sentinel-2 Satellite Imagery
            </p>
            <p className="text-xs text-gray-500">
              NDVI: Normalized Difference Vegetation Index | MNDWI: Modified Normalized Difference Water Index
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Map_Land_Analysis;