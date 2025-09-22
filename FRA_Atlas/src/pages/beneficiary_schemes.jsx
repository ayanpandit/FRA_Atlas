import React, { useState } from 'react';

export default function BeneficiarySchemes() {
  const [selectedRegion, setSelectedRegion] = useState('Bhopal Forest Division');
  const [selectedHolder, setSelectedHolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const pattaHolders = [
    {
      id: 'FRA001',
      name: 'Ramesh Kumar',
      landArea: '2.5 acres',
      ndvi: 0.7,
      ndwi: 0.3,
      schemes: ['PM-Kisan', 'Soil Health Card', 'Pradhan Mantri Fasal Bima'],
      village: 'Bhopal Village',
      block: 'Bhopal Block',
      district: 'Bhopal',
      contact: '+91 9876543210',
      priority: 'high',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'FRA002', 
      name: 'Sunita Devi',
      landArea: '1.8 acres',
      ndvi: 0.4,
      ndwi: 0.1,
      schemes: ['Jal Jeevan Mission', 'MGNREGA', 'PM-Kisan'],
      village: 'Sehore Village',
      block: 'Sehore Block',
      district: 'Sehore',
      contact: '+91 9876543211',
      priority: 'medium',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'FRA003',
      name: 'Mohan Singh',
      landArea: '3.2 acres', 
      ndvi: 0.8,
      ndwi: 0.6,
      schemes: ['Pradhan Mantri Fasal Bima', 'Kisan Credit Card', 'Watershed Development'],
      village: 'Vidisha Village',
      block: 'Vidisha Block',
      district: 'Vidisha',
      contact: '+91 9876543212',
      priority: 'low',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'FRA004',
      name: 'Priya Sharma',
      landArea: '4.1 acres',
      ndvi: 0.9,
      ndwi: 0.7,
      schemes: ['Afforestation Program', 'Skill Development', 'PM-Kisan'],
      village: 'Raisen Village',
      block: 'Raisen Block',
      district: 'Raisen',
      contact: '+91 9876543213',
      priority: 'high',
      lastUpdated: '2024-01-22'
    }
  ];

  const communityData = {
    totalPattas: 247,
    avgNDVI: 0.62,
    avgNDWI: 0.31,
    prioritySchemes: ['Watershed Development', 'Afforestation Program', 'Skill Development'],
    beneficiaries: 1847,
    budgetAllocation: '₹2.4 Cr',
    schemeCoverage: '87%',
    avgBenefits: '₹42,500/household'
  };

  const getConditionColor = (value, type) => {
    if (type === 'ndvi') {
      return value > 0.6 ? 'bg-emerald-500' : value > 0.4 ? 'bg-amber-500' : 'bg-rose-500';
    } else {
      return value > 0.4 ? 'bg-blue-500' : value > 0.2 ? 'bg-amber-500' : 'bg-rose-500';
    }
  };

  const getConditionLabel = (value, type) => {
    if (type === 'ndvi') {
      return value > 0.6 ? 'Excellent' : value > 0.4 ? 'Moderate' : 'Poor';
    } else {
      return value > 0.4 ? 'Adequate' : value > 0.2 ? 'Moderate' : 'Low';
    }
  };

  const getSchemeIcon = (scheme) => {
    const icons = {
      'PM-Kisan': '🌾',
      'Jal Jeevan Mission': '💧',
      'MGNREGA': '🏗️',
      'Soil Health Card': '🧪',
      'Pradhan Mantri Fasal Bima': '🛡️',
      'Kisan Credit Card': '💳',
      'Watershed Development': '🏞️',
      'Afforestation Program': '🌳',
      'Skill Development': '🎓'
    };
    return icons[scheme] || '📋';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
        {priority.toUpperCase()} PRIORITY
      </span>
    );
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {pattaHolders.map((holder) => (
        <div key={holder.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{holder.name}</h3>
                  {getPriorityBadge(holder.priority)}
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{holder.id}</span>
                  <span>•</span>
                  <span>{holder.landArea}</span>
                  <span>•</span>
                  <span>{holder.village}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700">NDVI INDEX</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getConditionColor(holder.ndvi, 'ndvi')} text-white`}>
                    {getConditionLabel(holder.ndvi, 'ndvi')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white rounded-full h-2 overflow-hidden border">
                    <div 
                      className={`h-full ${getConditionColor(holder.ndvi, 'ndvi')} transition-all duration-500`}
                      style={{ width: `${holder.ndvi * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{holder.ndvi}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-700">NDWI INDEX</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getConditionColor(holder.ndwi, 'ndwi')} text-white`}>
                    {getConditionLabel(holder.ndwi, 'ndwi')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white rounded-full h-2 overflow-hidden border">
                    <div 
                      className={`h-full ${getConditionColor(holder.ndwi, 'ndwi')} transition-all duration-500`}
                      style={{ width: `${holder.ndwi * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{holder.ndwi}</span>
                </div>
              </div>
            </div>

            {/* Recommended Schemes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Recommended Schemes
              </h4>
              <div className="flex flex-wrap gap-2">
                {holder.schemes.map((scheme) => (
                  <span key={scheme} className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-100 transition-colors">
                    <span className="text-base">{getSchemeIcon(scheme)}</span>
                    <span>{scheme}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Updated: {new Date(holder.lastUpdated).toLocaleDateString('en-IN')}
              </span>
              <button 
                onClick={() => setSelectedHolder(holder)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Patta Holder
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Land Metrics
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Recommended Schemes
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pattaHolders.map((holder) => (
            <tr key={holder.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {holder.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{holder.name}</div>
                      <div className="text-sm text-gray-500">{holder.id}</div>
                      <div className="text-xs text-gray-400">{holder.landArea}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">NDVI:</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full ${getConditionColor(holder.ndvi, 'ndvi')} rounded-full`}
                        style={{ width: `${holder.ndvi * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{holder.ndvi}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">NDWI:</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full ${getConditionColor(holder.ndwi, 'ndwi')} rounded-full`}
                        style={{ width: `${holder.ndwi * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{holder.ndwi}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {holder.schemes.slice(0, 3).map((scheme) => (
                    <span key={scheme} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      {getSchemeIcon(scheme)} {scheme}
                    </span>
                  ))}
                  {holder.schemes.length > 3 && (
                    <span className="text-xs text-gray-500">+{holder.schemes.length - 3} more</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  onClick={() => setSelectedHolder(holder)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button className="text-green-600 hover:text-green-900">
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Beneficiary Scheme Recommendations
              </h2>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-sm">🔄 Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-sm">📊 List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pattas</p>
                  <p className="text-2xl font-bold text-gray-900">247</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  📄
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheme Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  ✅
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Benefits</p>
                  <p className="text-2xl font-bold text-gray-900">₹42.5K</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  💰
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  📈
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Individual Patta Holders */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Individual Patta Holders
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {pattaHolders.length} Records
                </span>
              </div>
              
              {viewMode === 'grid' ? <GridView /> : <ListView />}
            </div>
          </section>

          {/* Community Dashboard */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  Community Dashboard
                </h3>
              </div>

              {/* Region Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Region</label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option>Bhopal Forest Division</option>
                  <option>Indore Forest Division</option>
                  <option>Jabalpur Forest Division</option>
                  <option>Gwalior Forest Division</option>
                </select>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">Total Pattas</span>
                    <span className="text-emerald-600">📄</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">{communityData.totalPattas}</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Beneficiaries</span>
                    <span className="text-blue-600">👥</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{communityData.beneficiaries.toLocaleString()}</div>
                </div>
              </div>

              {/* Health Indicators */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Regional Health Indicators</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average NDVI</span>
                      <span className="text-sm font-semibold text-gray-900">{communityData.avgNDVI}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${communityData.avgNDVI * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Average NDWI</span>
                      <span className="text-sm font-semibold text-gray-900">{communityData.avgNDWI}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${communityData.avgNDWI * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Schemes */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Priority Community Schemes</h4>
                <div className="space-y-2">
                  {communityData.prioritySchemes.map((scheme, index) => (
                    <div key={scheme} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span>{getSchemeIcon(scheme)}</span>
                          {scheme}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Allocation */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-amber-700 mb-1">Total Budget Allocation</div>
                  <div className="text-3xl font-bold text-amber-900">{communityData.budgetAllocation}</div>
                  <div className="text-xs text-amber-600 mt-1">Current Financial Year</div>
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Real-time Monitoring</div>
            <div className="text-xs text-green-600 mt-1">• Live Updates</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-gray-900 mb-2">23+</div>
            <div className="text-sm text-gray-600">Schemes Covered</div>
            <div className="text-xs text-blue-600 mt-1">• Government & Private</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-gray-900 mb-2">3.2K</div>
            <div className="text-sm text-gray-600">Active Beneficiaries</div>
            <div className="text-xs text-purple-600 mt-1">• Growing Monthly</div>
          </div>
        </div>
      </main>
    </div>
  );
}