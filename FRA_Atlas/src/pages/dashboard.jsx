import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, Search, Eye, Check, X, ChevronDown, Calendar,
  TrendingUp, TrendingDown, BarChart3, Activity, Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const [stats, setStats] = useState({
    total: 1247,
    approved: 892,
    pending: 255,
    rejected: 100
  });

  const monthlyData = [
    { month: 'Jan', uploaded: 120, approved: 95, rejected: 15, pending: 10 },
    { month: 'Feb', uploaded: 140, approved: 110, rejected: 18, pending: 12 },
    { month: 'Mar', uploaded: 160, approved: 125, rejected: 22, pending: 13 },
    { month: 'Apr', uploaded: 180, approved: 145, rejected: 20, pending: 15 },
    { month: 'May', uploaded: 200, approved: 165, rejected: 25, pending: 10 },
    { month: 'Jun', uploaded: 175, approved: 140, rejected: 18, pending: 17 }
  ];

  const villageData = [
    { village: 'Rampur', pattas: 85, approved: 65, pending: 15, rejected: 5 },
    { village: 'Kumhari', pattas: 92, approved: 70, pending: 18, rejected: 4 },
    { village: 'Bastar', pattas: 78, approved: 58, pending: 12, rejected: 8 },
    { village: 'Jagdalpur', pattas: 105, approved: 82, pending: 16, rejected: 7 },
    { village: 'Kanker', pattas: 68, approved: 52, pending: 11, rejected: 5 }
  ];

  const statusData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ];

  const [pattaData, setPattaData] = useState([
    {
      id: 'FRA2024001',
      holderName: 'Ramesh Kumar Singh',
      village: 'Rampur',
      district: 'Bastar',
      uploadDate: '2024-09-20',
      status: 'pending',
      officer: 'Suresh Patel',
      area: '2.5 acres',
      documents: 4
    },
    {
      id: 'FRA2024002',
      holderName: 'Sunita Devi',
      village: 'Kumhari',
      district: 'Durg',
      uploadDate: '2024-09-19',
      status: 'approved',
      officer: 'Priya Sharma',
      area: '1.8 acres',
      documents: 5
    },
    {
      id: 'FRA2024003',
      holderName: 'Mohan Lal Verma',
      village: 'Bastar',
      district: 'Bastar',
      uploadDate: '2024-09-18',
      status: 'rejected',
      officer: 'Rajesh Gupta',
      area: '3.2 acres',
      documents: 3
    },
    {
      id: 'FRA2024004',
      holderName: 'Geeta Bai',
      village: 'Jagdalpur',
      district: 'Bastar',
      uploadDate: '2024-09-17',
      status: 'pending',
      officer: 'Suresh Patel',
      area: '2.1 acres',
      documents: 4
    },
    {
      id: 'FRA2024005',
      holderName: 'Vishnu Prasad',
      village: 'Kanker',
      district: 'Kanker',
      uploadDate: '2024-09-16',
      status: 'approved',
      officer: 'Priya Sharma',
      area: '1.5 acres',
      documents: 5
    },
    {
      id: 'FRA2024006',
      holderName: 'Kavita Sharma',
      village: 'Rampur',
      district: 'Bastar',
      uploadDate: '2024-09-15',
      status: 'pending',
      officer: 'Rajesh Gupta',
      area: '3.1 acres',
      documents: 4
    }
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-900/20 text-green-300 border border-green-700',
      pending: 'bg-yellow-900/20 text-yellow-300 border border-yellow-700',
      rejected: 'bg-red-900/20 text-red-300 border border-red-700'
    };
    return styles[status] || 'bg-gray-900/20 text-gray-300 border border-gray-700';
  };

  const handleAction = (pattaId, action) => {
    setPattaData(prev => prev.map(patta => 
      patta.id === pattaId 
        ? { ...patta, status: action === 'approve' ? 'approved' : 'rejected' }
        : patta
    ));
    
    const updatedData = pattaData.map(patta => 
      patta.id === pattaId 
        ? { ...patta, status: action === 'approve' ? 'approved' : 'rejected' }
        : patta
    );
    
    const newStats = {
      total: updatedData.length,
      approved: updatedData.filter(p => p.status === 'approved').length,
      pending: updatedData.filter(p => p.status === 'pending').length,
      rejected: updatedData.filter(p => p.status === 'rejected').length
    };
    
    setStats(newStats);
  };

  const filteredData = pattaData.filter(patta => {
    const matchesStatus = selectedStatus === 'all' || patta.status === selectedStatus;
    const matchesVillage = selectedVillage === 'all' || patta.village === selectedVillage;
    const matchesSearch = patta.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patta.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesVillage && matchesSearch;
  });

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-white mb-2">{value.toLocaleString()}</p>
          <div className="flex items-center space-x-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-700 rounded-lg">
          <Icon className="w-6 h-6 text-gray-300" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">Forest Rights Act Dashboard</h1>
              <p className="text-gray-400 text-sm">Gram Sabha Officer Management Portal</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Export Report
              </button>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-300">GO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={stats.total}
            change="+12.3%"
            icon={FileText}
            trend="up"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            change="+8.1%"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Under Review"
            value={stats.pending}
            change="-5.2%"
            icon={Clock}
            trend="down"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            change="+3.4%"
            icon={XCircle}
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Monthly Trends */}
          <div className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium text-white">Application Trends</h3>
              <p className="text-xs text-gray-400">Monthly performance overview</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="uploaded" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium text-white">Status Distribution</h3>
              <p className="text-xs text-gray-400">Current breakdown</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <RechartsPieChart data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Village Distribution Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-white">Regional Distribution</h3>
            <p className="text-xs text-gray-400">Applications by village/district</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={villageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="village" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }} 
                />
                <Bar dataKey="pattas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="text-sm font-medium text-white">Approval Rate</h4>
            </div>
            <p className="text-xl font-semibold text-white mb-1">{((stats.approved / stats.total) * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400">High success rate this month</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-medium text-white">Avg. Processing</h4>
            </div>
            <p className="text-xl font-semibold text-white mb-1">4.2 days</p>
            <p className="text-xs text-gray-400">Faster than target of 7 days</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-medium text-white">Active Officers</h4>
            </div>
            <p className="text-xl font-semibold text-white mb-1">12</p>
            <p className="text-xs text-gray-400">Processing applications</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-medium text-white">Priority Cases</h4>
            </div>
            <p className="text-xl font-semibold text-white mb-1">8</p>
            <p className="text-xs text-gray-400">Require immediate attention</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select 
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Villages</option>
                  <option value="Rampur">Rampur</option>
                  <option value="Kumhari">Kumhari</option>
                  <option value="Bastar">Bastar</option>
                  <option value="Jagdalpur">Jagdalpur</option>
                  <option value="Kanker">Kanker</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">Applications Management</h3>
                <p className="text-xs text-gray-400">Total {filteredData.length} applications • {stats.pending} pending review</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Application</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Officer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredData.map((patta, index) => (
                  <tr key={patta.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{patta.id}</div>
                        <div className="text-xs text-gray-400">{patta.area} • {patta.documents} docs</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-300">
                            {patta.holderName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{patta.holderName}</div>
                          <div className="text-xs text-gray-400">{patta.uploadDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{patta.village}</div>
                      <div className="text-xs text-gray-400">{patta.district}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patta.status)}`}>
                        {getStatusIcon(patta.status)}
                        <span className="ml-1 capitalize">{patta.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{patta.officer}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        {patta.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(patta.id, 'approve')}
                              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(patta.id, 'reject')}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredData.map((patta) => (
              <div key={patta.id} className="p-4 border-b border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-300">
                        {patta.holderName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{patta.holderName}</h4>
                      <p className="text-xs text-gray-400">{patta.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patta.status)}`}>
                    {getStatusIcon(patta.status)}
                    <span className="ml-1 capitalize">{patta.status}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <p className="text-white">{patta.village}, {patta.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Area:</span>
                    <p className="text-white">{patta.area}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Officer:</span>
                    <p className="text-white">{patta.officer}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Documents:</span>
                    <p className="text-white">{patta.documents}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Applied: {patta.uploadDate}</span>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors">
                      View
                    </button>
                    {patta.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleAction(patta.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(patta.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-white mb-2">No applications found</h3>
              <p className="text-xs text-gray-400">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;