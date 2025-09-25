import React, { useState } from 'react';
import { 
  MapPin, 
  FileText, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Users, 
  Ruler, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Share2,
  Edit,
  Trash2,
  MapIcon,
  TreePine,
  Home,
  Briefcase
} from 'lucide-react';

const Claimant_patta = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const pattas = [
    {
      id: "FRA001",
      title: "Residential Plot - Main Village",
      location: "Village Khajuraho, Plot 45",
      coordinates: "24.8318° N, 79.9199° E",
      area: "2.5 hectares",
      areaInAcres: "6.18 acres",
      status: "Verified",
      type: "Individual",
      category: "Residential",
      dateApplied: "Jan 15, 2023",
      dateApproved: "Mar 22, 2023",
      validUntil: "Mar 22, 2033",
      landUse: "Residential & Agricultural",
      soilType: "Alluvial",
      forestType: "Mixed Deciduous",
      nearbyLandmarks: ["Primary School", "Community Well", "Village Temple"],
      documents: ["Survey Settlement", "Revenue Records", "GPS Mapping"],
      lastUpdated: "2 days ago",
      progress: 100,
      issues: []
    },
    {
      id: "FRA002",
      title: "Agricultural Land - North Block",
      location: "Village Khajuraho, Plot 67",
      coordinates: "24.8405° N, 79.9245° E",
      area: "1.8 hectares",
      areaInAcres: "4.45 acres",
      status: "Pending",
      type: "Community",
      category: "Agricultural",
      dateApplied: "Feb 10, 2024",
      dateApproved: null,
      validUntil: null,
      landUse: "Agricultural & Grazing",
      soilType: "Black Cotton",
      forestType: "Teak Plantation",
      nearbyLandmarks: ["Irrigation Canal", "Community Center"],
      documents: ["Pending Survey", "Community Resolution"],
      lastUpdated: "5 days ago",
      progress: 65,
      issues: ["Additional documents required", "Boundary dispute resolution pending"]
    },
    {
      id: "FRA003",
      title: "Community Forest Rights",
      location: "Village Khajuraho, Block C",
      coordinates: "24.8392° N, 79.9178° E",
      area: "3.2 hectares",
      areaInAcres: "7.91 acres",
      status: "Approved",
      type: "Individual",
      category: "Forest Rights",
      dateApplied: "Nov 8, 2023",
      dateApproved: "Jan 18, 2024",
      validUntil: "Jan 18, 2034",
      landUse: "Forest Conservation & NTFP Collection",
      soilType: "Red Laterite",
      forestType: "Sal Dominant",
      nearbyLandmarks: ["Sacred Grove", "Seasonal Stream", "Wildlife Corridor"],
      documents: ["Community Forest Rights Certificate", "Management Plan", "Biodiversity Assessment"],
      lastUpdated: "1 week ago",
      progress: 100,
      issues: []
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Under Review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Residential':
        return <Home className="h-5 w-5" />;
      case 'Agricultural':
        return <Briefcase className="h-5 w-5" />;
      case 'Forest Rights':
        return <TreePine className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const filteredPattas = pattas.filter(patta => {
    const matchesSearch = patta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patta.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patta.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         patta.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const PattaCard = ({ patta }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              {getCategoryIcon(patta.category)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{patta.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{patta.location}</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patta.status)}`}>
                  {getStatusIcon(patta.status)}
                  <span className="ml-1">{patta.status}</span>
                </span>
                <span className="text-xs text-gray-500">ID: {patta.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Processing Progress</span>
            <span className="text-gray-600">{patta.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                patta.progress === 100 ? 'bg-green-500' : 
                patta.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${patta.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Ruler className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Area:</span>
              <span className="font-medium text-gray-900">{patta.area}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Applied:</span>
              <span className="font-medium text-gray-900">{patta.dateApplied}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {patta.type === 'Individual' ? 
                <User className="h-4 w-4 text-gray-500" /> : 
                <Users className="h-4 w-4 text-gray-500" />
              }
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">{patta.type}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Coordinates:</span>
              <span className="font-medium text-gray-900 text-xs">{patta.coordinates}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TreePine className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Forest Type:</span>
              <span className="font-medium text-gray-900">{patta.forestType}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-900">{patta.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Issues */}
        {patta.issues.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-700">Pending Issues</span>
            </div>
            <ul className="space-y-1">
              {patta.issues.map((issue, index) => (
                <li key={index} className="text-sm text-orange-700">• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <MapIcon className="h-4 w-4" />
            <span>View on Map</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          {patta.status === 'Pending' && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
              <Edit className="h-4 w-4" />
              <span>Update</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Pattas</h2>
          <p className="text-gray-600">Manage your forest rights certificates and land records</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Apply for New Patta</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, location, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredPattas.length} of {pattas.length} pattas
        </p>
      </div>

      {/* Pattas Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {filteredPattas.map((patta) => (
          <PattaCard key={patta.id} patta={patta} />
        ))}
      </div>

      {/* Empty State */}
      {filteredPattas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pattas Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? "No pattas match your current search and filter criteria."
              : "You haven't applied for any pattas yet."
            }
          </p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
            Apply for New Patta
          </button>
        </div>
      )}
    </div>
  );
};

export default Claimant_patta;