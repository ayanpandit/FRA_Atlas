import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PattaManagement = () => {
  // File input ref for upload
  const fileInputRef = useRef(null);

  // Handler for file select (click on upload area)
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  // Grid view renderer
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedPattas.map((patta) => (
        <div key={patta.patta_id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{patta.patta_id}</h3>
                </div>
                <p className="text-gray-800 font-medium text-base">{patta.holder_name}</p>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📅</span>
                <span>Date: {patta.date_applied ? new Date(patta.date_applied).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">🔖</span>
                <span>Status: {getStatusBadge(patta.status)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📍</span>
                <span>{patta.village}, {patta.district}, {patta.state}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📏</span>
                <span>{patta.area_hectares} ha</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">🌳</span>
                <span>{patta.right_type}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDetails(patta)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  title="View Details"
                >
                  <span className="text-sm">👁️ View</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {patta.surveyNumber}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  // Priority badge renderer
  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      high: 'bg-red-100 text-red-800 border-red-300',
      normal: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    const priorityIcons = {
      high: '🔴',
      normal: '🔵',
      low: '⚪'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${priorityStyles[priority]}`}>
        <span className="mr-1">{priorityIcons[priority]}</span>
        {priority ? priority.toUpperCase() : 'PRIORITY'}
      </span>
    );
  };
  // Small labeled info card used in the details modal
  const InfoCard = ({ label, value }) => (
    <div className="bg-slate-50 rounded-lg p-3">
      <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
      <span className="text-slate-900 font-medium">{value ?? '—'}</span>
    </div>
  );
  // Show patta details modal
  const handleViewDetails = (patta) => {
    setSelectedPatta(patta);
    // create a shallow editable copy so inputs in the modal can be changed
    setEditablePatta({ ...patta });
    setShowDetailsModal(true);
  };
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [editablePatta, setEditablePatta] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pattas, setPattas] = useState([]);
  const [loadingPattas, setLoadingPattas] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    let mounted = true;
    const fetchAllPattasWithOwners = async () => {
      setLoadingPattas(true);
      try {
        // fetch all pattas using the Supabase anon client
        // fetch all pattas without assuming a specific order column (some installs may not have date_entered)
        const { data: pattasData, error: pattasErr } = await supabase.from('pattas').select('*');
        console.debug('Supabase pattas fetch', { pattasData, pattasErr });
        if (pattasErr) {
          console.warn('Failed to fetch pattas:', pattasErr.message || pattasErr);
          if (mounted) {
            setPattas([]);
            setLoadingPattas(false);
          }
          return;
        }

        const rows = pattasData || [];

        // collect unique owner ids
        const ownerIdsRaw = Array.from(new Set(rows.map(r => r.owner_id).filter(Boolean)));
        let profilesById = {};

        // Only attempt to fetch profiles/users when owner ids look like UUIDs to avoid 404s for values like 'guest'
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const ownerIds = ownerIdsRaw.filter(id => uuidRegex.test(String(id)));

        if (ownerIds.length > 0) {
          // try profiles table first, fallback to users
          try {
            const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, full_name, email').in('id', ownerIds);
            if (!profErr && profiles && profiles.length > 0) {
              profilesById = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            } else {
              const { data: users, error: usersErr } = await supabase.from('users').select('id, full_name, email').in('id', ownerIds);
              if (!usersErr && users && users.length > 0) profilesById = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            }
          } catch (e) {
            console.warn('Error fetching owner profiles:', e.message || e);
          }
        }

        // attach owner info to pattas for UI
        const enriched = rows.map(r => ({
          ...r,
          owner_full_name: (profilesById[r.owner_id] && (profilesById[r.owner_id].full_name || profilesById[r.owner_id].name)) || r.owner_name || r.owner_id || 'Unknown',
          owner_email: (profilesById[r.owner_id] && profilesById[r.owner_id].email) || r.owner_email || ''
        }));

        // Sort client-side by available date fields (newest first)
        enriched.sort((a, b) => {
          const aDate = new Date(a.date_applied || a.created_at || 0).getTime();
          const bDate = new Date(b.date_applied || b.created_at || 0).getTime();
          return bDate - aDate;
        });

        if (mounted) {
          setPattas(enriched);
          setLoadingPattas(false);
        }
      } catch (err) {
        console.error('Failed to load pattas for management', err);
        if (mounted) {
          setPattas([]);
          setLoadingPattas(false);
        }
      }
    };
    fetchAllPattasWithOwners();
    return () => { mounted = false };
  }, []);

  // Filter pattas based on active tab and filters
  const getFilteredPattas = () => {
    let filtered = pattas;
    if (activeTab !== 'all') {
      filtered = filtered.filter(patta => patta.status === activeTab);
    }
    if (searchQuery) {
      filtered = filtered.filter(patta =>
        patta.holder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patta.patta_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patta.village?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (districtFilter !== 'all') {
      filtered = filtered.filter(patta => patta.district === districtFilter);
    }
    return filtered;
  };
  const districts = ['All Districts', 'Saharsa', 'Madhubani', 'Darbhanga', 'Begusarai', 'Muzaffarpur', 'Patna', 'Gaya', 'Bhagalpur'];
  const tabs = [
    { id: 'all', label: 'All Pattas', count: pattas.length, icon: '📋' },
    { id: 'pending', label: 'Pending Review', count: pattas.filter(p => p.status === 'pending').length, icon: '⏳' },
    { id: 'verified', label: 'Verified', count: pattas.filter(p => p.status === 'verified').length, icon: '✅' },
    { id: 'cancelled', label: 'Cancelled', count: pattas.filter(p => p.status === 'cancelled' || p.status === 'rejected').length, icon: '❌' }
  ];

  const filteredPattas = getFilteredPattas();
  const totalPages = Math.ceil(filteredPattas.length / itemsPerPage);
  const paginatedPattas = filteredPattas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200'
    };
    const statusText = {
      pending: 'Pending Review',
      verified: 'Verified & Approved',
      cancelled: 'Cancelled'
    };
    const statusIcons = {
      pending: '⏳',
      verified: '✅',
      cancelled: '❌'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        <span className="mr-1.5">{statusIcons[status]}</span>
        {statusText[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                Patta Management System
              </h1>
              <div className="text-sm text-slate-500">
                <span className="mr-4">Loading: {String(loadingPattas)}</span>
                <span>Patta count: <strong>{pattas.length}</strong></span>
              </div>
              {/* List preview (shows current page pattas as cards) */}
              <div className="mt-4">
                <div className="text-sm text-slate-600 mb-2">Showing {filteredPattas.length} pattas — page {currentPage}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedPattas.map(p => (
                    <div key={p.patta_id || p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-slate-500">{p.patta_id}</div>
                          <div className="text-lg font-semibold text-slate-900">{p.holder_name || p.owner_full_name || 'Unknown Holder'}</div>
                          <div className="text-xs text-slate-500">{p.village}{p.district ? ` · ${p.district}` : ''}{p.state ? ` · ${p.state}` : ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{p.area_hectares ? `${p.area_hectares} ha` : ''}</div>
                          <div className="mt-2">{getStatusBadge(p.status)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-slate-600">Applied: {p.date_applied ? new Date(p.date_applied).toLocaleDateString() : 'N/A'}</div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleViewDetails(p)} className="text-blue-600 hover:underline text-sm">View</button>
                          <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(p)); alert('Copied JSON to clipboard'); }} className="text-slate-600 text-sm">Copy</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 text-lg">Manage land records efficiently and securely</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <span className="text-lg">📤</span>
                <span>Upload New Patta</span>
              </button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {[
              {
                label: 'Total Pattas',
                value: pattas.length,
                color: 'blue',
                icon: '📋',
                change: '+12%'
              },
              {
                label: 'Pending Review',
                value: pattas.filter(p => p.status === 'pending').length,
                color: 'amber',
                icon: '⏳',
                change: '+5%'
              },
              {
                label: 'Verified',
                value: pattas.filter(p => p.status === 'verified').length,
                color: 'emerald',
                icon: '✅',
                change: '+8%'
              },
              {
                label: 'Rejected',
                value: pattas.filter(p => p.status === 'rejected').length,
                color: 'red',
                icon: '❌',
                change: '-2%'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-xs font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-200 bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
              <nav className="flex space-x-1 mb-4 lg:mb-0 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`py-1 px-2 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showFilters 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Toggle Filters"
                >
                  <span className="text-sm">🔍 Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-6 bg-slate-50 border-b border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">🔍</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Patta ID, Holder Name, Village, or Survey Number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 text-sm"
                  >
                    {districts.map(district => (
                        <option key={district} value={district === 'All Districts' ? 'all' : district}>
                          {district}
                        </option>
                    ))}
                </select>
                  </div>
                </div>
                {viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                {loadingPattas ? (
                  <div className="p-8 text-center">Loading pattas...</div>
                ) : pattas.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">No pattas found. Ensure your Supabase project has a <code>pattas</code> table and the anon key has read access.</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patta Details</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date & Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedPattas.map((patta) => (
                        <tr key={patta.patta_id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">{patta.patta_id}</div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{patta.patta_id}</div>
                                <div className="text-sm text-slate-600">{patta.holder_name}</div>
                                <div className="text-xs text-slate-500">{patta.area_hectares} ha • {patta.right_type}</div>
                                <div className="text-xs text-slate-400">Owner: {patta.owner_full_name} {patta.owner_email ? `· ${patta.owner_email}` : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-medium">{patta.village}</div>
                            <div className="text-sm text-slate-500">{patta.district}, {patta.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="text-sm text-slate-900 font-medium">{patta.date_applied ? new Date(patta.date_applied).toLocaleString() : 'N/A'}</div>
                              <div className="flex items-center space-x-2">{getStatusBadge(patta.status)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleViewDetails(patta)} className="text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200" title="View Details">👁️ View</button>
                              <button className="text-green-600 hover:text-green-800 px-3 py-1.5 rounded-md hover:bg-green-50 transition-all duration-200" title="Download">📥 Download</button>
                              <button className="text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all duration-200" title="More Options">⋮</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              loadingPattas ? (
                <div className="p-8 text-center">Loading pattas...</div>
              ) : pattas.length === 0 ? (
                <div className="p-8 text-center text-slate-600">No pattas available.</div>
              ) : (
                <GridView />
              )
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-slate-50 rounded-lg p-4 mt-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-slate-700 font-medium">
                      Showing <span className="font-bold text-blue-600">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-bold text-blue-600">{Math.min(currentPage * itemsPerPage, filteredPattas.length)}</span> of{' '}
                      <span className="font-bold text-blue-600">{filteredPattas.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <span>← Previous</span>
                    </button>
                    
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = currentPage === pageNumber;
                        const showPage = pageNumber === 1 || pageNumber === totalPages || 
                                        Math.abs(pageNumber - currentPage) <= 1;
                        
                        if (!showPage && pageNumber !== 2 && pageNumber !== totalPages - 1) {
                          if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                            return <span key={pageNumber} className="px-2 py-2 text-slate-400">...</span>;
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                              isCurrentPage
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-700 bg-white border border-gray-300 hover:bg-slate-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <span>Next →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Patta Details Modal */}
      {showDetailsModal && selectedPatta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                    {selectedPatta.patta_id}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Patta Details</h3>
                    <p className="text-slate-600">{selectedPatta.patta_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                selectedPatta.status === 'verified' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : selectedPatta.status === 'pending'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(selectedPatta.status)}
                    {selectedPatta.priority === 'high' && getPriorityBadge(selectedPatta.priority)}
                  </div>
                  {(selectedPatta.verified_by || selectedPatta.verifiedBy) && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">Verified by</p>
                      <p className="text-sm text-slate-600">{selectedPatta.verified_by || selectedPatta.verifiedBy}</p>
                      <p className="text-xs text-slate-500">{selectedPatta.date_verified ? new Date(selectedPatta.date_verified).toLocaleDateString('en-IN') : (selectedPatta.verifiedDate ? new Date(selectedPatta.verifiedDate).toLocaleDateString('en-IN') : '')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Editable fields bound to editablePatta */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Patta ID</label>
                      <input value={editablePatta?.patta_id || ''} onChange={e => setEditablePatta(prev => ({ ...prev, patta_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Holder Name</label>
                      <input value={editablePatta?.holder_name || ''} onChange={e => setEditablePatta(prev => ({ ...prev, holder_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                      <input value={editablePatta?.category || ''} onChange={e => setEditablePatta(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                      <input value={editablePatta?.village || ''} onChange={e => setEditablePatta(prev => ({ ...prev, village: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <input value={editablePatta?.district || ''} onChange={e => setEditablePatta(prev => ({ ...prev, district: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input value={editablePatta?.state || ''} onChange={e => setEditablePatta(prev => ({ ...prev, state: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinates</label>
                      <input value={Array.isArray(editablePatta?.coordinates) ? editablePatta.coordinates.join(', ') : (editablePatta?.coordinates || '')} onChange={e => setEditablePatta(prev => ({ ...prev, coordinates: e.target.value.includes(',') ? e.target.value.split(',').map(s=>s.trim()) : e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Area (hectares)</label>
                      <input type="number" step="0.01" value={editablePatta?.area_hectares || ''} onChange={e => setEditablePatta(prev => ({ ...prev, area_hectares: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Right Type</label>
                      <input value={editablePatta?.right_type || ''} onChange={e => setEditablePatta(prev => ({ ...prev, right_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                      <select value={editablePatta?.status || 'pending'} onChange={e => setEditablePatta(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                        <option value="rejected">rejected</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date Entered</label>
                      <input type="datetime-local" value={editablePatta?.date_applied ? new Date(editablePatta.date_applied).toISOString().slice(0,16) : ''} onChange={e => setEditablePatta(prev => ({ ...prev, date_applied: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rejected Message</label>
                      <input value={editablePatta?.rejected_message || editablePatta?.reject_message || ''} onChange={e => setEditablePatta(prev => ({ ...prev, rejected_message: e.target.value, reject_message: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-semibold text-slate-900 mt-2 mb-2">Recommended Schemes</h5>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const val = editablePatta?.recommended_schemes ?? selectedPatta.recommended_schemes;
                          const arr = val ? (typeof val === 'string' ? JSON.parse(val) : val) : [];
                          if (!arr || arr.length === 0) return <span className="text-sm text-slate-600">No schemes allotted</span>;
                          return arr.map((s, i) => <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{s}</span>);
                        } catch (e) {
                          return <span className="text-sm text-slate-600">{String(editablePatta?.recommended_schemes || selectedPatta.recommended_schemes || '')}</span>;
                        }
                      })()}
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Schemes (CSV)</label>
                      <input value={Array.isArray(editablePatta?.recommended_schemes) ? editablePatta.recommended_schemes.join(', ') : (editablePatta?.recommended_schemes || '')} onChange={e => setEditablePatta(prev => ({ ...prev, recommended_schemes: e.target.value.includes(',') ? e.target.value.split(',').map(s=>s.trim()) : e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Document</h4>
                  {/* Image preview + download */}
                  {selectedPatta.patta_doc_url ? (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <img src={selectedPatta.patta_doc_url} alt={`${selectedPatta.patta_id} document`} className="w-full h-56 object-contain rounded-md" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-700">Uploaded file: <span className="font-medium">{selectedPatta.patta_doc_filename || selectedPatta.patta_doc_name || 'document'}</span></div>
                        <div className="flex items-center space-x-2">
                          <a href={selectedPatta.patta_doc_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Open</a>
                          <a href={selectedPatta.patta_doc_url} download className="text-sm text-green-600 hover:underline">Download</a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">No document uploaded for this patta.</div>
                  )}

                  <div className="mt-4">
                    <h5 className="text-md font-semibold text-slate-900">Owner</h5>
                    <p className="text-sm text-slate-700">{selectedPatta.owner_full_name}{selectedPatta.owner_email ? ` · ${selectedPatta.owner_email}` : ''}</p>
                    {selectedPatta.owner_phone && <p className="text-sm text-slate-500">{selectedPatta.owner_phone}</p>}
                  </div>
                  {/* Raw JSON / All fields */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-md font-semibold text-slate-900">All Patta Fields</h5>
                      <button onClick={() => setShowRaw(!showRaw)} className="text-sm text-blue-600 hover:underline">{showRaw ? 'Hide' : 'Show'} raw</button>
                    </div>
                    {showRaw ? (
                      <pre className="text-xs overflow-auto max-h-64 bg-white p-3 rounded border border-gray-100">{JSON.stringify(selectedPatta, null, 2)}</pre>
                    ) : (
                      <div className="text-sm text-slate-600">Click "Show raw" to view every field stored for this patta.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Remarks</h4>
                <p className="text-slate-700 leading-relaxed">{selectedPatta.remarks}</p>
              </div>

              {/* Document Section */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl">
                  📄
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Patta Document</h4>
                <p className="text-slate-600 mb-4">{selectedPatta.id}.pdf</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg">
                  📥 Download Document
                </button>
              </div>
            </div>

            {/* action footer with Save / Approve / Reject */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  // save changes
                  if (!editablePatta) return;
                  setIsUpdating(true);
                  try {
                    const toUpdate = { ...editablePatta };
                    // ensure recommended_schemes is stored as JSON array if it's an array-like
                    if (Array.isArray(toUpdate.recommended_schemes)) {
                      toUpdate.recommended_schemes = toUpdate.recommended_schemes;
                    }
                    // prefer primary key id if present, otherwise fall back to patta_id
                    const filter = editablePatta.id ? { column: 'id', value: editablePatta.id } : { column: 'patta_id', value: editablePatta.patta_id };
                    console.debug('Updating patta using filter', filter);
                    const { data, error } = await supabase.from('pattas').update(toUpdate).eq(filter.column, filter.value).select().maybeSingle();
                    if (error) throw error;
                    console.debug('Update result', data);
                    const row = Array.isArray(data) ? data[0] : data;
                    if (!row) {
                      // diagnostic: try to SELECT the row using same filter to see if it exists or if RLS blocked the update
                      try {
                        const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
                        console.debug('Diagnostic select after failed update', { selData, selErr });
                        alert('Update returned no row. Diagnostic select result in console.\nSelect error: ' + (selErr ? (selErr.message || String(selErr)) : 'none') + '\nSelect data: ' + JSON.stringify(selData));
                      } catch (diagE) {
                        console.error('Diagnostic select failed', diagE);
                        alert('Update returned no row and diagnostic select failed: ' + diagE.message || String(diagE));
                      }
                      setIsUpdating(false);
                      return;
                    }
                    // update local list
                    setPattas(prev => prev.map(p => p.patta_id === row.patta_id ? ({ ...p, ...row }) : p));
                    setSelectedPatta(row);
                    setEditablePatta({ ...row });
                  } catch (e) {
                    console.error('Failed to save patta', e.message || e);
                    alert('Failed to save changes: ' + (e.message || e));
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={async () => {
                  // Approve flow: set status to verified
                  if (!editablePatta) return;
                  if (!confirm('Approve this patta and mark as verified?')) return;
                  setIsUpdating(true);
                  try {
                    const filter = editablePatta.id ? { column: 'id', value: editablePatta.id } : { column: 'patta_id', value: editablePatta.patta_id };
                    console.debug('Approving patta using filter', filter);
                    const { data, error } = await supabase.from('pattas').update({ status: 'verified', date_verified: new Date().toISOString() }).eq(filter.column, filter.value).select().maybeSingle();
                    if (error) throw error;
                    console.debug('Approve result', data);
                    const row = Array.isArray(data) ? data[0] : data;
                    if (!row) {
                      try {
                        const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
                        console.debug('Diagnostic select after failed approve', { selData, selErr });
                        alert('Approve returned no row. Diagnostic select result in console.\nSelect error: ' + (selErr ? (selErr.message || String(selErr)) : 'none') + '\nSelect data: ' + JSON.stringify(selData));
                      } catch (diagE) {
                        console.error('Diagnostic select failed', diagE);
                        alert('Approve returned no row and diagnostic select failed: ' + diagE.message || String(diagE));
                      }
                      setIsUpdating(false);
                      return;
                    }
                    setPattas(prev => prev.map(p => p.patta_id === row.patta_id ? ({ ...p, ...row }) : p));
                    setSelectedPatta(row);
                    setEditablePatta({ ...row });
                  } catch (e) {
                    console.error('Failed to approve patta', e.message || e);
                    alert('Failed to approve: ' + (e.message || e));
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                ✅ Approve
              </button>

              <button
                onClick={async () => {
                  // Reject flow: set status to rejected and save reject message
                  if (!editablePatta) return;
                  const msg = prompt('Enter rejection message (optional)', editablePatta.rejected_message || editablePatta.reject_message || '');
                  if (msg === null) return; // cancelled
                  setIsUpdating(true);
                  try {
                    const filter = editablePatta.id ? { column: 'id', value: editablePatta.id } : { column: 'patta_id', value: editablePatta.patta_id };
                    console.debug('Rejecting patta using filter', filter);
                    const { data, error } = await supabase.from('pattas').update({ status: 'rejected', rejected_message: msg, reject_message: msg }).eq(filter.column, filter.value).select().maybeSingle();
                    if (error) throw error;
                    console.debug('Reject result', data);
                    const row = Array.isArray(data) ? data[0] : data;
                    if (!row) {
                      try {
                        const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
                        console.debug('Diagnostic select after failed reject', { selData, selErr });
                        alert('Reject returned no row. Diagnostic select result in console.\nSelect error: ' + (selErr ? (selErr.message || String(selErr)) : 'none') + '\nSelect data: ' + JSON.stringify(selData));
                      } catch (diagE) {
                        console.error('Diagnostic select failed', diagE);
                        alert('Reject returned no row and diagnostic select failed: ' + diagE.message || String(diagE));
                      }
                      setIsUpdating(false);
                      return;
                    }
                    setPattas(prev => prev.map(p => p.patta_id === row.patta_id ? ({ ...p, ...row }) : p));
                    setSelectedPatta(row);
                    setEditablePatta({ ...row });
                  } catch (e) {
                    console.error('Failed to reject patta', e.message || e);
                    alert('Failed to reject: ' + (e.message || e));
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-2xl">
                    📤
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Upload New Patta</h3>
                    <p className="text-slate-600">Add a new patta to the system</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); simulateUpload(); }}>
              {/* Form Sections */}
              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Holder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter contact number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Location Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Village <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter village name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Block <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white" required>
                        <option value="">Select Block</option>
                        <option value="Saharsa">Saharsa</option>
                        <option value="Madhubani">Madhubani</option>
                        <option value="Darbhanga">Darbhanga</option>
                        <option value="Begusarai">Begusarai</option>
                        <option value="Muzaffarpur">Muzaffarpur</option>
                        <option value="Patna Sadar">Patna Sadar</option>
                        <option value="Gaya">Gaya</option>
                        <option value="Bhagalpur">Bhagalpur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white" required>
                        <option value="">Select District</option>
                        {districts.slice(1).map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Land Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Land Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Land Area (acres) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Survey Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., SV-001/2024"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Document Upload</h4>
                  <div 
                    onClick={handleFileSelect}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-300 cursor-pointer"
                  >
                    {/* Hidden file input for upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={e => {
                        // You can handle file upload logic here
                        // Example: setSelectedFile(e.target.files[0]);
                      }}
                    />
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl">
                      📄
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      <span className="text-blue-600">Click to upload</span> or drag and drop
                    </h4>
                    <p className="text-slate-600 mb-2">PDF, PNG, JPG up to 10MB</p>
                    <p className="text-sm text-slate-500">Supported formats: PDF (recommended), PNG, JPEG</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 pt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{isUploading ? '⏳' : '📤'}</span>
                  <span>{isUploading ? 'Uploading...' : 'Upload Patta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PattaManagement;