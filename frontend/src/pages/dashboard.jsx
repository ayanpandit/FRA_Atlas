import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, TrendingUp, TrendingDown, Users, Eye, MoreHorizontal,
  ChevronDown, Printer, CreditCard, DollarSign, Clock
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

// Chart data
const moneyInsightsData = [
  { month: 'Jan', income: 45000, expense: 32000 },
  { month: 'Feb', income: 52000, expense: 38000 },
  { month: 'Mar', income: 48000, expense: 35000 },
  { month: 'Apr', income: 61000, expense: 42000 },
  { month: 'May', income: 55000, expense: 39000 },
  { month: 'Jun', income: 67000, expense: 45000 },
  { month: 'Jul', income: 59000, expense: 41000 },
  { month: 'Aug', income: 70000, expense: 48000 },
  { month: 'Sep', income: 65000, expense: 44000 },
  { month: 'Oct', income: 72000, expense: 50000 },
  { month: 'Nov', income: 68000, expense: 46000 },
  { month: 'Dec', income: 75000, expense: 52000 }
];

const totalOrdersData = [
  { name: 'Orders', value: 1308, fill: '#34d399' }
];

const expensesData = [
  { name: 'Payroll', value: 52, fill: '#34d399' },
  { name: 'Business Supplies', value: 17.5, fill: '#a3e635' },
  { name: 'Other', value: 30.5, fill: '#fbbf24' }
];

const recentInvoices = [
  { id: '677829', client: 'Emma Tomson', amount: '$3,250', date: '30-09-2023', status: 'Overdue' },
  { id: '893750', client: 'Richard Miller', amount: '$12,800', date: '30-09-2023', status: 'Paid' },
  { id: '814113', client: 'Liam Davis', amount: '$1,300', date: '30-09-2023', status: 'Overdue' },
  { id: '105226', client: 'Robert Brown', amount: '$4,040', date: '29-09-2023', status: 'Overdue' },
  { id: '192803', client: 'Noah Williams', amount: '$850', date: '29-09-2023', status: 'First Paid' },
  { id: '553714', client: 'Amanda C. Herman', amount: '$2,150', date: '29-09-2023', status: 'Paid' },
  { id: '781926', client: 'Luna Thomas', amount: '$315', date: '29-09-2023', status: 'Last Paid' },
  { id: '542809', client: 'Maxwell Kim', amount: '$470', date: '29-09-2023', status: 'Paid' }
];

const Dashboard = () => {
  const [totalOrdersFilter, setTotalOrdersFilter] = useState('Weekly');
  const [expensesFilter, setExpensesFilter] = useState('Monthly');

  const getStatusColor = (status) => {
    const colors = {
      'Overdue': 'bg-red-100 text-red-800',
      'Paid': 'bg-emerald-100 text-emerald-800',
      'First Paid': 'bg-emerald-100 text-emerald-800',
      'Last Paid': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
          <button className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm">
            <span>New Application</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

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
                    <span className="text-xl font-semibold text-gray-900">2,350</span>
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+8.4%</span>
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
                    <span className="text-xl font-semibold text-gray-900">1,020</span>
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+15%</span>
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
                    <span className="text-xl font-semibold text-gray-900">950</span>
                    <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">+1.8%</span>
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
                    <span className="text-xl font-semibold text-gray-900">3,065</span>
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+5.0%</span>
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
                  <BarChart data={moneyInsightsData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis hide />
                    <Bar dataKey="income" fill="url(#emeraldGradient)" radius={[4, 4, 0, 0]} style={{filter: 'drop-shadow(0 4px 6px rgba(52, 211, 153, 0.3))'}} />
                    <Bar dataKey="expense" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} style={{filter: 'drop-shadow(0 4px 6px rgba(96, 165, 250, 0.3))'}} />
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
              <span className="text-2xl font-bold text-gray-900">3,021</span>
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded flex items-center shadow-sm border border-green-200/50">
                <TrendingUp className="w-3 h-3 mr-1" />
                +164 increase
              </span>
            </div>
            <div className="h-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-end justify-center p-4 relative overflow-hidden" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
              <div className="w-12 h-20 bg-gradient-to-t from-teal-700 to-teal-500 rounded-t flex items-end justify-center text-white text-xs font-medium pb-2 relative transform hover:scale-105 transition-transform duration-300" style={{boxShadow: '0 8px 16px rgba(20, 83, 83, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t"></div>
                <span className="relative z-10">1308</span>
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
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    dataKey="value"
                    style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'}}
                  >
                    {expensesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient${index})`}
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <defs>
                    <linearGradient id="pieGradient0" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a3e635" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                    <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-sm" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(52, 211, 153, 0.3)'}}></div>
                <span className="text-sm text-gray-600">Approved:</span>
                <span className="text-sm font-medium text-gray-900">52%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full shadow-sm" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(163, 230, 53, 0.3)'}}></div>
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-sm font-medium text-gray-900">17.5%</span>
              </div>
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
                <span>Client</span>
                <span>Total</span>
                <span>Date Created</span>
              </div>
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-5 gap-2 py-2 text-sm items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  <span className="text-gray-900 font-medium">{invoice.id}</span>
                  <span className="text-gray-600">{invoice.client}</span>
                  <span className="text-gray-900 font-medium">{invoice.amount}</span>
                  <span className="text-gray-500 text-xs">{invoice.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;