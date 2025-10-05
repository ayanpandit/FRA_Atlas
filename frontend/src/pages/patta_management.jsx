import React, { useState, useEffect } from 'react';
import { Upload, Eye, Download, Filter, Search, X, Check, XCircle, Clock, FileText, MapPin, Calendar, User, Building2, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import PattaApplicationModal from '../components/PattaApplicationModal';

const PattaManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [editablePatta, setEditablePatta] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [pattas, setPattas] = useState([]);
  const [loadingPattas, setLoadingPattas] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which patta's dropdown is open
  const itemsPerPage = 10;

  const enrichPattaRow = (row = {}) => ({
    ...row,
    owner_full_name: row.owner_full_name || row.owner_name || row.owner_id || 'Unknown',
    owner_email: row.owner_email || ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.relative')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Fetch all pattas from Supabase
  useEffect(() => {
    let mounted = true;
    const fetchPattas = async () => {
      setLoadingPattas(true);
      try {
        const { data, error } = await supabase.from('pattas').select('*');
        console.debug('Supabase pattas fetch', { pattasData: data, pattasErr: error });
        if (error) {
          console.warn('Failed to fetch pattas:', error.message || error);
          if (mounted) {
            setPattas([]);
            setLoadingPattas(false);
          }
          return;
        }
        const rows = data || [];
        const enriched = rows.map(enrichPattaRow);
        enriched.sort((a, b) => new Date(b.date_applied || b.created_at || 0).getTime() - new Date(a.date_applied || a.created_at || 0).getTime());
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
    fetchPattas();
    return () => { mounted = false };
  }, []);

  const handlePattaCreated = (row) => {
    if (!row) return;
    const enriched = enrichPattaRow(row);
    setPattas((prev = []) => [enriched, ...prev]);
  };

  // Approve a patta (set status to verified)
  const handleApprove = async () => {
    if (!selectedPatta) return;
    if (!confirm('Approve this patta and mark as verified?')) return;
    setIsUpdating(true);
    try {
      const filter = selectedPatta.id ? { column: 'id', value: selectedPatta.id } : { column: 'patta_id', value: selectedPatta.patta_id };
      const payload = { status: 'verified', date_verified: new Date().toISOString() };
      // perform update without requesting representation (avoid Prefer:return=representation issues)
      const { error: upErr } = await supabase.from('pattas').update(payload).eq(filter.column, filter.value);
      if (upErr) throw upErr;
      // fetch the updated row explicitly
      const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
      if (selErr) {
        console.debug('Diagnostic select after approve (select error)', { selErr });
        alert('Approve updated row but failed to fetch representation. See console.');
        setIsUpdating(false);
        return;
      }
      const row = selData;
      if (!row) {
        console.debug('Diagnostic select after failed approve (no row)', { selData });
        alert('Approve updated no row or row not found. See console for diagnostic select.');
        setIsUpdating(false);
        return;
      }
      setPattas(prev => prev.map(p => (p.id === row.id || p.patta_id === row.patta_id) ? ({ ...p, ...row }) : p));
      setSelectedPatta(row);
      setEditablePatta({ ...row });
      alert('Patta approved');
    } catch (e) {
      console.error('Failed to approve patta', e);
      alert('Failed to approve: ' + (e.message || e));
    } finally {
      setIsUpdating(false);
    }
  };

  // Reject a patta (set status to rejected and save message)
  const handleReject = async () => {
    if (!selectedPatta) return;
    const msg = prompt('Enter rejection message (optional)', selectedPatta.reject_message || '');
    if (msg === null) return; // cancelled
    setIsUpdating(true);
    try {
      const filter = selectedPatta.id ? { column: 'id', value: selectedPatta.id } : { column: 'patta_id', value: selectedPatta.patta_id };
      const payload = { status: 'rejected', reject_message: msg };
      // perform update without requesting representation
      const { error: upErr } = await supabase.from('pattas').update(payload).eq(filter.column, filter.value);
      if (upErr) throw upErr;
      // fetch updated row explicitly
      const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
      if (selErr) {
        console.debug('Diagnostic select after reject (select error)', { selErr });
        alert('Reject updated row but failed to fetch representation. See console.');
        setIsUpdating(false);
        return;
      }
      const row = selData;
      if (!row) {
        console.debug('Diagnostic select after failed reject (no row)', { selData });
        alert('Reject updated no row or row not found. See console for diagnostic select.');
        setIsUpdating(false);
        return;
      }
      setPattas(prev => prev.map(p => (p.id === row.id || p.patta_id === row.patta_id) ? ({ ...p, ...row }) : p));
      setSelectedPatta(row);
      setEditablePatta({ ...row });
      alert('Patta rejected');
    } catch (e) {
      console.error('Failed to reject patta', e);
      alert('Failed to reject: ' + (e.message || e));
    } finally {
      setIsUpdating(false);
    }
  };

  // Save edited patta fields
  const handleSave = async () => {
    if (!editablePatta) return;
    setIsUpdating(true);
    try {
      const filter = editablePatta.id ? { column: 'id', value: editablePatta.id } : { column: 'patta_id', value: editablePatta.patta_id };
      // prepare payload by picking editable fields
      const { holder_name, village, district, state, area_hectares, right_type, recommended_schemes } = editablePatta;
      const payload = { holder_name, village, district, state, area_hectares, right_type, recommended_schemes };
      // perform update without requesting representation
      const { error: upErr } = await supabase.from('pattas').update(payload).eq(filter.column, filter.value);
      if (upErr) throw upErr;
      // fetch updated row explicitly
      const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
      if (selErr) {
        console.debug('Diagnostic select after save (select error)', { selErr });
        alert('Save updated row but failed to fetch representation. See console.');
        setIsUpdating(false);
        return;
      }
      const row = selData;
      if (!row) {
        console.debug('Diagnostic select after failed save (no row)', { selData });
        alert('Save updated no row or row not found. See console for diagnostic select.');
        setIsUpdating(false);
        return;
      }
      setPattas(prev => prev.map(p => (p.id === row.id || p.patta_id === row.patta_id) ? ({ ...p, ...row }) : p));
      setSelectedPatta(row);
      setEditablePatta({ ...row });
      alert('Changes saved');
    } catch (e) {
      console.error('Failed to save patta', e);
      alert('Failed to save: ' + (e.message || e));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = (patta) => {
    setSelectedPatta(patta);
    setEditablePatta({ ...patta });
    setShowDetailsModal(true);
  };

  // Delete a patta from database
  const handleDeletePatta = async (patta) => {
    if (!confirm(`Are you sure you want to delete patta ${patta.patta_id}? This action cannot be undone.`)) {
      return;
    }

    try {
      const filter = patta.id ? { column: 'id', value: patta.id } : { column: 'patta_id', value: patta.patta_id };
      const { error } = await supabase.from('pattas').delete().eq(filter.column, filter.value);
      
      if (error) throw error;
      
      // Remove from local state
      setPattas(prev => prev.filter(p => p.id !== patta.id && p.patta_id !== patta.patta_id));
      
      // Close modal if the deleted patta was being viewed
      if (selectedPatta && (selectedPatta.id === patta.id || selectedPatta.patta_id === patta.patta_id)) {
        setShowDetailsModal(false);
        setSelectedPatta(null);
        setEditablePatta(null);
      }
      
      alert('Patta deleted successfully');
    } catch (e) {
      console.error('Failed to delete patta', e);
      alert('Failed to delete patta: ' + (e.message || e));
    }
  };

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

  const districts = ['All Districts', 'Saharsa', 'Madhubani', 'Darbhanga', 'Begusarai', 'Muzaffarpur', 'Patna', 'Gaya', 'Bhagalpur', 'Nabarangpur'];
  
  const tabs = [
    { id: 'all', label: 'All Records', count: pattas.length, icon: FileText, color: 'blue' },
    { id: 'pending', label: 'Pending', count: pattas.filter(p => p.status === 'pending').length, icon: Clock, color: 'amber' },
    { id: 'verified', label: 'Verified', count: pattas.filter(p => p.status === 'verified').length, icon: Check, color: 'emerald' },
    { id: 'rejected', label: 'Rejected', count: pattas.filter(p => p.status === 'rejected').length, icon: XCircle, color: 'red' }
  ];

  const filteredPattas = getFilteredPattas();
  const totalPages = Math.ceil(filteredPattas.length / itemsPerPage);
  const paginatedPattas = filteredPattas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Check },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
      <div className="min-h-screen bg-white alan-sans">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Land Record Management
              </h1>
              <p className="text-gray-600 text-lg">Manage and track land patta applications with advanced analytics</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last updated: {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {pattas.length} total records
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowApplicationModal(true)}
                className="flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 16px rgba(20, 83, 83, 0.3)'}}
              >
                <Upload className="w-5 h-5" />
                New Application
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all border-2 border-gray-200/50 transform hover:scale-105"
                style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)'}}
              >
                <Filter className="w-5 h-5" />
                {viewMode === 'table' ? 'Card View' : 'Table View'}
              </button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {[
              { label: 'Total Records', value: pattas.length, color: 'blue', icon: FileText, trend: '+12%', bg: 'from-blue-500 to-blue-600' },
              { label: 'Pending Review', value: pattas.filter(p => p.status === 'pending').length, color: 'amber', icon: Clock, trend: '+5%', bg: 'from-amber-500 to-orange-500' },
              { label: 'Verified', value: pattas.filter(p => p.status === 'verified').length, color: 'emerald', icon: Check, trend: '+8%', bg: 'from-emerald-500 to-green-500' },
              { label: 'Rejected', value: pattas.filter(p => p.status === 'rejected').length, color: 'red', icon: XCircle, trend: '-2%', bg: 'from-red-500 to-red-600' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-4 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color === 'blue' ? 'from-blue-100 to-blue-200' : stat.color === 'amber' ? 'from-amber-100 to-amber-200' : stat.color === 'emerald' ? 'from-emerald-100 to-emerald-200' : 'from-red-100 to-red-200'} rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300`} style={{boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px ${stat.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : stat.color === 'amber' ? 'rgba(245, 158, 11, 0.3)' : stat.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'})`}}>
                      <Icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-700' : stat.color === 'amber' ? 'text-amber-700' : stat.color === 'emerald' ? 'text-emerald-700' : 'text-red-700'} transform hover:scale-105 transition-transform duration-200`} style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', textShadow: '0 1px 1px rgba(0,0,0,0.2)'}} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'} border ${stat.trend.startsWith('+') ? 'border-emerald-200' : 'border-red-200'}`} style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
                {/* Main Content Container */}
        <div className="bg-white rounded-3xl border-2 border-gray-200/50 overflow-hidden transform hover:scale-[1.005] transition-all duration-500" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 pt-6 bg-gradient-to-r from-gray-50/50 to-white">
            <nav className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color === 'blue' ? 'from-blue-500 to-blue-600' : tab.color === 'amber' ? 'from-amber-500 to-amber-600' : tab.color === 'emerald' ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white shadow-lg border-2 border-white/20`
                        : 'bg-white/80 text-gray-700 hover:bg-gray-50 border-2 border-gray-200/50'
                    }`}
                    style={{
                      boxShadow: activeTab === tab.id 
                        ? 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1)' 
                        : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`} style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.1)'}}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enhanced Search and Filters */}
                    {/* Search and Filters */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-r from-gray-50/30 to-white border-b border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)'}}>
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Patta ID, holder name, or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  <option value="all" className="bg-white">All Status</option>
                  <option value="pending" className="bg-white">Pending</option>
                  <option value="verified" className="bg-white">Verified</option>
                  <option value="rejected" className="bg-white">Rejected</option>
                </select>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="px-4 py-3 bg-white border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transform hover:scale-[1.01] transition-all duration-200"
                  style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'}}
                >
                  {districts.map(d => (
                    <option key={d} value={d === 'All Districts' ? 'all' : d} className="bg-white">{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results: table or card view */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100/50 to-gray-50 border-b border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)'}}>
                  <tr>
                    <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patta Details</th>
                    <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="px-4 sm:px-6 lg:px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {paginatedPattas.map((patta) => (
                    <tr key={patta.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-300 transform hover:scale-[1.01]" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)'}}>
                      <td className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-gray-900 truncate">{patta.patta_id}</div>
                            <div className="text-sm text-gray-700 truncate">{patta.holder_name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)'}}>{patta.area_hectares} ha</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)'}}>{patta.right_type}</span>
                            </div>
                            {/* Mobile-only location info */}
                            <div className="md:hidden mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {patta.village}, {patta.district}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-6 hidden md:table-cell">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{patta.village}</div>
                            <div className="text-sm text-gray-600">{patta.district}, {patta.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-6">
                        {getStatusBadge(patta.status)}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-6 hidden lg:table-cell">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            {new Date(patta.date_applied).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(patta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 transform border border-blue-200/50"
                            title="View Details"
                            style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(59, 130, 246, 0.2)'}}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === patta.id ? null : patta.id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all hover:scale-110 transform border border-gray-200/50"
                              title="More Actions"
                              style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {dropdownOpen === patta.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-10 overflow-hidden" style={{boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)'}}>
                                <div className="py-2">
                                  <button
                                    onClick={() => {
                                      handleDeletePatta(patta);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all flex items-center gap-3 font-medium"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Delete Patta
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPattas.map(patta => (
                <div key={patta.id || patta.patta_id} className="bg-white rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{patta.patta_id}</div>
                          <div className="text-sm text-gray-700 truncate">{patta.holder_name}</div>
                        </div>
                        <div className="text-left sm:text-right mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                          <div className="text-xs text-gray-500">{patta.date_applied ? new Date(patta.date_applied).toLocaleDateString() : ''}</div>
                          <div className="mt-2">{getStatusBadge(patta.status)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="truncate">{patta.village}, {patta.district}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{patta.area_hectares} ha</span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{patta.right_type}</span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                        <button onClick={() => handleViewDetails(patta)} className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">View</button>
                        <div className="relative w-full sm:w-auto">
                          <button onClick={() => setDropdownOpen(dropdownOpen === patta.id ? null : patta.id)} className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm">More</button>
                          {dropdownOpen === patta.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                              <button onClick={() => { handleDeletePatta(patta); setDropdownOpen(null); }} className="w-full text-left px-4 py-3 text-sm text-red-600">Delete Patta</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/30 to-white" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'}}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredPattas.length)}</span> of{' '}
                  <span className="font-bold text-gray-900">{filteredPattas.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200/50 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 transform"
                    style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)'}}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-semibold rounded-xl transition-all hover:scale-105 transform ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-500'
                              : 'text-gray-700 bg-white border-2 border-gray-200/50 hover:bg-gray-50'
                          }`}
                          style={{
                            boxShadow: currentPage === pageNum 
                              ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(59, 130, 246, 0.3)' 
                              : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200/50 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 transform"
                    style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(0,0,0,0.1)'}}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Enhanced Details Modal */}
      {showDetailsModal && selectedPatta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white max-w-7xl w-full max-h-[95vh] shadow-2xl rounded-3xl border border-white/30 overflow-hidden flex flex-col">
            {/* Background patterns - moved to pseudo-elements to avoid interference */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 rounded-3xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-t-3xl pointer-events-none"></div>

            {/* Enhanced Header - Fixed position within modal */}
            <div className="relative bg-white/90 backdrop-blur-xl border-b border-gray-200/50 p-6 lg:p-8 z-10 rounded-t-3xl flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-xl animate-pulse">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Patta Details
                    </h2>
                    <p className="text-xl font-semibold text-gray-700">{selectedPatta.patta_id}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Applied: {new Date(selectedPatta.date_applied).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{selectedPatta.village}, {selectedPatta.district}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{selectedPatta.area_hectares} hectares</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="group p-3 bg-gray-100 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-110 self-start lg:self-center"
                >
                  <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area - Improved scrolling */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors">
              {/* Enhanced Status Banner */}
              <div className={`p-6 rounded-2xl border-2 shadow-lg ${
                editablePatta.status === 'verified' ? 'bg-emerald-50 border-emerald-200' :
                editablePatta.status === 'pending' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {getStatusBadge(editablePatta.status)}
                  <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                    <span>Last updated: {new Date(editablePatta.updated_at || editablePatta.created_at).toLocaleDateString()}</span>
                    <span className="hidden sm:block">•</span>
                    <span>Area: {editablePatta.area_hectares} hectares</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Form Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { label: 'ID', key: 'id', type: 'text', disabled: true },
                  { label: 'Patta ID', key: 'patta_id', type: 'text', disabled: true },
                  { label: 'Owner ID', key: 'owner_id', type: 'text' },
                  { label: 'Holder Name', key: 'holder_name', type: 'text' },
                  { label: 'Category', key: 'category', type: 'text' },
                  { label: 'Right Type', key: 'right_type', type: 'text' },
                  { label: 'Village', key: 'village', type: 'text' },
                  { label: 'District', key: 'district', type: 'text' },
                  { label: 'State', key: 'state', type: 'text' },
                  { label: 'Coordinates', key: 'coordinates', type: 'textarea', render: v => JSON.stringify(v, null, 2) },
                  { label: 'Area (hectares)', key: 'area_hectares', type: 'number' },
                  { label: 'Status', key: 'status', type: 'text' },
                  { label: 'Recommended Schemes', key: 'recommended_schemes', type: 'textarea', render: v => JSON.stringify(v, null, 2) },
                  { label: 'Date Applied', key: 'date_applied', type: 'text' },
                  { label: 'Time Applied', key: 'time_applied', type: 'text' },
                  { label: 'Date Verified', key: 'date_verified', type: 'text' },
                  { label: 'Reject Message', key: 'reject_message', type: 'textarea' },
                  { label: 'Patta Doc Filename', key: 'patta_doc_filename', type: 'text' },
                  // Patta Doc URL Preview - replaced with preview component
                  { label: 'Patta Document Preview', key: 'patta_doc_url', type: 'preview', render: (url) => {
                    if (!url) return <div className="text-gray-500 text-sm italic">No document uploaded</div>;
                    
                    const isPDF = url.toLowerCase().includes('.pdf');
                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
                    
                    if (isImage) {
                      return (
                        <div className="space-y-3">
                          <div className="relative group max-w-md">
                            <img 
                              src={url} 
                              alt="Patta Document" 
                              className="w-full h-auto max-h-80 object-contain rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                            />
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                                <Eye className="w-10 h-10 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => window.open(url, '_blank')}>
                              <Eye className="w-4 h-4" />
                              Click to view full size
                            </span>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 underline"
                            >
                              <Download className="w-4 h-4" />
                              Open in new tab
                            </a>
                          </div>
                        </div>
                      );
                    } else if (isPDF) {
                      return (
                        <div className="space-y-3">
                          <div className="relative group max-w-md">
                            <iframe 
                              src={url} 
                              className="w-full h-80 border border-gray-200 rounded-xl shadow-lg"
                              title="Patta Document PDF"
                            />
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                                <Eye className="w-10 h-10 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => window.open(url, '_blank')}>
                              <Eye className="w-4 h-4" />
                              View PDF
                            </span>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 underline"
                            >
                              <Download className="w-4 h-4" />
                              Open PDF
                            </a>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-3">
                          <div className="relative group max-w-md">
                            <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-xl bg-gray-50">
                              <FileText className="w-10 h-10 text-gray-400" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Document</p>
                                <p className="text-xs text-gray-500">Unsupported file type</p>
                              </div>
                            </div>
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                                <Eye className="w-10 h-10 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => window.open(url, '_blank')}>
                              <Eye className="w-4 h-4" />
                              View Document
                            </span>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 underline"
                            >
                              <Download className="w-4 h-4" />
                              Open Document
                            </a>
                          </div>
                        </div>
                      );
                    }
                  }},
                  { label: 'Scheme Priority', key: 'scheme_priority', type: 'text' },
                  { label: 'Created At', key: 'created_at', type: 'text', disabled: true },
                  { label: 'Updated At', key: 'updated_at', type: 'text', disabled: true },
                ].map(field => (
                  <div className="space-y-2" key={field.key}>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">{field.label}</label>
                    {field.type === 'preview' ? (
                      <div className="w-full">
                        {field.render ? field.render(editablePatta?.[field.key]) : (editablePatta?.[field.key] ?? '')}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={field.render ? field.render(editablePatta?.[field.key]) : (editablePatta?.[field.key] ?? '')}
                        onChange={e => setEditablePatta(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white/80 backdrop-blur-sm shadow-sm"
                        disabled={field.disabled}
                        rows={field.key === 'coordinates' || field.key === 'recommended_schemes' ? 4 : 2}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={field.render ? field.render(editablePatta?.[field.key]) : (editablePatta?.[field.key] ?? '')}
                        onChange={e => setEditablePatta(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white/80 backdrop-blur-sm shadow-sm"
                        disabled={field.disabled}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 lg:p-8 flex flex-col sm:flex-row justify-end gap-3 rounded-b-3xl flex-shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all hover:scale-105 order-2 sm:order-1"
              >
                Close
              </button>
              <div className="flex gap-3 order-1 sm:order-2">
                <button
                  onClick={handleReject}
                  className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl ${
                    isUpdating ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  disabled={isUpdating}
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl ${
                    isUpdating ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  disabled={isUpdating}
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      const filter = editablePatta.id ? { column: 'id', value: editablePatta.id } : { column: 'patta_id', value: editablePatta.patta_id };
                      // Only include valid patta fields in payload
                      const validFields = [
                        'owner_id','holder_name','category','right_type','village','district','state','coordinates','area_hectares','status','recommended_schemes','date_applied','time_applied','date_verified','reject_message','patta_doc_filename','patta_doc_url','scheme_priority'
                      ];
                      const payload = {};
                      validFields.forEach(key => {
                        if (key in editablePatta) payload[key] = editablePatta[key];
                      });
                      const { error: upErr } = await supabase.from('pattas').update(payload).eq(filter.column, filter.value);
                      if (upErr) throw upErr;
                      // fetch the updated row explicitly
                      const { data: selData, error: selErr } = await supabase.from('pattas').select('*').eq(filter.column, filter.value).maybeSingle();
                      if (selErr) throw selErr;
                      setSelectedPatta(selData);
                      setEditablePatta(selData);
                      setPattas(prev => prev.map(p => (p[filter.column] === filter.value ? selData : p)));
                      setShowDetailsModal(false);
                    } catch (e) {
                      alert('Failed to save: ' + (e.message || e));
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl ${
                    isUpdating ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <PattaApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        ownerId="admin-management"
        submitLabel="Create Application"
        onPattaCreated={handlePattaCreated}
      />
      </div>
    </>
  );
};

export default PattaManagement;