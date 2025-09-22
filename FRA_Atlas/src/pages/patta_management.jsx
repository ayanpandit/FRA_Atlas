import React, { useState, useRef } from 'react';

const PattaManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);

  // Enhanced dummy data with more realistic information
  const dummyPattas = [
    {
      id: 'PTA-2024-001',
      holderName: 'Rajesh Kumar Singh',
      village: 'Rampur',
      block: 'Saharsa',
      district: 'Saharsa',
      uploadDate: '2024-01-15',
      status: 'verified',
      landArea: '2.5 acres',
      surveyNumber: 'SV-001/2024',
      documentUrl: '#',
      remarks: 'All documents verified successfully',
      verifiedBy: 'Inspector A.K. Sharma',
      verifiedDate: '2024-01-20',
      priority: 'normal',
      contact: '+91 9876543210',
      email: 'rajesh.singh@example.com'
    },
    {
      id: 'PTA-2024-002',
      holderName: 'Sunita Devi',
      village: 'Madhubani',
      block: 'Madhubani',
      district: 'Madhubani',
      uploadDate: '2024-01-18',
      status: 'pending',
      landArea: '1.8 acres',
      surveyNumber: 'SV-002/2024',
      documentUrl: '#',
      remarks: 'Under review process',
      verifiedBy: null,
      verifiedDate: null,
      priority: 'high',
      contact: '+91 9876543211',
      email: 'sunita.devi@example.com'
    },
    {
      id: 'PTA-2024-003',
      holderName: 'Mohammad Ali Khan',
      village: 'Darbhanga',
      block: 'Darbhanga',
      district: 'Darbhanga',
      uploadDate: '2024-01-20',
      status: 'rejected',
      landArea: '3.2 acres',
      surveyNumber: 'SV-003/2024',
      documentUrl: '#',
      remarks: 'Incomplete documentation',
      verifiedBy: 'Inspector R.K. Singh',
      verifiedDate: '2024-01-22',
      priority: 'low',
      contact: '+91 9876543212',
      email: 'mohammad.khan@example.com'
    },
    {
      id: 'PTA-2024-004',
      holderName: 'Priya Sharma',
      village: 'Begusarai',
      block: 'Begusarai',
      district: 'Begusarai',
      uploadDate: '2024-01-22',
      status: 'verified',
      landArea: '4.1 acres',
      surveyNumber: 'SV-004/2024',
      documentUrl: '#',
      remarks: 'Documents approved',
      verifiedBy: 'Inspector M.K. Jha',
      verifiedDate: '2024-01-25',
      priority: 'normal',
      contact: '+91 9876543213',
      email: 'priya.sharma@example.com'
    },
    {
      id: 'PTA-2024-005',
      holderName: 'Ram Bahadur Yadav',
      village: 'Muzaffarpur',
      block: 'Muzaffarpur',
      district: 'Muzaffarpur',
      uploadDate: '2024-01-25',
      status: 'pending',
      landArea: '2.8 acres',
      surveyNumber: 'SV-005/2024',
      documentUrl: '#',
      remarks: 'Awaiting field verification',
      verifiedBy: null,
      verifiedDate: null,
      priority: 'high',
      contact: '+91 9876543214',
      email: 'ram.yadav@example.com'
    },
    {
      id: 'PTA-2024-006',
      holderName: 'Anjali Kumari',
      village: 'Patna',
      block: 'Patna Sadar',
      district: 'Patna',
      uploadDate: '2024-01-28',
      status: 'verified',
      landArea: '1.5 acres',
      surveyNumber: 'SV-006/2024',
      documentUrl: '#',
      remarks: 'All requirements satisfied',
      verifiedBy: 'Inspector S.N. Mishra',
      verifiedDate: '2024-01-30',
      priority: 'normal',
      contact: '+91 9876543215',
      email: 'anjali.kumari@example.com'
    },
    {
      id: 'PTA-2024-007',
      holderName: 'Vikash Kumar',
      village: 'Gaya',
      block: 'Gaya',
      district: 'Gaya',
      uploadDate: '2024-02-01',
      status: 'pending',
      landArea: '3.5 acres',
      surveyNumber: 'SV-007/2024',
      documentUrl: '#',
      remarks: 'Documents under scrutiny',
      verifiedBy: null,
      verifiedDate: null,
      priority: 'normal',
      contact: '+91 9876543216',
      email: 'vikash.kumar@example.com'
    },
    {
      id: 'PTA-2024-008',
      holderName: 'Meera Singh',
      village: 'Bhagalpur',
      block: 'Bhagalpur',
      district: 'Bhagalpur',
      uploadDate: '2024-02-03',
      status: 'rejected',
      landArea: '2.2 acres',
      surveyNumber: 'SV-008/2024',
      documentUrl: '#',
      remarks: 'Boundary dispute identified',
      verifiedBy: 'Inspector D.K. Singh',
      verifiedDate: '2024-02-05',
      priority: 'high',
      contact: '+91 9876543217',
      email: 'meera.singh@example.com'
    }
  ];

  // Filter pattas based on active tab and filters
  const getFilteredPattas = () => {
    let filtered = dummyPattas;

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(patta => patta.status === 'pending');
    } else if (activeTab === 'verified') {
      filtered = filtered.filter(patta => patta.status === 'verified');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(patta => 
        patta.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patta.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patta.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patta.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patta => patta.status === statusFilter);
    }

    // Filter by district
    if (districtFilter !== 'all') {
      filtered = filtered.filter(patta => patta.district === districtFilter);
    }

    return filtered;
  };

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
      rejected: 'bg-red-50 text-red-800 border-red-200'
    };

    const statusText = {
      pending: 'Pending Review',
      verified: 'Verified & Approved',
      rejected: 'Rejected'
    };

    const statusIcons = {
      pending: '⏳',
      verified: '✅',
      rejected: '❌'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        <span className="mr-1.5">{statusIcons[status]}</span>
        {statusText[status]}
      </span>
    );
  };

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
        {priority.toUpperCase()} PRIORITY
      </span>
    );
  };

  const handleViewDetails = (patta) => {
    setSelectedPatta(patta);
    setShowDetailsModal(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setTimeout(() => {
            setShowUploadModal(false);
            setUploadProgress(0);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const tabs = [
    { 
      id: 'all', 
      label: 'All Pattas', 
      count: dummyPattas.length,
      icon: '📋'
    },
    { 
      id: 'pending', 
      label: 'Pending Review', 
      count: dummyPattas.filter(p => p.status === 'pending').length,
      icon: '⏳'
    },
    { 
      id: 'verified', 
      label: 'Verified', 
      count: dummyPattas.filter(p => p.status === 'verified').length,
      icon: '✅'
    }
  ];

  const districts = ['All Districts', 'Saharsa', 'Madhubani', 'Darbhanga', 'Begusarai', 'Muzaffarpur', 'Patna', 'Gaya', 'Bhagalpur'];

  // Enhanced Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedPattas.map((patta) => (
        <div key={patta.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group">
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{patta.id}</h3>
                  {patta.priority === 'high' && (
                    <span className="text-red-500 text-sm">🔴</span>
                  )}
                </div>
                <p className="text-gray-800 font-medium text-base">{patta.holderName}</p>
              </div>
              {getStatusBadge(patta.status)}
            </div>
            
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📍</span>
                <span>{patta.village}, {patta.district}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📏</span>
                <span>{patta.landArea}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📅</span>
                <span>{new Date(patta.uploadDate).toLocaleDateString('en-IN')}</span>
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
                <button
                  className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                  title="Download"
                >
                  <span className="text-sm">📥 Download</span>
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
                value: dummyPattas.length,
                color: 'blue',
                icon: '📋',
                change: '+12%'
              },
              {
                label: 'Pending Review',
                value: dummyPattas.filter(p => p.status === 'pending').length,
                color: 'amber',
                icon: '⏳',
                change: '+5%'
              },
              {
                label: 'Verified',
                value: dummyPattas.filter(p => p.status === 'verified').length,
                color: 'emerald',
                icon: '✅',
                change: '+8%'
              },
              {
                label: 'Rejected',
                value: dummyPattas.filter(p => p.status === 'rejected').length,
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
              
              {/* Controls */}
              <div className="flex items-center space-x-3">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'table' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Table View"
                  >
                    <span className="text-sm">📊 Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <span className="text-sm">🔄 Grid</span>
                  </button>
                </div>
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
              {(searchQuery || statusFilter !== 'all' || districtFilter !== 'all') && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-slate-600">
                    {filteredPattas.length} of {dummyPattas.length} pattas match your filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDistrictFilter('all');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {viewMode === 'table' ? (
              /* Enhanced Table View */
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Patta Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPattas.map((patta) => (
                      <tr key={patta.id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                              {patta.id.split('-')[2]}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{patta.id}</div>
                              <div className="text-sm text-slate-600">{patta.holderName}</div>
                              <div className="text-xs text-slate-500">{patta.landArea} • {patta.surveyNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium">{patta.village}</div>
                          <div className="text-sm text-slate-500">{patta.block}, {patta.district}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-sm text-slate-900 font-medium">
                              {new Date(patta.uploadDate).toLocaleDateString('en-IN')}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(patta.status)}
                              {patta.priority === 'high' && (
                                <span className="text-xs text-red-600 font-medium">High Priority</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(patta)}
                              className="text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200"
                              title="View Details"
                            >
                              👁️ View
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 px-3 py-1.5 rounded-md hover:bg-green-50 transition-all duration-200"
                              title="Download"
                            >
                              📥 Download
                            </button>
                            <button
                              className="text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all duration-200"
                              title="More Options"
                            >
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <GridView />
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
                    {selectedPatta.id.split('-')[2]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Patta Details</h3>
                    <p className="text-slate-600">{selectedPatta.id}</p>
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
                  {selectedPatta.verifiedBy && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">Verified by</p>
                      <p className="text-sm text-slate-600">{selectedPatta.verifiedBy}</p>
                      <p className="text-xs text-slate-500">{new Date(selectedPatta.verifiedDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Basic Information</h4>
                  {[
                    { label: 'Holder Name', value: selectedPatta.holderName, icon: '👤' },
                    { label: 'Contact', value: selectedPatta.contact, icon: '📞' },
                    { label: 'Email', value: selectedPatta.email, icon: '📧' },
                    { label: 'Village', value: selectedPatta.village, icon: '🏘️' },
                    { label: 'Block', value: selectedPatta.block, icon: '🏛️' },
                    { label: 'District', value: selectedPatta.district, icon: '📍' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg">{item.icon}</div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{item.label}</label>
                        <p className="text-slate-900 font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 border-b border-gray-200 pb-2">Land Details</h4>
                  {[
                    { label: 'Land Area', value: selectedPatta.landArea, icon: '📏' },
                    { label: 'Survey Number', value: selectedPatta.surveyNumber, icon: '📋' },
                    { label: 'Upload Date', value: new Date(selectedPatta.uploadDate).toLocaleDateString('en-IN'), icon: '📅' },
                    { label: 'Status', value: selectedPatta.status, icon: '🔄' },
                    { label: 'Priority', value: selectedPatta.priority, icon: '⚡' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg">{item.icon}</div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{item.label}</label>
                        {item.label === 'Status' ? (
                          <div>{getStatusBadge(selectedPatta.status)}</div>
                        ) : item.label === 'Priority' ? (
                          <div>{getPriorityBadge(selectedPatta.priority)}</div>
                        ) : (
                          <p className="text-slate-900 font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
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

            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-300 font-medium"
              >
                Close
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg">
                📥 Download PDF
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