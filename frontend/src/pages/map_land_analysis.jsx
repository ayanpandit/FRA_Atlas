import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabaseClient';

// Add Alan Sans font integration
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
  .alan-sans { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 728; }
`;
document.head.appendChild(style);

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
  // Track if the analysis was initiated from a specific patta (so we persist results only for that patta)
  const [selectedPattaId, setSelectedPattaId] = useState(null);
  
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

      // If this analysis was initiated from a patta, persist key summary indexes
      if (selectedPattaId) {
        try {
          // Extract mean values from expected response shape: analysis.vegetation.statistics.mean and analysis.water.statistics.mean
          const meanNdvi = data?.analysis?.vegetation?.statistics?.mean;
          const meanMndwi = data?.analysis?.water?.statistics?.mean;

          // Only proceed if we have numeric values
          if (typeof meanNdvi === 'number' || typeof meanMndwi === 'number') {
            // Persist raw float means directly (columns now use double precision)
            const ndviVal = typeof meanNdvi === 'number' ? meanNdvi : 0.0;
            const ndwiVal = typeof meanMndwi === 'number' ? meanMndwi : 0.0;

            const { data: updateData, error: updateError } = await supabase
              .from('pattas')
              .update({ ndvi_index: ndviVal, ndwi_index: ndwiVal })
              .eq('patta_id', selectedPattaId);

            if (updateError) {
              console.error('Failed to persist NDVI/NDWI to patta:', updateError);
            } else {
              console.info('Persisted NDVI/NDWI for patta', selectedPattaId, { ndviVal, ndwiVal });
            }
          }
        } catch (err) {
          console.error('Error persisting patta analysis results:', err);
        } finally {
          // Clear selection so subsequent manual analyses won't persist
          setSelectedPattaId(null);
        }
      }
      
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
    <div className="min-h-screen bg-white alan-sans">
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ============================================ */}
        {/* ENHANCED PATTA SEARCH SECTION */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 transform hover:scale-105 transition-all duration-500" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.12)'
        }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center" style={{
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15)'
            }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Land Record Search</h2>
              <p className="text-gray-600 text-sm">Find and analyze patta records with satellite integration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Type</label>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <option value="patta_id" className="bg-white">Patta ID</option>
                <option value="holder_name" className="bg-white">Holder Name</option>
                <option value="village" className="bg-white">Village</option>
                <option value="state" className="bg-white">State</option>
              </select>
            </div>

            <div className="relative lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Value</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder={`Enter ${searchType.replace('_', ' ')}...`}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  autoComplete="off"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {suggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                  {suggestions.map(s => (
                    <div
                      key={s}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => { setSearchValue(s); setSuggestions([]); }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePattaSearch}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Records
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Patta Results Cards */}
        {pattaResults && pattaResults.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Search Results</h3>
                <p className="text-gray-700 text-base font-medium">Found {pattaResults.length} patta record(s)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pattaResults.map((patta, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/50 p-8 hover:border-emerald-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-emerald-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{patta.patta_id}</h4>
                        <p className="text-gray-600 text-sm">{patta.category}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patta.status === 'verified'
                        ? 'bg-green-600 text-white border border-green-500'
                        : patta.status === 'pending'
                        ? 'bg-yellow-600 text-white border border-yellow-500'
                        : 'bg-red-600 text-white border border-red-500'
                    }`}>
                      {patta.status.charAt(0).toUpperCase() + patta.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700"><span className="text-blue-600 font-medium">Holder:</span> {patta.holder_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-gray-700"><span className="text-blue-600 font-medium">Location:</span> {patta.village}, {patta.state}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-gray-700"><span className="text-blue-600 font-medium">Area:</span> {patta.area_hectares} hectares</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-gray-700"><span className="text-blue-600 font-medium">Coordinates:</span> {patta.coordinates ? 'Available' : 'Not available'}</span>
                    </div>
                  </div>

                  <button
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
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
                        // Mark this analysis as coming from a patta so results will be persisted
                        setSelectedPattaId(patta.patta_id ?? patta.id ?? null);
                        setLatitude(lat);
                        setLongitude(lon);
                        setRadius('1000');
                        fetchAnalysis();
                      } else {
                        alert('Coordinates not available for this patta.');
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analyze Land
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}        {/* Map Visualization for village/state search */}
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
        {/* INPUT FORM SECTION - PROFESSIONAL DESIGN */}
        {/* ============================================ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-8 transform hover:scale-105 transition-all duration-500" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.12)'
        }}>
          <div className="relative z-10">
            {/* Section Header */}
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center" style={{
                  boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Location Analysis Parameters</span>
              </h3>
              <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
                Enter coordinates and radius to analyze satellite imagery with AI-powered insights
              </p>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Latitude Input */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span>Latitude (-90 to 90)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => { setLatitude(e.target.value); setSelectedPattaId(null); }}
                    placeholder="e.g., 25.76177"
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500" style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                </div>
              </div>

              {/* Longitude Input */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span>Longitude (-180 to 180)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => { setLongitude(e.target.value); setSelectedPattaId(null); }}
                    placeholder="e.g., 84.15032"
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-300 text-gray-800 placeholder-gray-500" style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                </div>
              </div>

              {/* Radius Input */}
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <span>Radius (meters)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    min="10"
                    value={radius}
                    onChange={(e) => { setRadius(e.target.value); setSelectedPattaId(null); }}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 text-gray-800 placeholder-gray-500" style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">Minimum: 10 meters</p>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={fetchAnalysis}
              disabled={loading}
              className={`w-full py-5 px-8 rounded-2xl font-bold text-white transition-all duration-500 flex items-center justify-center space-x-3 transform hover:scale-105 active:scale-95 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-cyan-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-cyan-700'
              }`}
              style={{
                boxShadow: loading 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08)'
                  : 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Analyzing Satellite Data...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-lg">Analyze Location</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-xl flex items-start space-x-3 shadow-lg">
                <svg className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-red-700 text-sm">Analysis Error</h4>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Quick Examples */}
            <div className="mt-10 pt-8 border-t border-gray-600/50">
              <p className="text-sm font-bold text-gray-700 mb-6 flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Quick Examples</span>
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setLatitude('25.76177');
                    setLongitude('84.15032');
                    setRadius('100');
                  }}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-emerald-500 transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:text-emerald-600" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  Bihar, India
                </button>
                <button
                  onClick={() => {
                    setLatitude('28.6139');
                    setLongitude('77.2090');
                    setRadius('150');
                  }}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-blue-500 transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:text-blue-600" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  Delhi, India
                </button>
                <button
                  onClick={() => {
                    setLatitude('37.7749');
                    setLongitude('-122.4194');
                    setRadius('200');
                  }}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-purple-500 transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:text-purple-600" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  San Francisco, USA
                </button>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Location Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-500 hover:scale-105" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">Location</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-800 font-mono leading-relaxed">
                  {analysisData.metadata.location.latitude.toFixed(5)}, {analysisData.metadata.location.longitude.toFixed(5)}
                </p>
              </div>

              {/* Radius Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-500 hover:scale-105" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">Analysis Area</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800">{analysisData.metadata.location.radius_meters}m</p>
              </div>

              {/* Acquisition Date Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-500 hover:scale-105" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">Satellite Image</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-800">{analysisData.metadata.acquisition_date || 'N/A'}</p>
              </div>

              {/* Land Classification Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-500 hover:scale-105" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">Land Type</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center" style={{
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {analysisData.analysis.land_classification}
                </p>
              </div>
            </div>

            {/* ============================================ */}
            {/* NAVIGATION TABS */}
            {/* ============================================ */}
            <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-t-2xl border border-b-0 border-gray-600/50 overflow-x-auto shadow-xl">
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
                    className={`flex-1 min-w-max px-8 py-5 text-sm font-bold transition-all duration-300 border-b-2 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? 'text-cyan-400 border-cyan-400 bg-gradient-to-b from-gray-800/70 to-gray-700/70 shadow-lg'
                        : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================ */}
            {/* TAB CONTENT AREA */}
            {/* ============================================ */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-b-2xl shadow-2xl border border-gray-600/50 p-8">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">Analysis Summary</h3>
                  
                  {/* Vegetation and Water Coverage Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Vegetation Coverage */}
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-2xl p-8 border border-green-600/30 shadow-2xl hover:border-green-500/50 transition-all duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-green-400">Vegetation Coverage</h4>
                        <span className="text-4xl">🌿</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {analysisData.analysis.vegetation.coverage_percentage}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${analysisData.analysis.vegetation.coverage_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* NDVI Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Mean NDVI:</span>
                          <span className="font-semibold text-white">
                            {analysisData.analysis.vegetation.statistics.mean}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Range:</span>
                          <span className="font-semibold text-white">
                            {analysisData.analysis.vegetation.statistics.min} to {analysisData.analysis.vegetation.statistics.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
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
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-2xl p-8 border border-blue-600/30 shadow-2xl hover:border-blue-500/50 transition-all duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-blue-400">Water Coverage</h4>
                        <span className="text-4xl">💧</span>
                      </div>
                      <div className="mb-4">
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {analysisData.analysis.water.coverage_percentage}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${analysisData.analysis.water.coverage_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* MNDWI Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Mean MNDWI:</span>
                          <span className="font-semibold text-white">
                            {analysisData.analysis.water.statistics.mean}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Range:</span>
                          <span className="font-semibold text-white">
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
                  <div className="bg-white rounded-lg p-4 border border-gray-200" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        {imageTypes.find(t => t.id === selectedImage)?.label} View
                      </h4>
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transform hover:scale-105 transition-all duration-300"
                      >
                        View Fullscreen
                      </button>
                    </div>
                    
                    {analysisData.images[selectedImage] ? (
                      <div className="relative max-w-md mx-auto">
                        <img
                          src={analysisData.images[selectedImage]}
                          alt={imageTypes.find(t => t.id === selectedImage)?.label}
                          className="w-full h-auto max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-95 transition-all duration-300 transform hover:scale-105"
                          onClick={() => setShowImageModal(true)}
                          style={{
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.15)'
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-white bg-opacity-95 px-2 py-1 rounded-lg text-xs text-gray-700 border border-gray-200" style={{
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          Click to enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        Image not available
                      </div>
                    )}
                  </div>

                  {/* Image Download Section */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200" style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
                  }}>
                    <h4 className="font-semibold text-gray-800 mb-3">Download Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {imageTypes.map((type) => (
                        analysisData.images[type.id] && (
                          <a
                            key={type.id}
                            href={analysisData.images[type.id]}
                            download={`${type.label.replace(/\s/g, '_')}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-all text-center font-medium transform hover:scale-105 duration-300" style={{
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                            }}
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
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-5 h-5 mr-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center" style={{
                  boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Technical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="font-medium text-gray-800 mb-2">Data Source</div>
                  <div className="text-gray-600">Sentinel-2 Satellite (ESA/Copernicus)</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="font-medium text-gray-800 mb-2">Processing Date</div>
                  <div className="text-gray-600">{analysisData.metadata.processing_date}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="font-medium text-gray-800 mb-2">Image Acquisition</div>
                  <div className="text-gray-600">{analysisData.metadata.acquisition_date || 'N/A'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="font-medium text-gray-800 mb-2">Analysis Status</div>
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
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100 transition-all z-10 transform hover:scale-110" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <div className="bg-white rounded-lg p-4" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.2)'
            }}>
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
      {/* ============================================ */}
      {/* ENHANCED FOOTER */}
      {/* ============================================ */}
      <footer className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-t border-gray-600/50 mt-12 rounded-t-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">
                Powered by Google Earth Engine & Sentinel-2 Satellite Imagery
              </p>
            </div>
            <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
            }}>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                <span className="text-emerald-400 font-bold">NDVI:</span> Normalized Difference Vegetation Index |
                <span className="text-blue-400 font-bold ml-2">MNDWI:</span> Modified Normalized Difference Water Index
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Map_Land_Analysis;