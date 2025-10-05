import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, TrendingUp, TrendingDown, Users, Eye, MoreHorizontal,
  ChevronDown, Printer, CreditCard, DollarSign, Clock
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import PattaApplicationModal from '../components/PattaApplicationModal';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FALLBACK_MONTHLY = MONTH_LABELS.map(month => ({ month, applications: 0, approvals: 0 }));

const INITIAL_SUMMARY = {
  totalApplications: 0,
  approved: 0,
  pending: 0,
  verified: 0,
  beneficiaries: 0
};

const FALLBACK_STATUS_DISTRIBUTION = [
  { name: 'Approved', value: 0, color: '#34d399' },
  { name: 'Pending', value: 0, color: '#fbbf24' },
  { name: 'Verified', value: 0, color: '#38bdf8' }
];

const PIE_FALLBACK_COLORS = ['#34d399', '#a3e635', '#fbbf24', '#38bdf8', '#c084fc'];

const Dashboard = () => {
  const [totalOrdersFilter, setTotalOrdersFilter] = useState('Weekly');
  const [expensesFilter, setExpensesFilter] = useState('Monthly');
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [monthlySeries, setMonthlySeries] = useState({
    applications: Array(12).fill(0),
    approvals: Array(12).fill(0),
    pending: Array(12).fill(0),
    beneficiaries: Array(12).fill(0)
  });
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizeStatus = (status) => (status || 'Unknown').toString().trim();

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status).toLowerCase();
    if (normalized === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (['pending', 'in review', 'under review', 'submitted', 'processing'].includes(normalized)) return 'bg-amber-100 text-amber-700';
    if (normalized === 'verified') return 'bg-sky-100 text-sky-700';
    if (['rejected', 'cancelled', 'denied'].includes(normalized)) return 'bg-rose-100 text-rose-700';
    return 'bg-gray-100 text-gray-800';
  };

  const computeGrowth = (series) => {
    const currentMonth = new Date().getMonth();
    const previousMonth = (currentMonth + 11) % 12;
    const currentValue = series[currentMonth] ?? 0;
    const previousValue = series[previousMonth] ?? 0;
    let percentChange = 0;
    if (previousValue === 0) {
      percentChange = currentValue > 0 ? 100 : 0;
    } else {
      percentChange = ((currentValue - previousValue) / previousValue) * 100;
    }
    return { currentValue, previousValue, percentChange };
  };

  const formatPercentChange = (value) => {
    if (!Number.isFinite(value)) return '0%';
    const rounded = Math.abs(value) < 0.1 ? 0 : value;
    const formatted = rounded.toFixed(1);
    return `${rounded >= 0 ? '+' : ''}${formatted}%`;
  };

  const formatDelta = (current, previous) => {
    const delta = current - previous;
    const rounded = Math.round(delta);
    return `${rounded >= 0 ? '+' : ''}${rounded}`;
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      setMetricsError(null);

      const { data, error } = await supabase
        .from('pattas')
        .select('patta_id, holder_name, village, state, status, date_applied, created_at, area_hectares');

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load dashboard metrics:', error);
        setMetricsError('Unable to load live dashboard data right now. Showing the latest available snapshot.');
        setSummary(INITIAL_SUMMARY);
        setMonthlySeries({
          applications: Array(12).fill(0),
          approvals: Array(12).fill(0),
          pending: Array(12).fill(0),
          beneficiaries: Array(12).fill(0)
        });
        setStatusDistribution([]);
        setRecentApplications([]);
        setIsLoadingMetrics(false);
        return;
      }

      const records = data || [];
      const totalApplications = records.length;

      const approvedStatuses = new Set(['approved']);
      const pendingStatuses = new Set(['pending', 'submitted', 'in review', 'under review', 'processing']);

      const statusCounts = records.reduce((acc, record) => {
        const status = (record.status || 'unknown').toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const approvedCount = Array.from(approvedStatuses).reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
      const verifiedCount = statusCounts['verified'] || 0;
      const pendingCount = Array.from(pendingStatuses).reduce((sum, status) => sum + (statusCounts[status] || 0), 0);

      const beneficiariesSet = new Set();
      const beneficiariesMonthlySets = Array.from({ length: 12 }, () => new Set());
      const monthlyApplications = Array(12).fill(0);
      const monthlyApprovals = Array(12).fill(0);
      const monthlyPending = Array(12).fill(0);

      records.forEach(record => {
        const status = (record.status || '').toLowerCase();
        const holder = record.holder_name ? record.holder_name.trim() : '';
        if (holder) {
          beneficiariesSet.add(holder.toLowerCase());
        }

        const dateValue = record.date_applied || record.created_at;
        const parsedDate = dateValue ? new Date(dateValue) : null;
        if (!parsedDate || Number.isNaN(parsedDate.getTime())) return;

        const monthIndex = parsedDate.getMonth();
        monthlyApplications[monthIndex] += 1;
        if (approvedStatuses.has(status)) {
          monthlyApprovals[monthIndex] += 1;
        } else if (pendingStatuses.has(status)) {
          monthlyPending[monthIndex] += 1;
        }
        if (holder) {
          beneficiariesMonthlySets[monthIndex].add(holder.toLowerCase());
        }
      });

      const monthlyBeneficiaries = beneficiariesMonthlySets.map(set => set.size);

      const distribution = [];
      if (totalApplications > 0) {
        distribution.push({ name: 'Approved', value: approvedCount, color: '#34d399' });
        distribution.push({ name: 'Pending', value: pendingCount, color: '#fbbf24' });
        if (verifiedCount > 0) {
          distribution.push({ name: 'Verified', value: verifiedCount, color: '#38bdf8' });
        }
        const otherCount = totalApplications - approvedCount - pendingCount - verifiedCount;
        if (otherCount > 0) {
          distribution.push({ name: 'Other', value: otherCount, color: '#c084fc' });
        }
      }

      const recent = [...records]
        .sort((a, b) => {
          const dateA = new Date(a.date_applied || a.created_at || 0).getTime();
          const dateB = new Date(b.date_applied || b.created_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 8)
        .map(item => ({
          id: item.patta_id || '—',
          holder: item.holder_name || '—',
          status: normalizeStatus(item.status),
          area: typeof item.area_hectares === 'number' && !Number.isNaN(item.area_hectares)
            ? `${item.area_hectares.toFixed(2)} ha`
            : '—',
          date: formatDate(item.date_applied || item.created_at)
        }));

      if (!isMounted) return;

      setSummary({
        totalApplications,
        approved: approvedCount,
        pending: pendingCount,
        verified: verifiedCount,
        beneficiaries: beneficiariesSet.size
      });
      setMonthlySeries({
        applications: monthlyApplications,
        approvals: monthlyApprovals,
        pending: monthlyPending,
        beneficiaries: monthlyBeneficiaries
      });
      setStatusDistribution(distribution);
      setRecentApplications(recent);
      setIsLoadingMetrics(false);
    };

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handlePattaCreated = (newPatta) => {
    setRefreshKey((prev) => prev + 1);
    if (newPatta) {
      setRecentApplications((prev) => {
        const formatted = {
          id: newPatta.patta_id || '—',
          holder: newPatta.holder_name || '—',
          status: normalizeStatus(newPatta.status),
          area:
            typeof newPatta.area_hectares === 'number' && !Number.isNaN(newPatta.area_hectares)
              ? `${newPatta.area_hectares.toFixed(2)} ha`
              : '—',
          date: formatDate(newPatta.date_applied || newPatta.created_at)
        };
        const deduped = [formatted, ...prev.filter((item) => item.id !== formatted.id)];
        return deduped.slice(0, 8);
      });
    }
  };

  const applicationsGrowth = computeGrowth(monthlySeries.applications);
  const approvalsGrowth = computeGrowth(monthlySeries.approvals);
  const pendingGrowth = computeGrowth(monthlySeries.pending);
  const beneficiaryGrowth = computeGrowth(monthlySeries.beneficiaries);

  const applicationsChartData = MONTH_LABELS.map((month, index) => ({
    month,
    applications: monthlySeries.applications[index] ?? 0,
    approvals: monthlySeries.approvals[index] ?? 0
  }));

  const totalCurrentMonth = applicationsGrowth.currentValue;
  const totalPreviousMonth = applicationsGrowth.previousValue;
  const displayedDistribution = statusDistribution.length > 0
    ? statusDistribution
    : FALLBACK_STATUS_DISTRIBUTION;
  const statusTotal = displayedDistribution.reduce((sum, item) => sum + item.value, 0);
  const formatStatusShare = (value) => {
    if (statusTotal === 0) {
      return isLoadingMetrics ? '—' : '0%';
    }
    const percent = (value / statusTotal) * 100;
    return `${percent.toFixed(1)}%`;
  };

  const getTrendChipClasses = (percent, theme = 'positive') => {
    const positiveClasses = theme === 'warning'
      ? 'text-amber-600 bg-amber-50 border border-amber-200/60'
      : 'text-green-600 bg-green-50 border border-green-200/60';
    const negativeClasses = theme === 'warning'
      ? 'text-emerald-600 bg-emerald-50 border border-emerald-200/60'
      : 'text-red-600 bg-red-50 border border-red-200/60';
    return percent >= 0 ? positiveClasses : negativeClasses;
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
      <div className="min-h-screen bg-gray-50 p-6 alan-sans">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">FRA Dashboard</h1>
          <button
            className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm"
            onClick={() => setShowApplicationModal(true)}
          >
            <span>New Application</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {metricsError && (
          <div className="mb-6 p-3 border border-amber-200 bg-amber-50 text-sm text-amber-700 rounded-xl shadow-sm">
            {metricsError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bank Connection Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-600 rounded-2xl p-10 text-white relative overflow-hidden min-h-[405px] flex items-center border-2 border-teal-400/30 shadow-2xl shadow-teal-900/50 hover:shadow-3xl hover:shadow-teal-800/60 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.1), 0 25px 50px -12px rgba(20, 83, 83, 0.5), 0 0 0 1px rgba(45, 212, 191, 0.1)'}}>
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-tr from-white/10 via-transparent to-white/5"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 rounded-2xl"></div>
              <div className="relative z-10 w-full">
                <h3 className="text-lg font-semibold mb-2">Forest Rights Management System</h3>
                <p className="text-sm text-teal-100 mb-6">
                  Streamline your forest rights applications and documentation process
                </p>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column - Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Overall Revenue */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(59, 130, 246, 0.3)'}}>
                  <DollarSign className="w-4 h-4 text-blue-700 transform hover:scale-105 transition-transform duration-200" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', textShadow: '0 1px 1px rgba(0,0,0,0.2)'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold text-gray-900">{isLoadingMetrics ? '—' : summary.totalApplications.toLocaleString()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTrendChipClasses(applicationsGrowth.percentChange)}`}>
                      {formatPercentChange(applicationsGrowth.percentChange)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'}}>
                  <TrendingUp className="w-4 h-4 text-teal-700 transform hover:scale-105 transition-transform duration-200" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', textShadow: '0 1px 1px rgba(0,0,0,0.2)'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold text-gray-900">{isLoadingMetrics ? '—' : summary.approved.toLocaleString()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTrendChipClasses(approvalsGrowth.percentChange)}`}>
                      {formatPercentChange(approvalsGrowth.percentChange)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(249, 115, 22, 0.3)'}}>
                  <DollarSign className="w-4 h-4 text-orange-700 transform hover:scale-105 transition-transform duration-200" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', textShadow: '0 1px 1px rgba(0,0,0,0.2)'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold text-gray-900">{isLoadingMetrics ? '—' : summary.pending.toLocaleString()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTrendChipClasses(pendingGrowth.percentChange, 'warning')}`}>
                      {formatPercentChange(pendingGrowth.percentChange)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(245, 158, 11, 0.3)'}}>
                  <Users className="w-4 h-4 text-yellow-700 transform hover:scale-105 transition-transform duration-200" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', textShadow: '0 1px 1px rgba(0,0,0,0.2)'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Beneficiaries</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold text-gray-900">{isLoadingMetrics ? '—' : summary.beneficiaries.toLocaleString()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTrendChipClasses(beneficiaryGrowth.percentChange)}`}>
                      {formatPercentChange(beneficiaryGrowth.percentChange)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Money Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Application Insights</h3>
                  <p className="text-sm text-gray-600">Monthly overview of forest rights applications</p>
                </div>
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View report
                </button>
              </div>
              <div className="h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-transparent rounded-lg"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationsChartData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis hide />
                    <Bar dataKey="applications" fill="url(#emeraldGradient)" radius={[4, 4, 0, 0]} style={{filter: 'drop-shadow(0 4px 6px rgba(52, 211, 153, 0.3))'}} />
                    <Bar dataKey="approvals" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} style={{filter: 'drop-shadow(0 4px 6px rgba(96, 165, 250, 0.3))'}} />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Applications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Approvals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Total Orders */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Total Applications</h3>
              <select 
                value={totalOrdersFilter} 
                onChange={(e) => setTotalOrdersFilter(e.target.value)}
                className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-2xl font-bold text-gray-900">{isLoadingMetrics ? '—' : summary.totalApplications.toLocaleString()}</span>
              <span className={`text-sm px-2 py-1 rounded flex items-center shadow-sm ${isLoadingMetrics ? 'text-gray-500 bg-gray-100 border border-gray-200/60' : getTrendChipClasses(applicationsGrowth.percentChange)}`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {isLoadingMetrics ? '—' : `${formatDelta(totalCurrentMonth, totalPreviousMonth)} change`}
              </span>
            </div>
            <div className="h-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-end justify-center p-4 relative overflow-hidden" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
              <div className="w-12 h-20 bg-gradient-to-t from-teal-700 to-teal-500 rounded-t flex items-end justify-center text-white text-xs font-medium pb-2 relative transform hover:scale-105 transition-transform duration-300" style={{boxShadow: '0 8px 16px rgba(20, 83, 83, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t"></div>
                <span className="relative z-10">{isLoadingMetrics ? '—' : totalCurrentMonth}</span>
              </div>
            </div>
          </div>

          {/* Expenses Analysis */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200/50 transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 20px 40px -12px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Status Distribution</h3>
              <select 
                value={expensesFilter} 
                onChange={(e) => setExpensesFilter(e.target.value)}
                className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="h-32 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-transparent rounded-lg"></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayedDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                    style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'}}
                  >
                    {displayedDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={entry.color || PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]}
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {displayedDistribution.slice(0, 3).map((item, index) => {
                const color = item.color || PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length];
                return (
                  <div className="flex items-center space-x-2" key={`${item.name}-${index}`}>
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{
                        backgroundColor: color,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px ${color}33`
                      }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {isLoadingMetrics ? '—' : formatStatusShare(item.value)}
                    </span>
                    {!isLoadingMetrics && (
                      <span className="text-xs text-gray-500">({item.value.toLocaleString()} applications)</span>
                    )}
                  </div>
                );
              })}
              {!isLoadingMetrics && displayedDistribution.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{displayedDistribution.length - 3} more statuses tracked
                </div>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Applications</h3>
              <button>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-100">
                <span>Status</span>
                <span>ID</span>
                <span>Holder</span>
                <span>Area</span>
                <span>Date Filed</span>
              </div>
              {isLoadingMetrics ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="grid grid-cols-5 gap-2 py-2 text-sm items-center animate-pulse">
                    <span className="h-5 bg-gray-100 rounded"></span>
                    <span className="h-5 bg-gray-100 rounded"></span>
                    <span className="h-5 bg-gray-100 rounded"></span>
                    <span className="h-5 bg-gray-100 rounded"></span>
                    <span className="h-5 bg-gray-100 rounded"></span>
                  </div>
                ))
              ) : recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application.id} className="grid grid-cols-5 gap-2 py-2 text-sm items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-gray-900 font-medium">{application.id}</span>
                    <span className="text-gray-600 truncate" title={application.holder}>{application.holder}</span>
                    <span className="text-gray-900 font-medium">{application.area}</span>
                    <span className="text-gray-500 text-xs">{application.date}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">
                  No applications found yet. Once new applications are submitted they'll show up here.
                </div>
              )}
            </div>
          </div>
        </div>

        <PattaApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          ownerId="admin-dashboard"
          submitLabel="Create Application"
          onPattaCreated={handlePattaCreated}
        />
        </div>
      </div>
    </>
  );
};

export default Dashboard;