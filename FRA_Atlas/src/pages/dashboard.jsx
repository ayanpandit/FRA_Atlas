import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUpload, FiDownload, FiMap, FiCheckCircle, FiClock, FiAlertCircle, 
  FiFileText, FiUser, FiHome, FiLayers, FiEdit3, FiSave, FiX, FiEye,
  FiRefreshCw, FiTrash2, FiFilter, FiSearch, FiBell, FiMapPin,
  FiTrendingUp, FiTrendingDown, FiMoreVertical, FiZoomIn, FiZoomOut,
  FiCornerUpRight, FiCheck, FiAlertTriangle, FiInfo, FiTarget,
  FiAward, FiDollarSign, FiCalendar, FiGlobe, FiMenu, FiChevronDown,
  FiChevronRight, FiMaximize2, FiMinimize2
} from 'react-icons/fi';

const Dashboard = () => {
  // Enhanced state management
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [mapView, setMapView] = useState('satellite');
  const [showOCRText, setShowOCRText] = useState(false);
  const [confidenceScores, setConfidenceScores] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'detail'
  
  const fileInputRef = useRef(null);
  const mapRef = useRef(null);

  // Enhanced stats data with trends
  const stats = [
    { 
      id: 1, 
      title: 'Total Pattas', 
      count: 1247, 
      trend: 8.2,
      trendDirection: 'up',
      icon: <FiFileText className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: '#0B6FA4',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      description: 'Documents processed'
    },
    { 
      id: 2, 
      title: 'Pending', 
      count: 355, 
      trend: -12.1,
      trendDirection: 'down',
      icon: <FiClock className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: '#F2A900',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      description: 'Awaiting review'
    },
    { 
      id: 3, 
      title: 'Verified', 
      count: 892, 
      trend: 15.3,
      trendDirection: 'up',
      icon: <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: '#2E8B57',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      description: 'Quality approved'
    },
    { 
      id: 4, 
      title: 'Eligible', 
      count: 756, 
      trend: 23.7,
      trendDirection: 'up',
      icon: <FiAward className="w-5 h-5 sm:w-6 sm:h-6" />, 
      color: '#2E8B57',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-600',
      description: 'Scheme qualified'
    },
  ];

  // Enhanced recent pattas data
  const recentPattas = [
    { 
      id: 'FRA-2024-001', 
      holder: 'Ramesh Kumar Singh', 
      fatherName: 'Late Govind Singh',
      village: 'Chandpur', 
      district: 'Nainital',
      state: 'Uttarakhand',
      area: '1.52', 
      unit: 'hectares',
      status: 'Approved', 
      eligibility: 'Eligible',
      confidence: 94,
      uploadDate: '2024-01-15',
      lastModified: '2024-01-18',
      schemes: ['PM-KISAN', 'Van Dhan Yojana'],
      coordinates: { lat: 29.3803, lng: 79.4636 },
      ocrText: 'Sample OCR text for Ramesh Kumar Singh...',
      thumbnail: '/api/placeholder/100/80'
    },
    { 
      id: 'FRA-2024-002', 
      holder: 'Sunita Devi Rawat', 
      fatherName: 'Ram Singh Rawat',
      village: 'Bhimtal', 
      district: 'Nainital',
      state: 'Uttarakhand',
      area: '0.87', 
      unit: 'hectares',
      status: 'Processing', 
      eligibility: 'Under Review',
      confidence: 78,
      uploadDate: '2024-01-16',
      lastModified: '2024-01-16',
      schemes: ['MGNREGA'],
      coordinates: { lat: 29.3403, lng: 79.5636 },
      ocrText: 'Sample OCR text for Sunita Devi...',
      thumbnail: '/api/placeholder/100/80'
    },
    { 
      id: 'FRA-2024-003', 
      holder: 'Mohan Singh Bisht', 
      fatherName: 'Chandra Singh',
      village: 'Ramnagar', 
      district: 'Nainital',
      state: 'Uttarakhand',
      area: '2.34', 
      unit: 'hectares',
      status: 'Verified', 
      eligibility: 'Eligible',
      confidence: 91,
      uploadDate: '2024-01-14',
      lastModified: '2024-01-17',
      schemes: ['PM-KISAN', 'Van Dhan Yojana', 'MGNREGA'],
      coordinates: { lat: 29.3203, lng: 79.5836 },
      ocrText: 'Sample OCR text for Mohan Singh...',
      thumbnail: '/api/placeholder/100/80'
    },
    { 
      id: 'FRA-2024-004', 
      holder: 'Priya Sharma Negi', 
      fatherName: 'Bhim Singh Negi',
      village: 'Haldwani', 
      district: 'Nainital',
      state: 'Uttarakhand',
      area: '1.23', 
      unit: 'hectares',
      status: 'Rejected', 
      eligibility: 'Not Eligible',
      confidence: 65,
      uploadDate: '2024-01-13',
      lastModified: '2024-01-15',
      schemes: [],
      coordinates: { lat: 29.2203, lng: 79.5136 },
      ocrText: 'Sample OCR text for Priya Sharma...',
      thumbnail: '/api/placeholder/100/80'
    },
  ];

  // Available government schemes
  const availableSchemes = [
    {
      id: 'pm-kisan',
      name: 'PM-KISAN',
      description: 'Direct income support to farmers',
      amount: '₹6,000/year',
      criteria: ['Land ownership', 'Agricultural land', 'Below 2 hectares'],
      confidence: 92
    },
    {
      id: 'van-dhan',
      name: 'Van Dhan Yojana',
      description: 'Tribal forest produce scheme',
      amount: 'Variable',
      criteria: ['Tribal area', 'Forest produce collection', 'Community participation'],
      confidence: 87
    },
    {
      id: 'mgnrega',
      name: 'MGNREGA',
      description: 'Employment guarantee scheme',
      amount: '₹309/day',
      criteria: ['Rural household', 'Manual work capability', 'Job card holder'],
      confidence: 78
    }
  ];

  // Responsive breakpoint hook
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Notification system
  useEffect(() => {
    const sampleNotifications = [
      { id: 1, type: 'success', message: 'FRA-2024-001 approved successfully', time: '2 minutes ago' },
      { id: 2, type: 'warning', message: 'Low confidence OCR for FRA-2024-005', time: '5 minutes ago' },
      { id: 3, type: 'info', message: 'New scheme eligibility rules updated', time: '1 hour ago' },
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Enhanced file upload handling
  const handleFileUpload = async (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      uploadTime: new Date().toISOString(),
      extractedData: null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    for (const fileObj of newFiles) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileObj.id ? { ...f, progress } : f)
        );
      }

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileObj.id ? { ...f, status: 'processing' } : f)
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockData = {
        pattaNumber: `FRA-2024-${String(uploadedFiles.length + 1).padStart(3, '0')}`,
        holderName: 'Extracted Holder Name',
        fatherName: 'Extracted Father Name',
        village: 'Extracted Village',
        district: 'Extracted District',
        state: 'Uttarakhand',
        landSize: (Math.random() * 3 + 0.5).toFixed(2),
        landType: 'Agricultural',
        issueDate: new Date().toISOString().split('T')[0],
        coordinates: { 
          lat: 29.3803 + (Math.random() - 0.5) * 0.1, 
          lng: 79.4636 + (Math.random() - 0.5) * 0.1 
        },
        ocrText: 'Sample extracted OCR text...',
        confidence: Math.floor(Math.random() * 30 + 70)
      };

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileObj.id ? { 
          ...f, 
          status: 'completed', 
          extractedData: mockData 
        } : f)
      );

      setConfidenceScores(prev => ({
        ...prev,
        [fileObj.id]: {
          holderName: Math.floor(Math.random() * 20 + 80),
          fatherName: Math.floor(Math.random() * 20 + 75),
          village: Math.floor(Math.random() * 15 + 85),
          district: Math.floor(Math.random() * 10 + 90),
          landSize: Math.floor(Math.random() * 25 + 70)
        }
      }));

      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: `${fileObj.name} processed successfully`,
        time: 'Just now'
      }, ...prev.slice(0, 4)]);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Field editing handlers
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValues({ [field]: currentValue });
  };

  const saveEdit = (field) => {
    if (selectedPatta) {
      setSelectedPatta(prev => ({
        ...prev,
        [field]: tempValues[field]
      }));
    }
    setEditingField(null);
    setTempValues({});
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `${field} updated successfully`,
      time: 'Just now'
    }, ...prev.slice(0, 4)]);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  // Filter and search
  const filteredPattas = recentPattas.filter(patta => {
    const matchesSearch = patta.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patta.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patta.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ status, size = 'sm' }) => {
    const configs = {
      'Approved': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <FiCheck className="w-3 h-3" /> },
      'Verified': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiEye className="w-3 h-3" /> },
      'Processing': { bg: 'bg-amber-100', text: 'text-amber-800', icon: <FiRefreshCw className="w-3 h-3" /> },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="w-3 h-3" /> },
      'Pending': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FiClock className="w-3 h-3" /> }
    };
    
    const config = configs[status] || configs['Pending'];
    const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
    
    return (
      <span className={`${config.bg} ${config.text} ${sizeClass} rounded-full font-medium flex items-center gap-1 w-fit`}>
        {config.icon}
        {status}
      </span>
    );
  };

  // Confidence indicator component
  const ConfidenceIndicator = ({ score, field }) => {
    const getColor = (score) => {
      if (score >= 90) return 'text-emerald-600 bg-emerald-100';
      if (score >= 70) return 'text-amber-600 bg-amber-100';
      return 'text-red-600 bg-red-100';
    };

    const getIcon = (score) => {
      if (score >= 90) return <FiCheck className="w-3 h-3" />;
      if (score >= 70) return <FiAlertTriangle className="w-3 h-3" />;
      return <FiAlertCircle className="w-3 h-3" />;
    };

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColor(score)}`}>
        {getIcon(score)}
        {score}%
      </div>
    );
  };

  // Mobile View Mode Selector
  const ViewModeSelector = () => (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4 lg:hidden">
      <button
        onClick={() => setViewMode('list')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
        }`}
      >
        List
      </button>
      <button
        onClick={() => setViewMode('detail')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'detail' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
        }`}
        disabled={!selectedPatta}
      >
        Details
      </button>
    </div>
  );

  // Editable field component
  const EditableField = ({ label, value, field, confidence }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {confidence && <ConfidenceIndicator score={confidence} field={field} />}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={tempValues[field] || ''}
                onChange={(e) => setTempValues(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
              <button
                onClick={() => saveEdit(field)}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors touch-manipulation"
              >
                <FiSave className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors touch-manipulation"
              >
                <FiX className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-800 text-sm">
                {value || 'Not extracted'}
              </div>
              <button
                onClick={() => startEditing(field, value)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Expandable Section Component for Mobile
  const ExpandableSection = ({ title, children, id, icon }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isExpanded ? <FiChevronDown className="w-5 h-5 text-gray-500" /> : <FiChevronRight className="w-5 h-5 text-gray-500" />}
        </button>
        {isExpanded && (
          <div className="p-4 pt-0 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Enhanced Mobile-First Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                FRA Portal
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
                Forest Rights Act Document Processing System
              </p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by holder name, ID, or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="verified">Verified</option>
                <option value="processing">Processing</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="relative">
                <button className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiBell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search - Collapsible */}
          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 lg:hidden">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="verified">Verified</option>
                  <option value="processing">Processing</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <button className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiBell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Responsive Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className={`${stat.bgColor} rounded-xl shadow-sm border border-white/20 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between mb-2 lg:mb-4">
                <div className={`${stat.textColor} p-2 lg:p-3 rounded-lg bg-white/50`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center text-xs font-medium ${stat.trendDirection === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.trendDirection === 'up' ? <FiTrendingUp className="w-3 h-3 mr-1" /> : <FiTrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">{stat.title}</h3>
                <p className="text-gray-900 text-lg sm:text-xl lg:text-2xl font-bold">{stat.count.toLocaleString()}</p>
                <p className="text-gray-500 text-xs hidden sm:block">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View Mode Selector */}
        {isMobile && <ViewModeSelector />}

        {/* Responsive Layout */}
        <div className={`${isMobile ? 'block' : 'grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8'}`}>
          {/* Left Column - Upload & List (Mobile: Conditional Rendering) */}
          {(!isMobile || viewMode === 'list') && (
            <div className={`${isMobile ? 'block' : 'xl:col-span-5'} space-y-6`}>
              {/* Enhanced Upload Section */}
              {isMobile ? (
                <ExpandableSection 
                  title="Upload Document" 
                  id="upload"
                  icon={<FiUpload className="w-5 h-5" />}
                >
                  <UploadSection />
                </ExpandableSection>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FiUpload className="mr-3 text-blue-600" /> Upload Patta Document
                    </h2>
                    <div className="text-sm text-gray-500">
                      Max 10MB • PDF, JPG, PNG
                    </div>
                  </div>
                  <UploadSection />
                </div>
              )}

              {/* Recent Pattas List */}
              {isMobile ? (
                <ExpandableSection 
                  title="Recent Submissions" 
                  id="recent"
                  icon={<FiFileText className="w-5 h-5" />}
                >
                  <PattasList />
                </ExpandableSection>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FiFileText className="mr-3 text-blue-600" /> Recent Submissions
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                  <PattasList />
                </div>
              )}
            </div>
          )}

          {/* Right Column - Detail View (Mobile: Conditional Rendering) */}
          {(!isMobile || viewMode === 'detail') && (
            <div className={`${isMobile ? 'block' : 'xl:col-span-7'} space-y-6`}>
              {/* Document Detail Panel */}
              {selectedPatta ? (
                <DocumentDetail />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12">
                  <div className="text-center">
                    <FiFileText className="mx-auto w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
                    <p className="text-gray-600 text-sm lg:text-base">Select a patta from the list or upload a new document to view details</p>
                    {isMobile && (
                      <button
                        onClick={() => setViewMode('list')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Documents
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Map and Scheme Eligibility - Mobile: Expandable */}
              {!isMobile ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MapSection />
                  <SchemeEligibility />
                </div>
              ) : selectedPatta && (
                <>
                  <ExpandableSection 
                    title="Land Location" 
                    id="map"
                    icon={<FiMap className="w-5 h-5" />}
                  >
                    <MapSection />
                  </ExpandableSection>
                  
                  <ExpandableSection 
                    title="Scheme Eligibility" 
                    id="schemes"
                    icon={<FiAward className="w-5 h-5" />}
                  >
                    <SchemeEligibility />
                  </ExpandableSection>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Mobile-Optimized Notifications */}
      {notifications.length > 0 && (
        <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-4 right-4'} space-y-2 z-50 max-w-sm`}>
          {notifications.slice(0, isMobile ? 2 : 3).map((notification) => (
            <div key={notification.id} className={`p-3 lg:p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
              notification.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${
                  notification.type === 'success' ? 'text-emerald-600' :
                  notification.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {notification.type === 'success' ? <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5" /> :
                   notification.type === 'warning' ? <FiAlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" /> :
                   <FiInfo className="w-4 h-4 lg:w-5 lg:h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 touch-manipulation"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Component functions (extracted for readability)
  function UploadSection() {
    return (
      <>
        <div 
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-200 cursor-pointer touch-manipulation
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png" 
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          
          <div className={`mx-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-3 lg:mb-4 ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <FiUpload className={`w-6 h-6 lg:w-8 lg:h-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop files here' : (isMobile ? 'Tap to upload' : 'Drag & drop your files here')}
          </h3>
          <p className="text-sm text-gray-600 mb-3 lg:mb-4">
            {!isMobile && 'or'} <span className="text-blue-600 font-medium">browse files</span>
          </p>
          <div className="flex items-center justify-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
            <span className="flex items-center"><FiFileText className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> PDF</span>
            <span className="flex items-center"><FiFileText className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> JPG</span>
            <span className="flex items-center"><FiFileText className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> PNG</span>
          </div>
        </div>

        {/* Upload Queue */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 lg:mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Upload Queue</h3>
            {uploadedFiles.slice(-3).map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FiFileText className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {file.status === 'uploading' && (
                    <div className="w-16 lg:w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <StatusBadge status={file.status === 'uploading' ? 'Processing' : file.status === 'processing' ? 'Processing' : 'Approved'} />
                  
                  {file.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedPatta(file.extractedData);
                        if (isMobile) setViewMode('detail');
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded touch-manipulation"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  function PattasList() {
    return (
      <div className="space-y-3">
        {filteredPattas.slice(0, isMobile ? 10 : 5).map((patta) => (
          <div 
            key={patta.id} 
            className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation
              ${selectedPatta?.id === patta.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => {
              setSelectedPatta(patta);
              if (isMobile) setViewMode('detail');
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{patta.holder}</h3>
                  <StatusBadge status={patta.status} />
                </div>
                <div className="grid grid-cols-2 gap-1 lg:gap-2 text-xs text-gray-600">
                  <div><span className="font-medium">ID:</span> {patta.id}</div>
                  <div><span className="font-medium">Village:</span> {patta.village}</div>
                  <div><span className="font-medium">Area:</span> {patta.area} {patta.unit}</div>
                  <div><span className="font-medium">Date:</span> {new Date(patta.uploadDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center mt-2 space-x-2 flex-wrap gap-1">
                  <ConfidenceIndicator score={patta.confidence} />
                  {patta.schemes.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {patta.schemes.length} scheme{patta.schemes.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded touch-manipulation">
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function DocumentDetail() {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setViewMode('list')}
                className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiCornerUpRight className="w-5 h-5 transform rotate-180" />
              </button>
            )}
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 lg:mr-3 text-blue-600" /> 
              <span className="hidden sm:inline">Patta Details - </span>
              {selectedPatta.id}
            </h2>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <StatusBadge status={selectedPatta.status} size={isMobile ? 'sm' : 'lg'} />
            <button 
              onClick={() => setShowOCRText(!showOCRText)}
              className="px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
            >
              {showOCRText ? 'Hide' : 'Show'} OCR
            </button>
          </div>
        </div>

        {/* OCR Text Panel */}
        {showOCRText && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Raw OCR Text</h3>
            <div className="max-h-32 overflow-y-auto text-sm text-gray-600 font-mono bg-white p-3 rounded border">
              {selectedPatta.ocrText}
            </div>
          </div>
        )}

        {/* Extracted Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-base lg:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Document Information
            </h3>
            <EditableField 
              label="Patta Number" 
              value={selectedPatta.id} 
              field="pattaNumber"
              confidence={confidenceScores[selectedPatta.id]?.pattaNumber || 95}
            />
            <EditableField 
              label="Land Size" 
              value={`${selectedPatta.area} ${selectedPatta.unit}`} 
              field="landSize"
              confidence={confidenceScores[selectedPatta.id]?.landSize || 87}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issue Date</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 text-sm">
                {new Date(selectedPatta.uploadDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base lg:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Holder Information
            </h3>
            <EditableField 
              label="Holder Name" 
              value={selectedPatta.holder} 
              field="holderName"
              confidence={confidenceScores[selectedPatta.id]?.holderName || 92}
            />
            <EditableField 
              label="Father's Name" 
              value={selectedPatta.fatherName} 
              field="fatherName"
              confidence={confidenceScores[selectedPatta.id]?.fatherName || 89}
            />
            <EditableField 
              label="Village" 
              value={selectedPatta.village} 
              field="village"
              confidence={confidenceScores[selectedPatta.id]?.village || 94}
            />
            <EditableField 
              label="District" 
              value={selectedPatta.district} 
              field="district"
              confidence={confidenceScores[selectedPatta.id]?.district || 96}
            />
          </div>
        </div>

        {/* Status Stepper */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Processing Status</h3>
          <div className="flex items-center justify-between overflow-x-auto">
            <div className="flex items-center space-x-2 lg:space-x-4 min-w-max">
              <div className={`flex items-center space-x-2 ${selectedPatta.status !== 'Rejected' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${selectedPatta.status !== 'Rejected' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <FiUpload className="w-3 h-3 lg:w-4 lg:h-4" />
                </div>
                <span className="text-xs lg:text-sm font-medium hidden sm:inline">Uploaded</span>
              </div>
              <div className={`w-4 lg:w-8 h-0.5 ${selectedPatta.status === 'Verified' || selectedPatta.status === 'Approved' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${selectedPatta.status === 'Verified' || selectedPatta.status === 'Approved' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${selectedPatta.status === 'Verified' || selectedPatta.status === 'Approved' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <FiEye className="w-3 h-3 lg:w-4 lg:h-4" />
                </div>
                <span className="text-xs lg:text-sm font-medium hidden sm:inline">Verified</span>
              </div>
              <div className={`w-4 lg:w-8 h-0.5 ${selectedPatta.status === 'Approved' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${selectedPatta.status === 'Approved' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${selectedPatta.status === 'Approved' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <FiCheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                </div>
                <span className="text-xs lg:text-sm font-medium hidden sm:inline">Approved</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {selectedPatta.status === 'Processing' && (
                <button className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation">
                  Verify
                </button>
              )}
              {selectedPatta.status === 'Verified' && (
                <button className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors touch-manipulation">
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <button className="flex items-center px-3 lg:px-4 py-2 text-xs lg:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors touch-manipulation">
            <FiDownload className="mr-1 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" /> Export
          </button>
          <button className="flex items-center px-3 lg:px-4 py-2 text-xs lg:text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors touch-manipulation">
            <FiMapPin className="mr-1 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" /> Map
          </button>
          <button className="flex items-center px-3 lg:px-4 py-2 text-xs lg:text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors touch-manipulation">
            <FiEdit3 className="mr-1 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" /> Notes
          </button>
        </div>
      </div>
    );
  }

  function MapSection() {
    return (
      <div className={`${isMobile ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'}`}>
        {!isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiMap className="mr-2 text-blue-600" /> Land Location
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={mapView} 
                onChange={(e) => setMapView(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="satellite">Satellite</option>
                <option value="street">Street</option>
                <option value="terrain">Terrain</option>
              </select>
              <button className="p-1 hover:bg-gray-100 rounded">
                <FiLayers className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
        
        <div className={`relative ${isMobile ? 'h-48' : 'h-64'} bg-gray-100 rounded-lg overflow-hidden`}>
          <div 
            className="w-full h-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%2393c5fd'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='%23ffffff'%3EInteractive Map Area%3C/text%3E%3C/svg%3E")`
            }}
          >
            {selectedPatta && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse">
              </div>
            )}
            
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <button className="p-1.5 lg:p-2 bg-white rounded shadow hover:bg-gray-50 touch-manipulation">
                <FiZoomIn className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <button className="p-1.5 lg:p-2 bg-white rounded shadow hover:bg-gray-50 touch-manipulation">
                <FiZoomOut className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <button className="p-1.5 lg:p-2 bg-white rounded shadow hover:bg-gray-50 touch-manipulation">
                <FiTarget className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>

            {selectedPatta && (
              <div className="absolute bottom-2 left-2 bg-white rounded-lg shadow-lg p-2 lg:p-3 max-w-36 lg:max-w-48">
                <div className="text-xs lg:text-sm font-medium text-gray-900">{selectedPatta.holder}</div>
                <div className="text-xs text-gray-600">{selectedPatta.area} {selectedPatta.unit}</div>
                <div className="text-xs text-gray-600">{selectedPatta.village}, {selectedPatta.district}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function SchemeEligibility() {
    return (
      <div className={`${isMobile ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'}`}>
        {!isMobile && (
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <FiAward className="mr-2 text-emerald-600" /> Scheme Eligibility
          </h3>
        )}
        
        {selectedPatta ? (
          <div className="space-y-4">
            {availableSchemes.map((scheme) => {
              const isEligible = selectedPatta.schemes.includes(scheme.name);
              return (
                <div key={scheme.id} className={`p-3 lg:p-4 rounded-lg border ${isEligible ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm lg:text-base font-medium ${isEligible ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {scheme.name}
                      </h4>
                      <p className={`text-xs lg:text-sm ${isEligible ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {scheme.description}
                      </p>
                      <div className={`text-xs font-medium mt-1 ${isEligible ? 'text-emerald-800' : 'text-gray-500'}`}>
                        {scheme.amount}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <ConfidenceIndicator score={scheme.confidence} />
                      {isEligible ? (
                        <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                      ) : (
                        <FiAlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {scheme.criteria.map((criterion, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {criterion}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    {isEligible ? (
                      <button className="px-2 lg:px-3 py-1 lg:py-1.5 bg-emerald-600 text-white text-xs lg:text-sm rounded-lg hover:bg-emerald-700 transition-colors touch-manipulation">
                        Approve
                      </button>
                    ) : (
                      <button className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gray-600 text-white text-xs lg:text-sm rounded-lg hover:bg-gray-700 transition-colors touch-manipulation">
                        Mark Eligible
                      </button>
                    )}
                    <button className="px-2 lg:px-3 py-1 lg:py-1.5 border border-gray-300 text-gray-700 text-xs lg:text-sm rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
                      Add Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 lg:py-8">
            <FiAward className="mx-auto w-8 lg:w-12 h-8 lg:h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 text-sm lg:text-base">Select a patta to check scheme eligibility</p>
          </div>
        )}
      </div>
    );
  }
};

export default Dashboard;