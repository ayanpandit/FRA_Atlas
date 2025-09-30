import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  FileText, 
  Clock, 
  Wallet, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  Award,
  Bell,
  ArrowUpRight,
  Activity,
  DollarSign,
  Users,
  Target
} from 'lucide-react';

const Dashboard = ({ userData }) => {
  // Live data states
  const [pattas, setPattas] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Derived values for the top stat cards
  const activePattasCount = pattas.filter(p => (p.status || '').toString().toLowerCase() !== 'pending').length;
  const pendingReviewsCount = pattas.filter(p => (p.status || '').toString().toLowerCase() === 'pending').length;
  const totalBenefitsReceived = paymentsTotal || 0;
  // Schemes enrolled: collect recommended/enrolled schemes from non-pending pattas
  const schemesEnrolledSet = new Set();
  pattas.forEach(p => {
    try {
      const rec = p.recommended_schemes ? (typeof p.recommended_schemes === 'string' ? JSON.parse(p.recommended_schemes) : p.recommended_schemes) : [];
      if ((p.status || '').toString().toLowerCase() !== 'pending') {
        (rec || []).forEach(s => schemesEnrolledSet.add(s));
      }
    } catch (e) {
      // ignore parse errors
    }
  });
  const schemesEnrolled = schemesEnrolledSet.size;

  const stats = [
    { title: 'Active Pattas', value: String(activePattasCount), change: '', trend: activePattasCount > 0 ? 'up' : 'neutral', icon: FileText, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Pending Reviews', value: String(pendingReviewsCount), change: '', trend: pendingReviewsCount > 0 ? 'neutral' : 'up', icon: Clock, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'Total Benefits Received', value: `₹${totalBenefitsReceived.toLocaleString()}`, change: '', trend: 'up', icon: Wallet, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Schemes Enrolled', value: String(schemesEnrolled), change: '', trend: schemesEnrolled > 0 ? 'up' : 'neutral', icon: Award, bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
  ];

  const recentActivity = [
    {
      type: "patta",
      title: "Patta Verification Completed",
      description: "FRA001 - Village Khajuraho, Plot 45 has been successfully verified",
      time: "2 days ago",
      status: "completed",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      type: "scheme",
      title: "PM-KISAN Eligibility Confirmed",
      description: "You are now eligible for PM-KISAN scheme benefits",
      time: "5 days ago",
      status: "new",
      icon: Award,
      color: "text-blue-500"
    },
    {
      type: "payment",
      title: "MGNREGA Payment Received",
      description: "₹2,000 has been credited to your account",
      time: "1 week ago",
      status: "completed",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      type: "document",
      title: "Document Upload Required",
      description: "Additional documents needed for FRA002 verification",
      time: "1 week ago",
      status: "action_required",
      icon: AlertCircle,
      color: "text-orange-500"
    },
    {
      type: "meeting",
      title: "Community Meeting Scheduled",
      description: "Village forest rights meeting on March 15, 2025",
      time: "2 weeks ago",
      status: "upcoming",
      icon: Users,
      color: "text-purple-500"
    }
  ];

  const upcomingEvents = [
    {
      title: "Document Submission Deadline",
      date: "Mar 15, 2025",
      type: "deadline",
      priority: "high"
    },
    {
      title: "PM-KISAN Next Payment",
      date: "Mar 31, 2025",
      type: "payment",
      priority: "medium"
    },
    {
      title: "Annual Forest Survey",
      date: "Apr 10, 2025",
      type: "survey",
      priority: "low"
    }
  ];

  const quickActions = [
    { name: "Apply for New Scheme", icon: Award, color: "bg-blue-500" },
    { name: "Upload Documents", icon: FileText, color: "bg-green-500" },
    { name: "View Payment History", icon: Wallet, color: "bg-purple-500" },
    { name: "Submit Feedback", icon: Bell, color: "bg-orange-500" }
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const ownerId = userData && userData.id ? userData.id : 'guest';
      try {
        // Fetch pattas for user
        const { data: pData, error: pErr } = await supabase.from('pattas').select('*').eq('owner_id', ownerId).order('date_applied', { ascending: false });
        if (pErr) {
          console.warn('Failed to fetch pattas', pErr.message || pErr);
        }
        if (mounted) setPattas(pData || []);

        // Fetch schemes table if exists
        try {
          const { data: sData, error: sErr } = await supabase.from('schemes').select('*').order('name', { ascending: true });
          if (sErr) {
            console.warn('Schemes table not available or failed to fetch', sErr.message || sErr);
          } else if (mounted) setSchemes(sData || []);
        } catch (e) {
          console.warn('Error fetching schemes', e);
        }

        // Fetch payments total if payments table exists
        try {
          const { data: payData, error: payErr } = await supabase.from('payments').select('amount').eq('user_id', ownerId);
          if (payErr) {
            console.warn('Payments table missing or failed to fetch', payErr.message || payErr);
          } else {
            const total = (payData || []).reduce((s, row) => s + (parseFloat(row.amount) || 0), 0);
            if (mounted) setPaymentsTotal(total);
          }
        } catch (e) {
          console.warn('Error fetching payments', e);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [userData]);

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                {stat.trend === 'down' && <TrendingUp className="h-4 w-4 rotate-180" />}
                {stat.trend === 'neutral' && <Activity className="h-4 w-4" />}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className={`text-sm ${
                stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-gray-600 text-sm">Your latest updates and notifications</p>
                </div>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className={`flex-shrink-0 p-2 rounded-lg bg-gray-100`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</p>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'action_required' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {activity.status === 'completed' ? 'Completed' :
                           activity.status === 'new' ? 'New' :
                           activity.status === 'action_required' ? 'Action Required' :
                           'Upcoming'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button key={index} className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left">
                  <div className={`${action.color} p-2 rounded-lg`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{action.name}</span>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.priority === 'high' ? 'bg-red-400' :
                    event.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5" />
              <h3 className="text-lg font-bold">Your Progress</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Document Verification</span>
                  <span>67%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;