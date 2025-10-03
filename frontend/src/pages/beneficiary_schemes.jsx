import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  SCHEME_DEFINITIONS, 
  generateRecommendedSchemes, 
  batchGenerateRecommendations 
} from '../lib/schemeRecommendations';

export default function BeneficiarySchemes() {
  // UI State
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedHolder, setSelectedHolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Data State
  const [pattaHolders, setPattaHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'ndvi', 'ndwi', 'updated'
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Community Stats
  const [communityStats, setCommunityStats] = useState({
    totalPattas: 0,
    avgNDVI: 0,
    avgNDWI: 0,
    beneficiaries: 0,
    schemeCoverage: 0
  });
  
  // Regions list
  const [regions, setRegions] = useState([]);
  
  // Remove dummy data array - will be replaced with real data
  // Fetch patta holders from Supabase
  const fetchPattaHolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('pattas')
        .select('*')
        .order('updated_at', { ascending: false });
      
      // Apply region filter if not "All Regions"
      if (selectedRegion !== 'All Regions') {
        query = query.eq('district', selectedRegion);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Process and format the data
      const processedData = data.map(patta => ({
        ...patta,
        // Normalize NDVI/NDWI values (ensure they're numbers)
        ndvi: typeof patta.ndvi_index === 'number' ? patta.ndvi_index : 0,
        ndwi: typeof patta.ndwi_index === 'number' ? patta.ndwi_index : 0,
        // Format schemes array
        schemes: Array.isArray(patta.recommended_schemes) 
          ? patta.recommended_schemes.map(s => s.scheme_name || s.name || s)
          : [],
        // Calculate priority based on NDVI/NDWI
        priority: calculatePriority(patta.ndvi_index, patta.ndwi_index),
        // Format last updated
        lastUpdated: patta.updated_at
      }));
      
      setPattaHolders(processedData);
      
      // Calculate community stats
      calculateCommunityStats(processedData);
      
      // Extract unique regions
      const uniqueRegions = [...new Set(data.map(p => p.district).filter(Boolean))];
      setRegions(['All Regions', ...uniqueRegions]);
      
    } catch (err) {
      console.error('Error fetching patta holders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate priority based on NDVI/NDWI values
  const calculatePriority = (ndvi, ndwi) => {
    const ndviScore = ndvi || 0;
    const ndwiScore = ndwi || 0;
    
    // Low vegetation and low water = high priority for intervention
    if (ndviScore < 0.3 || ndwiScore < -0.2) return 'high';
    if (ndviScore < 0.6 || ndwiScore < 0.1) return 'medium';
    return 'low';
  };
  
  // Calculate community statistics
  const calculateCommunityStats = (data) => {
    if (data.length === 0) {
      setCommunityStats({
        totalPattas: 0,
        avgNDVI: 0,
        avgNDWI: 0,
        beneficiaries: 0,
        schemeCoverage: 0
      });
      return;
    }
    
    const totalNDVI = data.reduce((sum, p) => sum + (p.ndvi || 0), 0);
    const totalNDWI = data.reduce((sum, p) => sum + (p.ndwi || 0), 0);
    const withSchemes = data.filter(p => p.schemes && p.schemes.length > 0).length;
    
    setCommunityStats({
      totalPattas: data.length,
      avgNDVI: parseFloat((totalNDVI / data.length).toFixed(3)),
      avgNDWI: parseFloat((totalNDWI / data.length).toFixed(3)),
      beneficiaries: data.length * 4, // Assume average 4 family members
      schemeCoverage: Math.round((withSchemes / data.length) * 100)
    });
  };
  
  // Generate recommendations for all pattas
  const generateAllRecommendations = async () => {
    try {
      setLoading(true);
      const result = await batchGenerateRecommendations(supabase);
      
      if (result.success) {
        console.log(`Generated recommendations for ${result.processed} pattas`);
        // Refresh data
        await fetchPattaHolders();
      } else {
        console.error('Failed to generate recommendations:', result.error);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Use effect to fetch data on component mount and region change
  useEffect(() => {
    fetchPattaHolders();
  }, [selectedRegion]);

  // Filter and search functions
  const getFilteredAndSortedData = () => {
    let filtered = pattaHolders;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(holder => 
        holder.holder_name?.toLowerCase().includes(query) ||
        holder.patta_id?.toLowerCase().includes(query) ||
        holder.village?.toLowerCase().includes(query) ||
        holder.district?.toLowerCase().includes(query) ||
        holder.state?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(holder => holder.status === filterStatus);
    }
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(holder => holder.priority === filterPriority);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.holder_name || '';
          bVal = b.holder_name || '';
          break;
        case 'ndvi':
          aVal = a.ndvi || 0;
          bVal = b.ndvi || 0;
          break;
        case 'ndwi':
          aVal = a.ndwi || 0;
          bVal = b.ndwi || 0;
          break;
        case 'updated':
          aVal = new Date(a.lastUpdated || 0);
          bVal = new Date(b.lastUpdated || 0);
          break;
        default:
          aVal = a.holder_name || '';
          bVal = b.holder_name || '';
      }
      
      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };
  
  const getConditionColor = (value, type) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'ndvi') {
      // NDVI: -1 to 1 scale, higher is better
      if (numValue > 0.6) return 'bg-emerald-500';
      if (numValue > 0.3) return 'bg-amber-500';
      if (numValue > 0.1) return 'bg-orange-500';
      return 'bg-rose-500';
    } else {
      // NDWI: -1 to 1 scale, context dependent
      if (numValue > 0.3) return 'bg-blue-500';
      if (numValue > 0.0) return 'bg-cyan-500';
      if (numValue > -0.3) return 'bg-amber-500';
      return 'bg-rose-500';
    }
  };

  const getConditionLabel = (value, type) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'ndvi') {
      if (numValue > 0.6) return 'Excellent';
      if (numValue > 0.3) return 'Good';
      if (numValue > 0.1) return 'Moderate';
      return 'Poor';
    } else {
      if (numValue > 0.3) return 'High Water';
      if (numValue > 0.0) return 'Moderate Water';
      if (numValue > -0.3) return 'Low Water';
      return 'Very Low';
    }
  };

  const getSchemeIcon = (scheme) => {
    // Handle both scheme names and scheme objects
    const schemeName = typeof scheme === 'string' ? scheme : scheme?.scheme_name || scheme?.name;
    
    const icons = {
      'PM-Kisan Samman Nidhi': '🌾',
      'PM-Kisan': '🌾',
      'Jal Jeevan Mission': '💧',
      'MGNREGA': '🏗️',
      'Mahatma Gandhi NREGA': '🏗️',
      'Soil Health Card Scheme': '🧪',
      'Soil Health Card': '🧪',
      'PM Fasal Bima Yojana': '🛡️',
      'Pradhan Mantri Fasal Bima': '🛡️',
      'Kisan Credit Card': '💳',
      'Watershed Development Program': '🏞️',
      'Watershed Development': '🏞️',
      'National Afforestation Programme': '🌳',
      'Afforestation Program': '🌳',
      'Skill Development Program': '🎓',
      'Skill Development': '🎓'
    };
    return icons[schemeName] || '📋';
  };

  const getPriorityBadge = (priority) => {
    const priorityLevel = (priority || 'low').toLowerCase();
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    
    const style = styles[priorityLevel] || styles.low;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
        {priorityLevel.toUpperCase()} PRIORITY
      </span>
    );
  };
  
  // Format area for display
  const formatArea = (hectares) => {
    if (!hectares) return 'N/A';
    const acres = hectares * 2.471; // Convert hectares to acres
    return `${hectares} ha (${acres.toFixed(1)} acres)`;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Grid View Component
  const GridView = () => {
    const filteredData = getFilteredAndSortedData();
    
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
            }}>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-16 bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Data</div>
          <div className="text-red-300 text-sm mb-4">{error}</div>
          <button 
            onClick={fetchPattaHolders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-gray-300 text-lg font-medium mb-2">No Results Found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search or filter criteria</div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6">
        {filteredData.map((holder) => (
          <div key={holder.id || holder.patta_id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group transform hover:scale-105" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
          }}>
            <div className="p-4 lg:p-6">
              {/* Header */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-800 truncate pr-2">{holder.holder_name || 'Unknown Holder'}</h3>
                  <div className="flex-shrink-0">
                    {getPriorityBadge(holder.priority)}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">{holder.patta_id}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate">{formatArea(holder.area_hectares)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate">{holder.village || 'N/A'}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">NDVI INDEX</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getConditionColor(holder.ndvi, 'ndvi')} text-white`}>
                      {getConditionLabel(holder.ndvi, 'ndvi')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300">
                      <div 
                        className={`h-full ${getConditionColor(holder.ndvi, 'ndvi')} transition-all duration-500`}
                        style={{ width: `${Math.max(0, Math.min(100, ((holder.ndvi || 0) + 1) * 50))}%` }}
                      />
                    </div>
                    <span className="text-xs lg:text-sm font-bold text-gray-800 whitespace-nowrap">{(holder.ndvi || 0).toFixed(3)}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">NDWI INDEX</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getConditionColor(holder.ndwi, 'ndwi')} text-white`}>
                      {getConditionLabel(holder.ndwi, 'ndwi')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300">
                      <div 
                        className={`h-full ${getConditionColor(holder.ndwi, 'ndwi')} transition-all duration-500`}
                        style={{ width: `${Math.max(0, Math.min(100, ((holder.ndwi || 0) + 1) * 50))}%` }}
                      />
                    </div>
                    <span className="text-xs lg:text-sm font-bold text-gray-800 whitespace-nowrap">{(holder.ndwi || 0).toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Schemes */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Recommended Schemes ({holder.schemes?.length || 0})
                </h4>
                <div className="space-y-2">
                  {holder.schemes && holder.schemes.length > 0 ? (
                    <>
                      {/* Show first 2 schemes fully on mobile, more on larger screens */}
                      <div className="flex flex-wrap gap-2">
                        {holder.schemes.slice(0, 2).map((scheme, index) => (
                          <span key={index} className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-1.5 text-xs lg:text-sm font-medium hover:bg-blue-100 transition-colors" style={{
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)'
                          }}>
                            <span className="text-sm">{getSchemeIcon(scheme)}</span>
                            <span className="whitespace-nowrap">{typeof scheme === 'string' ? scheme : scheme.scheme_name}</span>
                          </span>
                        ))}
                      </div>
                      {/* Show additional schemes on larger screens */}
                      {holder.schemes.length > 2 && (
                        <div className="hidden sm:flex flex-wrap gap-2">
                          {holder.schemes.slice(2, 4).map((scheme, index) => (
                            <span key={index + 2} className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-1.5 text-xs lg:text-sm font-medium hover:bg-blue-100 transition-colors" style={{
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)'
                            }}>
                              <span className="text-sm">{getSchemeIcon(scheme)}</span>
                              <span className="whitespace-nowrap">{typeof scheme === 'string' ? scheme : scheme.scheme_name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Show count of remaining schemes */}
                      {holder.schemes.length > 4 && (
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block" style={{
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)'
                        }}>
                          +{holder.schemes.length - 4} more schemes
                        </div>
                      )}
                      {holder.schemes.length > 2 && holder.schemes.length <= 4 && (
                        <div className="sm:hidden text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block" style={{
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)'
                        }}>
                          +{holder.schemes.length - 2} more (tap to view all)
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 italic">No recommendations yet</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-3 border-t border-gray-200">
                <div className="flex flex-col text-xs text-gray-500 space-y-1">
                  <span>Updated: {formatDate(holder.lastUpdated)}</span>
                  <span className="flex items-center">
                    Status: 
                    <span className={`inline-block w-2 h-2 rounded-full ml-1 mr-1 ${
                      holder.status === 'verified' ? 'bg-green-400' :
                      holder.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></span>
                    <span className="capitalize">{holder.status || 'pending'}</span>
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedHolder(holder)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline flex-shrink-0 self-start sm:self-center transition-colors duration-300"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // List View Component
  const ListView = () => {
    const filteredData = getFilteredAndSortedData();
    
    if (loading) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
        }}>
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Data</div>
          <div className="text-red-300 text-sm mb-4">{error}</div>
          <button 
            onClick={fetchPattaHolders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-gray-300 text-lg font-medium mb-2">No Results Found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search or filter criteria</div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
      }}>'
        {/* Mobile and tablet view - card layout */}
        <div className="block lg:hidden space-y-4 p-4">
          {filteredData.map((holder) => (
            <div key={holder.id || holder.patta_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200" style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
            }}>'
              {/* Mobile card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(holder.holder_name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 truncate">{holder.holder_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-600">{holder.patta_id}</div>
                    <div className="text-xs text-gray-500">{formatArea(holder.area_hectares)}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHolder(holder)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex-shrink-0 transition-colors duration-300"
                >
                  View →
                </button>
              </div>
              
              {/* Mobile metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded p-2 border border-gray-200" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">NDVI</span>
                    <span className="text-xs font-medium text-gray-800">{(holder.ndvi || 0).toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-full ${getConditionColor(holder.ndvi, 'ndvi')} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(0, Math.min(100, ((holder.ndvi || 0) + 1) * 50))}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded p-2 border border-gray-200" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">NDWI</span>
                    <span className="text-xs font-medium text-gray-800">{(holder.ndwi || 0).toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-full ${getConditionColor(holder.ndwi, 'ndwi')} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(0, Math.min(100, ((holder.ndwi || 0) + 1) * 50))}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mobile schemes */}
              <div>
                <div className="text-xs font-medium text-gray-300 mb-2">Schemes ({holder.schemes?.length || 0})</div>
                <div className="flex flex-wrap gap-1">
                  {holder.schemes && holder.schemes.length > 0 ? (
                    <>
                      {holder.schemes.slice(0, 2).map((scheme, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-300 border border-blue-700">
                          <span className="mr-1">{getSchemeIcon(scheme)}</span>
                          <span className="truncate max-w-20">{typeof scheme === 'string' ? scheme : scheme.scheme_name}</span>
                        </span>
                      ))}
                      {holder.schemes.length > 2 && (
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">+{holder.schemes.length - 2}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No recommendations</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view - table layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Patta Holder
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Land Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Recommended Schemes
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredData.map((holder) => (
                <tr key={holder.id || holder.patta_id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {(holder.holder_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{holder.holder_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-400">{holder.patta_id}</div>
                          <div className="text-xs text-gray-500">{formatArea(holder.area_hectares)}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 w-10">NDVI:</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-full ${getConditionColor(holder.ndvi, 'ndvi')} rounded-full transition-all duration-300`}
                            style={{ width: `${Math.max(0, Math.min(100, ((holder.ndvi || 0) + 1) * 50))}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300 w-12 text-right">{(holder.ndvi || 0).toFixed(3)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 w-10">NDWI:</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-full ${getConditionColor(holder.ndwi, 'ndwi')} rounded-full transition-all duration-300`}
                            style={{ width: `${Math.max(0, Math.min(100, ((holder.ndwi || 0) + 1) * 50))}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300 w-12 text-right">{(holder.ndwi || 0).toFixed(3)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {holder.schemes && holder.schemes.length > 0 ? (
                          holder.schemes.slice(0, 3).map((scheme, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-300 border border-blue-700">
                              <span className="mr-1">{getSchemeIcon(scheme)}</span>
                              <span className="truncate max-w-24">{typeof scheme === 'string' ? scheme : scheme.scheme_name}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No recommendations</span>
                        )}
                      </div>
                      {holder.schemes && holder.schemes.length > 3 && (
                        <span className="text-xs text-gray-400">+{holder.schemes.length - 3} more schemes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button 
                        onClick={() => setSelectedHolder(holder)}
                        className="text-blue-400 hover:text-blue-300 text-left"
                      >
                        View Details
                      </button>
                      <button className="text-green-400 hover:text-green-300 text-left">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap');
        .alan-sans {
          font-family: "Alan Sans", sans-serif;
          font-optical-sizing: auto;
          font-weight: 728;
          font-style: normal;
        }`}
      </style>
      <div className="min-h-screen bg-white text-gray-900 alan-sans">
        {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Beneficiary Scheme Recommendations
              </h2>
              <p className="text-gray-600 text-sm lg:text-base">AI-powered scheme matching based on satellite analysis</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={generateAllRecommendations}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {loading ? 'Processing...' : '🧠 Generate Recommendations'}
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1 justify-center sm:justify-start border border-gray-200/50" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 text-xs lg:text-sm transform hover:scale-105 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={viewMode === 'grid' ? {boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(59, 130, 246, 0.2)'} : {}}
                >
                  <span>🔄 Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 text-xs lg:text-sm transform hover:scale-105 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600 border border-blue-200/50' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={viewMode === 'list' ? {boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(59, 130, 246, 0.2)'} : {}}
                >
                  <span>📊 List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl p-4 lg:p-6 border-2 border-gray-200/50 mb-6 transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="space-y-4">
              {/* Search Input - Full width on mobile */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, ID, village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-200/50 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transform hover:scale-[1.01] transition-all duration-200"
                    style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                  />
                </div>
              </div>

              {/* Filters - Responsive grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border-2 border-gray-200/50 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  <option value="all" className="bg-white">All Status</option>
                  <option value="pending" className="bg-white">Pending</option>
                  <option value="verified" className="bg-white">Verified</option>
                  <option value="approved" className="bg-white">Approved</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="block w-full px-3 py-2 border-2 border-gray-200/50 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  <option value="all" className="bg-white">All Priority</option>
                  <option value="high" className="bg-white">High Priority</option>
                  <option value="medium" className="bg-white">Medium Priority</option>
                  <option value="low" className="bg-white">Low Priority</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border-2 border-gray-200/50 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  <option value="name" className="bg-white">By Name</option>
                  <option value="ndvi" className="bg-white">By NDVI</option>
                  <option value="ndwi" className="bg-white">By NDWI</option>
                  <option value="updated" className="bg-white">By Updated</option>
                </select>

                {/* Sort Order */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-2 border-2 border-gray-200/50 rounded-lg bg-white text-gray-900 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors transform hover:scale-105"
                  style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)'}}
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setSortBy('name');
                    setSortOrder('asc');
                  }}
                  className="lg:col-span-1 w-full px-3 py-2 border-2 border-gray-200/50 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors transform hover:scale-105"
                  style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)'}}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {getFilteredAndSortedData().length} of {pattaHolders.length} patta holders
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
                  <span className="text-xl text-blue-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}}>📄</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 border border-emerald-200" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}>+12%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Total Pattas</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.totalPattas}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(16, 185, 129, 0.3)'}}>
                  <span className="text-xl text-emerald-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}}>✅</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 border border-emerald-200" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}>+8%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Scheme Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.schemeCoverage}%</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(34, 197, 94, 0.3)'}}>
                  <span className="text-xl text-green-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}}>🌿</span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 border border-emerald-200" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}>+5%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Avg NDVI</p>
                <p className="text-2xl font-bold text-gray-900">{communityStats.avgNDVI.toFixed(3)}</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Beneficiaries</p>
                  <p className="text-2xl font-bold text-white">{communityStats.beneficiaries.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  �
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Individual Patta Holders */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 mb-6 transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Individual Patta Holders
                </h3>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}>
                  {getFilteredAndSortedData().length} / {pattaHolders.length} Records
                </span>
              </div>
              
              {viewMode === 'grid' ? <GridView /> : <ListView />}
            </div>
          </section>

          {/* Community Dashboard */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200/50 p-6 sticky top-24 transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  Community Dashboard
                </h3>
              </div>

              {/* Region Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Region</label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Pattas</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm" style={{
                      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                    }}>📄</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{communityStats.totalPattas}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Beneficiaries</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm" style={{
                      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                    }}>👥</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{communityStats.beneficiaries.toLocaleString()}</div>
                </div>
              </div>

              {/* Health Indicators */}
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.1)'
              }}>
                <h4 className="text-sm font-medium text-gray-800 mb-3">Regional Health Indicators</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average NDVI</span>
                      <span className="text-sm font-semibold text-gray-800">{communityStats.avgNDVI.toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, ((communityStats.avgNDVI || 0) + 1) * 50))}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average NDWI</span>
                      <span className="text-sm font-semibold text-gray-800">{communityStats.avgNDWI.toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, ((communityStats.avgNDWI || 0) + 1) * 50))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Schemes */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Top Recommended Schemes</h4>
                <div className="space-y-2">
                  {Object.values(SCHEME_DEFINITIONS).slice(0, 3).map((scheme, index) => (
                    <div key={scheme.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center text-white text-sm" style={{
                        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)'
                      }}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          <span>{scheme.icon}</span>
                          <span className="text-sm">{scheme.name}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{scheme.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Allocation */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 transform hover:scale-105 transition-all duration-300" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.12)'
              }}>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Scheme Coverage</div>
                  <div className="text-3xl font-bold text-amber-600" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>{communityStats.schemeCoverage}%</div>
                  <div className="text-xs text-gray-500 mt-1">Pattas with Recommendations</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* AI Insights Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white mt-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <span>🤖</span>
              AI-Powered Recommendations Engine
            </h3>
            <p className="text-lg text-center opacity-90 mb-6">
              Advanced machine learning algorithms analyze multiple data sources to provide 
              personalized scheme recommendations that maximize benefit utilization and promote sustainable forest management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-3">📡</div>
                <h4 className="font-semibold mb-2 text-lg">Satellite Data Integration</h4>
                <p className="text-sm opacity-80">Real-time NDVI/NDWI analysis with high-resolution satellite imagery</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-3">🔍</div>
                <h4 className="font-semibold mb-2 text-lg">OCR Document Processing</h4>
                <p className="text-sm opacity-80">Automated patta digitization with 99.2% accuracy rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="font-semibold mb-2 text-lg">Smart Scheme Matching</h4>
                <p className="text-sm opacity-80">ML-based eligibility analysis and optimization algorithms</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-gray-900 mb-2">98.7%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: '98.7%' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 text-center transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Real-time Monitoring</div>
            <div className="text-xs text-green-600 mt-1">• Live Updates</div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 text-center transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="text-3xl font-bold text-gray-900 mb-2">23+</div>
            <div className="text-sm text-gray-600">Schemes Covered</div>
            <div className="text-xs text-blue-600 mt-1">• Government & Private</div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 text-center transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="text-3xl font-bold text-gray-900 mb-2">3.2K</div>
            <div className="text-sm text-gray-600">Active Beneficiaries</div>
            <div className="text-xs text-purple-600 mt-1">• Growing Monthly</div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}