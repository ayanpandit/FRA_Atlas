import React, { useState, useRef, useEffect } from 'react';
import { Upload, Eye, Download, Filter, Search, X, Check, XCircle, Clock, FileText, MapPin, Calendar, User, Building2, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PattaManagement = () => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
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
  const [loadingPattas, setLoadingPattas] = useState(false);
  const itemsPerPage = 10;

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
        // normalize owner display fields
        const enriched = rows.map(r => ({
          ...r,
          owner_full_name: r.owner_full_name || r.owner_name || r.owner_id || 'Unknown',
          owner_email: r.owner_email || ''
        }));
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

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Land Record Management</h1>
              <p className="text-gray-600">Manage and track land patta applications</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Upload className="w-4 h-4" />
              New Application
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Records', value: pattas.length, color: 'blue', icon: FileText, trend: '+12%' },
              { label: 'Pending Review', value: pattas.filter(p => p.status === 'pending').length, color: 'amber', icon: Clock, trend: '+5%' },
              { label: 'Verified', value: pattas.filter(p => p.status === 'verified').length, color: 'emerald', icon: Check, trend: '+8%' },
              { label: 'Rejected', value: pattas.filter(p => p.status === 'rejected').length, color: 'red', icon: XCircle, trend: '-2%' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs font-medium mt-1 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend} vs last month
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-6">
            <nav className="flex gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-100 text-${tab.color}-700`
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Patta ID, holder name, or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {districts.map(d => (
                  <option key={d} value={d === 'All Districts' ? 'all' : d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patta Details</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPattas.map((patta) => (
                  <tr key={patta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{patta.patta_id}</div>
                          <div className="text-sm text-gray-600">{patta.holder_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{patta.area_hectares} ha</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{patta.right_type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patta.village}</div>
                          <div className="text-sm text-gray-500">{patta.district}, {patta.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(patta.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          {new Date(patta.date_applied).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(patta)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="More">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPattas.length)}</span> of{' '}
                <span className="font-medium">{filteredPattas.length}</span> results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPatta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Patta Details</h3>
                    <p className="text-sm text-gray-600">{selectedPatta.patta_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg border-2 ${
                selectedPatta.status === 'verified' ? 'bg-emerald-50 border-emerald-200' :
                selectedPatta.status === 'pending' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                {getStatusBadge(selectedPatta.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Holder Name</label>
                  <input
                    value={editablePatta?.holder_name || ''}
                    onChange={e => setEditablePatta(prev => ({ ...prev, holder_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Village</label>
                  <input
                    value={editablePatta?.village || ''}
                    onChange={e => setEditablePatta(prev => ({ ...prev, village: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">District</label>
                  <input
                    value={editablePatta?.district || ''}
                    onChange={e => setEditablePatta(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">State</label>
                  <input
                    value={editablePatta?.state || ''}
                    onChange={e => setEditablePatta(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleReject}
                className={`px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={isUpdating}
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={isUpdating}
              >
                Approve
              </button>
              <button
                onClick={handleSave}
                className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PattaManagement;