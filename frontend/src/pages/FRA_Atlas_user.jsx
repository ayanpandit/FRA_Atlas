import React, { useState, useEffect } from 'react';
import { 
  MapPin, Download, Share2, TreePine, Mountain, Home, Droplet,
  BarChart3, Camera, FileText, Navigation, Globe, Target, Compass, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const FRAAtlas_user = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pattas, setPattas] = useState([]);
  const [allPattas, setAllPattas] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    verified: 0,
    pending: 0,
    approved: 0,
    cancelled: 0
  });

  const measurements = [
    { label: 'Total Land Area', value: '7.5 hectares', subtext: 'Across 3 plots' },
    { label: 'Forest Coverage', value: '68%', subtext: 'Mixed deciduous forest' },
    { label: 'Nearest Water Source', value: '0.3 km', subtext: 'Community well' },
    { label: 'Village Distance', value: '0.8 km', subtext: 'To village center' }
  ];

  // Function to parse coordinates from various formats
  const parseCoordinates = (coordString) => {
    if (!coordString) return null;
    
    try {
      // If it's already an object with lat/lng
      if (typeof coordString === 'object') {
        if (coordString.lat && coordString.lng) {
          return { lat: parseFloat(coordString.lat), lng: parseFloat(coordString.lng) };
        }
        if (coordString.latitude && coordString.longitude) {
          return { lat: parseFloat(coordString.latitude), lng: parseFloat(coordString.longitude) };
        }
        // Handle array format [lat, lng]
        if (Array.isArray(coordString) && coordString.length === 2) {
          return { lat: parseFloat(coordString[0]), lng: parseFloat(coordString[1]) };
        }
      }
      
      // Convert to string for parsing
      let str = typeof coordString === 'string' ? coordString : JSON.stringify(coordString);
      
      // Remove any brackets, quotes, or extra spaces
      str = str.replace(/[\[\]"'{}]/g, '').trim();
      
      // Split by comma or space
      const parts = str.split(/[,\s]+/).filter(p => p.length > 0);
      
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    } catch (error) {
      console.error('Error parsing coordinates:', coordString, error);
    }
    
    return null;
  };

  // Fetch pattas from database
  const fetchPattas = async (filter = 'all') => {
    try {
      setLoading(true);
      console.log('Fetching pattas with filter:', filter);
      
      // Always fetch all pattas for total count
      const { data: allData, error: allError } = await supabase.from('pattas').select('*');
      if (allError) {
        console.error('Error fetching all pattas:', allError);
      } else {
        console.log('Total pattas in database:', allData?.length);
        setAllPattas(allData || []);
        
        // Calculate counts for each status
        const counts = {
          verified: 0,
          pending: 0,
          approved: 0,
          cancelled: 0
        };
        allData?.forEach(patta => {
          const status = patta.status?.toLowerCase();
          if (counts.hasOwnProperty(status)) {
            counts[status]++;
          }
        });
        console.log('Status counts:', counts);
        setStatusCounts(counts);
      }
      
      // Fetch filtered pattas
      let query = supabase.from('pattas').select('*');
      
      if (filter !== 'all') {
        query = query.eq('status', filter.toLowerCase());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching filtered pattas:', error);
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} pattas for filter '${filter}':`, data);
      setPattas(data || []);
    } catch (error) {
      console.error('Error in fetchPattas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update markers when pattas or map changes
  useEffect(() => {
    console.log('Markers useEffect triggered. Pattas count:', pattas.length);
    
    if (!window.fraAtlasMapInstance) {
      console.log('Map not ready yet');
      return;
    }

    const map = window.fraAtlasMapInstance;

    // Remove ALL old markers first
    markers.forEach(marker => {
      if (marker && map) {
        map.removeLayer(marker);
      }
    });

    // If no pattas, clear markers and return
    if (!pattas.length) {
      console.log('No pattas to display');
      setMarkers([]);
      return;
    }

    const newMarkers = [];

    // Color mapping for status
    const statusColors = {
      verified: '#10B981', // green
      pending: '#F59E0B',  // yellow/orange
      cancelled: '#EF4444', // red
      approved: '#3B82F6'   // blue
    };

    pattas.forEach((patta) => {
      const coords = parseCoordinates(patta.coordinates);
      
      if (coords && window.L) {
        const status = patta.status?.toLowerCase() || 'pending';
        const color = statusColors[status] || '#6B7280'; // default gray
        console.log(`Creating marker for patta ${patta.patta_id} at [${coords.lat}, ${coords.lng}] with status '${status}' (color: ${color})`);
        
        // Create custom icon based on status
        const customIcon = window.L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker([coords.lat, coords.lng], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
                ${patta.patta_id || 'N/A'}
              </h3>
              <div style="margin-bottom: 6px;">
                <strong style="color: #6B7280;">Holder:</strong> 
                <span style="color: #1F2937;">${patta.holder_name || 'N/A'}</span>
              </div>
              <div style="margin-bottom: 6px;">
                <strong style="color: #6B7280;">Village:</strong> 
                <span style="color: #1F2937;">${patta.village || 'N/A'}</span>
              </div>
              <div style="margin-bottom: 6px;">
                <strong style="color: #6B7280;">Area:</strong> 
                <span style="color: #1F2937;">${patta.area_hectares || 0} hectares</span>
              </div>
              <div style="margin-bottom: 6px;">
                <strong style="color: #6B7280;">Status:</strong> 
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 12px;
                  background-color: ${color}20;
                  color: ${color};
                  font-weight: 600;
                  font-size: 12px;
                  text-transform: capitalize;
                ">${patta.status || 'pending'}</span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">
                Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}
              </div>
            </div>
          `)
          .addTo(map);
        
        newMarkers.push(marker);
      }
    });

    console.log(`Created ${newMarkers.length} markers on map`);
    setMarkers(newMarkers);

    // Fit map bounds to show all markers
    if (newMarkers.length > 0) {
      const group = window.L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    } else {
      console.log('No markers to fit bounds');
    }

  }, [pattas]);

  // Fetch pattas when status filter changes
  useEffect(() => {
    fetchPattas(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (loading) return;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        if (typeof window !== 'undefined' && !window.L) {
          // Load Leaflet CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Load Leaflet JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            setTimeout(() => {
              const mapContainer = document.getElementById('fraAtlasMap');
              if (mapContainer && window.L && !window.fraAtlasMapInstance) {
                // Initialize map with high zoom (18)
                const map = window.L.map('fraAtlasMap').setView([19.8222, 82.5486], 18);
                
                // Add satellite tile layer
                window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                  attribution: 'Esri',
                  maxZoom: 19
                }).addTo(map);

                // Store instance globally (no default marker)
                window.fraAtlasMapInstance = map;

                console.log('FRA Atlas map initialized successfully');
              }
            }, 100);
          };
          document.head.appendChild(script);
        } else if (window.L && !window.fraAtlasMapInstance) {
          // Leaflet already loaded
          setTimeout(() => {
            const mapContainer = document.getElementById('fraAtlasMap');
            if (mapContainer && !window.fraAtlasMapInstance) {
              const map = window.L.map('fraAtlasMap').setView([19.8222, 82.5486], 18);
              
              window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Esri',
                maxZoom: 19
              }).addTo(map);

              // Store instance globally (no default marker)
              window.fraAtlasMapInstance = map;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (window.fraAtlasMapInstance) {
        window.fraAtlasMapInstance.remove();
        window.fraAtlasMapInstance = null;
      }
    };
  }, [loading]);

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap');
        .alan-sans { font-family: "Alan Sans", sans-serif; font-optical-sizing: auto; font-weight: 728; font-style: normal; }`}
      </style>
      <div className="min-h-screen bg-gray-50 text-gray-900 alan-sans">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">FRA Atlas</h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">Interactive map visualization of your forest rights and surrounding areas with satellite imagery</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">Export Map</span>
              </button>
              <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">Share Location</span>
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-teal-700" />
                <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    statusFilter === 'all'
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({allPattas.length})
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative bg-white rounded-3xl border-2 border-gray-200/50 overflow-hidden transform hover:scale-[1.002] transition-all duration-500" style={{ height: '70vh', minHeight: '500px', maxHeight: '800px', boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading map data...</p>
                </div>
              </div>
            )}
            <div id="fraAtlasMap" className="w-full h-full bg-gray-100" style={{ minHeight: '500px' }}></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {measurements.map((measurement, index) => (
              <div key={index} className="group bg-white rounded-2xl border-2 border-gray-200/50 p-6 sm:p-8 hover:border-teal-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                <div className="text-center space-y-2">
                  <p className="text-2xl sm:text-3xl font-bold text-teal-700 group-hover:text-teal-800 transition-all">{measurement.value}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{measurement.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{measurement.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FRAAtlas_user;
