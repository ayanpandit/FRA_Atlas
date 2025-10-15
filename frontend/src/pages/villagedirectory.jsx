import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Home, ChevronRight, Map, Info, Loader, Building2, TrendingUp, Droplets, Zap, School, Hospital } from 'lucide-react';

// Environment variables for API endpoints
const COWIN_API_URL = import.meta.env.VITE_COWIN_API_URL || 'https://cdn-api.co-vin.in/api/v2/admin/location';
const DATA_GOV_API_URL = import.meta.env.VITE_DATA_GOV_API_URL || 'https://api.data.gov.in/resource/9115b89c-7a80-4f54-9b06-21086e0f0bd7';
const DATA_GOV_API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

const VillageDirectory = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('states');
  const [villageDetails, setVillageDetails] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);

  // Fallback static data for states (used due to CORS restrictions)
  const fallbackStates = [
    { state_id: 1, state_name: 'Andhra Pradesh' },
    { state_id: 2, state_name: 'Arunachal Pradesh' },
    { state_id: 3, state_name: 'Assam' },
    { state_id: 4, state_name: 'Bihar' },
    { state_id: 5, state_name: 'Chhattisgarh' },
    { state_id: 6, state_name: 'Goa' },
    { state_id: 7, state_name: 'Gujarat' },
    { state_id: 8, state_name: 'Haryana' },
    { state_id: 9, state_name: 'Himachal Pradesh' },
    { state_id: 10, state_name: 'Jharkhand' },
    { state_id: 11, state_name: 'Karnataka' },
    { state_id: 12, state_name: 'Kerala' },
    { state_id: 13, state_name: 'Madhya Pradesh' },
    { state_id: 14, state_name: 'Maharashtra' },
    { state_id: 15, state_name: 'Manipur' },
    { state_id: 16, state_name: 'Meghalaya' },
    { state_id: 17, state_name: 'Mizoram' },
    { state_id: 18, state_name: 'Nagaland' },
    { state_id: 19, state_name: 'Odisha' },
    { state_id: 20, state_name: 'Punjab' },
    { state_id: 21, state_name: 'Rajasthan' },
    { state_id: 22, state_name: 'Sikkim' },
    { state_id: 23, state_name: 'Tamil Nadu' },
    { state_id: 24, state_name: 'Telangana' },
    { state_id: 25, state_name: 'Tripura' },
    { state_id: 26, state_name: 'Uttar Pradesh' },
    { state_id: 27, state_name: 'Uttarakhand' },
    { state_id: 28, state_name: 'West Bengal' },
  ];

  // Fetch States from API with fallback
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${COWIN_API_URL}/states`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (data.states) {
        setStates(data.states);
      } else {
        setStates(fallbackStates);
      }
    } catch (err) {
      // Use fallback data when API fails (CORS or network error)
      console.warn('Using fallback state data due to API error:', err);
      setStates(fallbackStates);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (stateId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${COWIN_API_URL}/districts/${stateId}`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (data.districts) {
        setDistricts(data.districts);
        setView('districts');
      }
    } catch (err) {
      console.warn('Failed to fetch districts:', err);
      // Show mock message for demo purposes
      setError('District data unavailable. This is a demo with limited API access.');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubDistricts = async (stateName, districtName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${DATA_GOV_API_URL}?api-key=${DATA_GOV_API_KEY}&format=json&filters[state.keyword]=${encodeURIComponent(stateName)}&filters[district]=${encodeURIComponent(districtName)}`);
      const data = await response.json();
      
      if (data.records) {
        const uniqueSubDistricts = [...new Set(data.records.map(r => r.sub_district || r.block).filter(Boolean))].map((name, idx) => ({
          sub_district_name: name,
          id: idx
        }));
        setSubDistricts(uniqueSubDistricts);
        setView('subdistricts');
      }
    } catch (err) {
      console.error('Error fetching sub-districts:', err);
      fetchVillagesDirectly(stateName, districtName);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillagesDirectly = async (stateName, districtName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${DATA_GOV_API_URL}?api-key=${DATA_GOV_API_KEY}&format=json&filters[state.keyword]=${encodeURIComponent(stateName)}&filters[district]=${encodeURIComponent(districtName)}&limit=500`);
      const data = await response.json();
      
      if (data.records) {
        const villageList = data.records.map((record, idx) => ({
          village_name: record.village_name || record.village || 'Unknown',
          id: idx,
          ...record
        }));
        setVillages(villageList);
        setView('villages');
      }
    } catch (err) {
      setError('Failed to fetch villages. Please try again.');
      console.error('Error fetching villages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillages = async (stateName, districtName, subDistrictName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${DATA_GOV_API_URL}?api-key=${DATA_GOV_API_KEY}&format=json&filters[state.keyword]=${encodeURIComponent(stateName)}&filters[district]=${encodeURIComponent(districtName)}&filters[sub_district]=${encodeURIComponent(subDistrictName)}&limit=500`);
      const data = await response.json();
      
      if (data.records) {
        const villageList = data.records.map((record, idx) => ({
          village_name: record.village_name || record.village || 'Unknown',
          id: idx,
          ...record
        }));
        setVillages(villageList);
        setView('villages');
      }
    } catch (err) {
      setError('Failed to fetch villages. Please try again.');
      console.error('Error fetching villages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillageDetails = async (villageName, districtName, stateName) => {
    setLoading(true);
    setError(null);
    try {
      const censusResponse = await fetch(`${DATA_GOV_API_URL}?api-key=${DATA_GOV_API_KEY}&format=json&filters[village_name]=${encodeURIComponent(villageName)}&filters[district]=${encodeURIComponent(districtName)}&filters[state.keyword]=${encodeURIComponent(stateName)}`);
      const censusData = await censusResponse.json();
      
      if (censusData.records && censusData.records.length > 0) {
        const details = censusData.records[0];
        setVillageDetails(details);
        
        const query = `${villageName}, ${districtName}, ${stateName}, India`;
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const geoData = await geoResponse.json();
        
        if (geoData && geoData.length > 0) {
          setCoordinates({
            lat: parseFloat(geoData[0].lat),
            lon: parseFloat(geoData[0].lon)
          });
        }
        
        setView('details');
      }
    } catch (err) {
      setError('Failed to fetch village details. Please try again.');
      console.error('Error fetching village details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setSubDistricts([]);
    setVillages([]);
    fetchDistricts(state.state_id);
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setSubDistricts([]);
    setVillages([]);
    fetchSubDistricts(selectedState.state_name, district.district_name);
  };

  const handleSubDistrictClick = (subDistrict) => {
    setSelectedSubDistrict(subDistrict);
    setSelectedVillage(null);
    setVillages([]);
    fetchVillages(selectedState.state_name, selectedDistrict.district_name, subDistrict.sub_district_name);
  };

  const handleVillageClick = (village) => {
    setSelectedVillage(village);
    fetchVillageDetails(village.village_name, selectedDistrict.district_name, selectedState.state_name);
  };

  const handleBack = () => {
    if (view === 'details') {
      setView('villages');
      setVillageDetails(null);
      setCoordinates(null);
    } else if (view === 'villages') {
      if (selectedSubDistrict) {
        setView('subdistricts');
        setVillages([]);
        setSelectedSubDistrict(null);
      } else {
        setView('districts');
        setVillages([]);
      }
    } else if (view === 'subdistricts') {
      setView('districts');
      setSubDistricts([]);
      setSelectedSubDistrict(null);
    } else if (view === 'districts') {
      setView('states');
      setDistricts([]);
      setSelectedDistrict(null);
    }
  };

  const filteredStates = states.filter(state =>
    state.state_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDistricts = districts.filter(district =>
    district.district_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubDistricts = subDistricts.filter(subDistrict =>
    subDistrict.sub_district_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVillages = villages.filter(village =>
    village.village_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border-2 border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-10 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400 to-orange-500 rounded-full blur-3xl opacity-10 -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                  <MapPin className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    India Village Directory
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">Explore every village across India with real-time data</p>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm flex-wrap mb-4">
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => { setView('states'); setSelectedState(null); setSelectedDistrict(null); setSelectedSubDistrict(null); }}>India</span>
              {selectedState && (
                <>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => { setView('districts'); setSelectedDistrict(null); setSelectedSubDistrict(null); }}>{selectedState.state_name}</span>
                </>
              )}
              {selectedDistrict && (
                <>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => { setView('subdistricts'); setSelectedSubDistrict(null); }}>{selectedDistrict.district_name}</span>
                </>
              )}
              {selectedSubDistrict && (
                <>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-indigo-600 font-semibold">{selectedSubDistrict.sub_district_name}</span>
                </>
              )}
              {selectedVillage && (
                <>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-purple-600 font-semibold">{selectedVillage.village_name}</span>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${view === 'states' ? 'states' : view === 'districts' ? 'districts' : view === 'subdistricts' ? 'sub-districts' : 'villages'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner text-gray-700"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 text-red-700 shadow-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <Loader className="animate-spin text-indigo-600" size={48} />
              <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* States View */}
        {view === 'states' && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStates.map((state, idx) => (
              <div
                key={state.state_id}
                onClick={() => handleStateClick(state)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-300 relative overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {state.state_name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span>Explore Districts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Districts View */}
        {view === 'districts' && !loading && (
          <>
            <button
              onClick={handleBack}
              className="mb-6 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-indigo-600 font-semibold border-2 border-indigo-200 hover:border-indigo-400"
            >
              ← Back to States
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDistricts.map((district, idx) => (
                <div
                  key={district.district_id}
                  onClick={() => handleDistrictClick(district)}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300 relative overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {district.district_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span>Explore Villages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sub-Districts View */}
        {view === 'subdistricts' && !loading && (
          <>
            <button
              onClick={handleBack}
              className="mb-6 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-purple-600 font-semibold border-2 border-purple-200 hover:border-purple-400"
            >
              ← Back to Districts
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSubDistricts.map((subDistrict, idx) => (
                <div
                  key={subDistrict.id}
                  onClick={() => handleSubDistrictClick(subDistrict)}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-300 relative overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-pink-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Map className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                      {subDistrict.sub_district_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span>View Villages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Villages View */}
        {view === 'villages' && !loading && (
          <>
            <button
              onClick={handleBack}
              className="mb-6 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-pink-600 font-semibold border-2 border-pink-200 hover:border-pink-400"
            >
              ← Back
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVillages.map((village, idx) => (
                <div
                  key={village.id}
                  onClick={() => handleVillageClick(village)}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300 relative overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Home className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {village.village_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Info size={16} className="mr-1" />
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Village Details View */}
        {view === 'details' && !loading && villageDetails && (
          <>
            <button
              onClick={handleBack}
              className="mb-6 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-green-600 font-semibold border-2 border-green-200 hover:border-green-400"
            >
              ← Back to Villages
            </button>
            
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100">
              {/* Village Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                      <Home size={32} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold">{villageDetails.village_name || villageDetails.village}</h2>
                      <p className="text-green-100 text-lg mt-1">{selectedDistrict.district_name}, {selectedState.state_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Map Section */}
                {coordinates && (
                  <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                    <iframe
                      width="100%"
                      height="400"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.05},${coordinates.lat - 0.05},${coordinates.lon + 0.05},${coordinates.lat + 0.05}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`}
                      className="w-full"
                    ></iframe>
                  </div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {villageDetails.no_of_villages && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-blue-600" size={28} />
                        <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Count</div>
                      </div>
                      <p className="text-3xl font-bold text-blue-900 mb-1">{villageDetails.no_of_villages}</p>
                      <p className="text-blue-600 font-medium">Total Villages</p>
                    </div>
                  )}

                  {villageDetails.no_of_households && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Home className="text-purple-600" size={28} />
                        <div className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Total</div>
                      </div>
                      <p className="text-3xl font-bold text-purple-900 mb-1">{villageDetails.no_of_households}</p>
                      <p className="text-purple-600 font-medium">Households</p>
                    </div>
                  )}

                  {villageDetails.total_population && (
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-pink-600" size={28} />
                        <div className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Census</div>
                      </div>
                      <p className="text-3xl font-bold text-pink-900 mb-1">{villageDetails.total_population}</p>
                      <p className="text-pink-600 font-medium">Total Population</p>
                    </div>
                  )}

                  {villageDetails.male_population && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-indigo-600" size={28} />
                        <div className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Male</div>
                      </div>
                      <p className="text-3xl font-bold text-indigo-900 mb-1">{villageDetails.male_population}</p>
                      <p className="text-indigo-600 font-medium">Male Population</p>
                    </div>
                  )}

                  {villageDetails.female_population && (
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border-2 border-rose-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-rose-600" size={28} />
                        <div className="bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Female</div>
                      </div>
                      <p className="text-3xl font-bold text-rose-900 mb-1">{villageDetails.female_population}</p>
                      <p className="text-rose-600 font-medium">Female Population</p>
                    </div>
                  )}

                  {villageDetails.literacy_rate && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <School className="text-emerald-600" size={28} />
                        <div className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Rate</div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-900 mb-1">{villageDetails.literacy_rate}%</p>
                      <p className="text-emerald-600 font-medium">Literacy Rate</p>
                    </div>
                  )}

                  {villageDetails.sc_population && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-amber-600" size={28} />
                        <div className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-semibold">SC</div>
                      </div>
                      <p className="text-3xl font-bold text-amber-900 mb-1">{villageDetails.sc_population}</p>
                      <p className="text-amber-600 font-medium">SC Population</p>
                    </div>
                  )}

                  {villageDetails.st_population && (
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <Users className="text-teal-600" size={28} />
                        <div className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-semibold">ST</div>
                      </div>
                      <p className="text-3xl font-bold text-teal-900 mb-1">{villageDetails.st_population}</p>
                      <p className="text-teal-600 font-medium">ST Population</p>
                    </div>
                  )}

                  {villageDetails.total_working_population && (
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="text-cyan-600" size={28} />
                        <div className="bg-cyan-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Workers</div>
                      </div>
                      <p className="text-3xl font-bold text-cyan-900 mb-1">{villageDetails.total_working_population}</p>
                      <p className="text-cyan-600 font-medium">Working Population</p>
                    </div>
                  )}
                </div>

                {/* Detailed Information Sections */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <Info className="mr-3 text-gray-600" size={24} />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {villageDetails.state && (
                        <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">State</p>
                          <p className="text-lg font-semibold text-gray-800">{villageDetails.state}</p>
                        </div>
                      )}
                      {villageDetails.district && (
                        <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">District</p>
                          <p className="text-lg font-semibold text-gray-800">{villageDetails.district}</p>
                        </div>
                      )}
                      {villageDetails.sub_district && (
                        <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Sub District</p>
                          <p className="text-lg font-semibold text-gray-800">{villageDetails.sub_district}</p>
                        </div>
                      )}
                      {villageDetails.village_code && (
                        <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Village Code</p>
                          <p className="text-lg font-semibold text-gray-800">{villageDetails.village_code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Infrastructure */}
                  {(villageDetails.power_supply_status || villageDetails.drinking_water_source) && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <Zap className="mr-3 text-yellow-600" size={24} />
                        Infrastructure
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {villageDetails.power_supply_status && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-yellow-200">
                            <p className="text-sm text-gray-500 mb-1">Power Supply</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.power_supply_status}</p>
                          </div>
                        )}
                        {villageDetails.drinking_water_source && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-yellow-200">
                            <div className="flex items-center mb-2">
                              <Droplets className="mr-2 text-blue-500" size={20} />
                              <p className="text-sm text-gray-500">Drinking Water Source</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.drinking_water_source}</p>
                          </div>
                        )}
                        {villageDetails.primary_school && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-yellow-200">
                            <div className="flex items-center mb-2">
                              <School className="mr-2 text-green-500" size={20} />
                              <p className="text-sm text-gray-500">Primary School</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.primary_school}</p>
                          </div>
                        )}
                        {villageDetails.primary_health_centre && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-yellow-200">
                            <div className="flex items-center mb-2">
                              <Hospital className="mr-2 text-red-500" size={20} />
                              <p className="text-sm text-gray-500">Primary Health Centre</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.primary_health_centre}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Demographics */}
                  {(villageDetails.child_population_0_6 || villageDetails.total_workers) && (
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6 border-2 border-violet-200 shadow-lg">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <Users className="mr-3 text-violet-600" size={24} />
                        Demographics Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {villageDetails.child_population_0_6 && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Children (0-6 years)</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.child_population_0_6}</p>
                          </div>
                        )}
                        {villageDetails.total_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Total Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.total_workers}</p>
                          </div>
                        )}
                        {villageDetails.main_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Main Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.main_workers}</p>
                          </div>
                        )}
                        {villageDetails.marginal_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Marginal Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.marginal_workers}</p>
                          </div>
                        )}
                        {villageDetails.non_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Non Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.non_workers}</p>
                          </div>
                        )}
                        {villageDetails.cultivators && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Cultivators</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.cultivators}</p>
                          </div>
                        )}
                        {villageDetails.agricultural_labourers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Agricultural Labourers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.agricultural_labourers}</p>
                          </div>
                        )}
                        {villageDetails.household_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Household Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.household_workers}</p>
                          </div>
                        )}
                        {villageDetails.other_workers && (
                          <div className="bg-white rounded-xl p-4 shadow-inner border border-violet-200">
                            <p className="text-sm text-gray-500 mb-1">Other Workers</p>
                            <p className="text-lg font-semibold text-gray-800">{villageDetails.other_workers}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* All Other Available Data */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Village Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(villageDetails).map(([key, value]) => {
                        if (value && typeof value !== 'object' && key !== 'village_name' && key !== 'state' && key !== 'district') {
                          return (
                            <div key={key} className="bg-white rounded-xl p-4 shadow-inner border border-slate-200">
                              <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VillageDirectory;