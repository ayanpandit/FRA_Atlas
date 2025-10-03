import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Mail, 
  Clock, 
  Activity,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Crown,
  FileText,
  Search,
  Filter,
  Calendar,
  MapPin
} from 'lucide-react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@fra.gov.in',
      role: 'Admin',
      region: 'Maharashtra',
      status: 'Active',
      lastLogin: '2024-01-15 14:30',
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@fra.gov.in',
      role: 'Officer',
      region: 'Karnataka',
      status: 'Active',
      lastLogin: '2024-01-14 09:15',
      joinDate: '2023-08-22'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      email: 'vikram.singh@community.org',
      role: 'Patta Holder',
      region: 'Rajasthan',
      status: 'Inactive',
      lastLogin: '2024-01-10 16:45',
      joinDate: '2023-12-01'
    },
    {
      id: 4,
      name: 'Anita Patel',
      email: 'anita.patel@fra.gov.in',
      role: 'Officer',
      region: 'Gujarat',
      status: 'Active',
      lastLogin: '2024-01-15 11:20',
      joinDate: '2023-09-10'
    }
  ]);

  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      user: 'Rajesh Kumar',
      action: 'Approved Patta Application #PA-2024-001',
      timestamp: '2024-01-15 14:25',
      type: 'approval'
    },
    {
      id: 2,
      user: 'Priya Sharma',
      action: 'Updated user role for Vikram Singh',
      timestamp: '2024-01-14 16:30',
      type: 'role_change'
    },
    {
      id: 3,
      user: 'Anita Patel',
      action: 'Reviewed Community Forest Rights claim',
      timestamp: '2024-01-14 10:15',
      type: 'review'
    },
    {
      id: 4,
      user: 'System',
      action: 'New user registration: Vikram Singh',
      timestamp: '2024-01-13 09:30',
      type: 'registration'
    }
  ]);

  const [newUser, setNewUser] = useState({
    email: '',
    role: 'Officer',
    region: 'Maharashtra'
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Crown className="h-4 w-4" />;
      case 'Officer': return <Shield className="h-4 w-4" />;
      case 'Patta Holder': return <FileText className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Officer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Patta Holder': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Active' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'role_change': return <Edit3 className="h-4 w-4 text-blue-500" />;
      case 'review': return <Activity className="h-4 w-4 text-orange-500" />;
      case 'registration': return <Plus className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = () => {
    if (!newUser.email) return;
    
    const user = {
      id: users.length + 1,
      name: 'New User',
      email: newUser.email,
      role: newUser.role,
      region: newUser.region,
      status: 'Active',
      lastLogin: 'Never',
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setNewUser({ email: '', role: 'Officer', region: 'Maharashtra' });
    
    // Add to activity log
    const activity = {
      id: activityLog.length + 1,
      user: 'System',
      action: `Invited new user: ${newUser.email}`,
      timestamp: new Date().toLocaleString(),
      type: 'registration'
    };
    setActivityLog([activity, ...activityLog]);
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    const user = users.find(u => u.id === userId);
    const activity = {
      id: activityLog.length + 1,
      user: 'Current User',
      action: `Updated role for ${user.name} to ${newRole}`,
      timestamp: new Date().toLocaleString(),
      type: 'role_change'
    };
    setActivityLog([activity, ...activityLog]);
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
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
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-6 lg:p-8 alan-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
            <Users className="h-6 w-6 text-blue-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
        </div>
        <p className="text-gray-600">Manage users, roles, and permissions for the FRA Dashboard</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="bg-white rounded-xl p-2 border-2 border-gray-200/50" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.08)'}}>
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'roles', label: 'Role Management', icon: Shield },
              { id: 'invite', label: 'Invite Users', icon: Plus },
              { id: 'activity', label: 'Activity Log', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-teal-800 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={activeTab === tab.id ? {
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2)'
                } : {}}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200/50 mb-6 transform hover:scale-[1.01] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium text-gray-700"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Officer">Officer</option>
                  <option value="Patta Holder">Patta Holder</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table/Cards */}
          <div className="bg-white rounded-xl border-2 border-gray-200/50 overflow-hidden transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {user.region}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user.lastLogin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          <span className="text-sm">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="text-teal-700 hover:text-teal-900 transform hover:scale-110 transition-all duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(user.status)}
                      <span className="text-sm">{user.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {user.region}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {user.lastLogin}
                    </div>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-teal-700 hover:text-teal-900 transform hover:scale-110 transition-all duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role Management Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200/50 transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
              <Shield className="h-5 w-5 text-blue-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
            </div>
            Role Management
          </h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500/40 transition-all duration-200 hover:shadow-md" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'}}>
                <div className="mb-2 md:mb-0">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Current Role:</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="ml-3 px-3 py-1 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Officer">Officer</option>
                    <option value="Patta Holder">Patta Holder</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite User Tab */}
      {activeTab === 'invite' && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200/50 transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(34, 197, 94, 0.3)'}}>
              <Plus className="h-5 w-5 text-green-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
            </div>
            Invite New User
          </h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium"
              >
                <option value="Officer">Officer</option>
                <option value="Admin">Admin</option>
                <option value="Patta Holder">Patta Holder</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Region
              </label>
              <select
                value={newUser.region}
                onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Odisha">Odisha</option>
                <option value="Jharkhand">Jharkhand</option>
              </select>
            </div>
            
            <button
              onClick={handleInviteUser}
              disabled={!newUser.email}
              className="w-full bg-teal-800 text-white px-4 py-2 rounded-lg hover:bg-teal-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold transform hover:scale-105"
            >
              Send Invitation
            </button>
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border-2 border-gray-200/50 overflow-hidden transform hover:scale-[1.005] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(249, 115, 22, 0.3)'}}>
                <Activity className="h-5 w-5 text-orange-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)'}} />
              </div>
              Activity Log
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activityLog.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default UserManagement;