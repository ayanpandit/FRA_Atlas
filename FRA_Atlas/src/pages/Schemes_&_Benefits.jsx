import React, { useState } from 'react';
import { 
  Award, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  Download,
  Eye,
  Plus,
  Banknote,
  Wallet,
  CreditCard,
  Target,
  Users,
  Leaf,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

const Schemes = ({ userData }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const schemes = [
    {
      id: 'PM_KISAN',
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      shortName: 'PM-KISAN',
      description: 'Direct income support to small and marginal farmers',
      category: 'Agricultural',
      status: 'Active',
      enrolledDate: 'Jan 15, 2023',
      amount: '₹6,000',
      frequency: 'Annual',
      nextPayment: 'Mar 31, 2025',
      lastPayment: 'Dec 31, 2024',
      totalReceived: '₹12,000',
      icon: Briefcase,
      color: 'bg-green-500',
      benefits: [
        'Direct cash transfer of ₹6,000 annually',
        'Paid in three equal installments',
        'No intermediary involvement',
        'Direct bank transfer'
      ],
      eligibility: 'Small and marginal farmers with cultivable land',
      documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
      applicationStatus: 'Approved',
      paymentHistory: [
        { date: 'Dec 31, 2024', amount: '₹2,000', status: 'Completed' },
        { date: 'Aug 31, 2024', amount: '₹2,000', status: 'Completed' },
        { date: 'Apr 30, 2024', amount: '₹2,000', status: 'Completed' }
      ]
    },
    {
      id: 'MGNREGA',
      name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
      shortName: 'MGNREGA',
      description: 'Guaranteed wage employment for rural households',
      category: 'Employment',
      status: 'Active',
      enrolledDate: 'Mar 10, 2023',
      amount: '₹2,500',
      frequency: 'Monthly',
      nextPayment: 'Mar 15, 2025',
      lastPayment: 'Feb 15, 2025',
      totalReceived: '₹28,000',
      icon: Users,
      color: 'bg-blue-500',
      benefits: [
        'Guaranteed 100 days of employment',
        'Wage rate: ₹250 per day',
        'Work close to home',
        'Asset creation in rural areas'
      ],
      eligibility: 'Rural households seeking employment',
      documents: ['Job Card', 'Aadhaar Card', 'Bank Account'],
      applicationStatus: 'Active',
      daysWorked: 45,
      daysRemaining: 55,
      paymentHistory: [
        { date: 'Feb 15, 2025', amount: '₹2,500', status: 'Completed' },
        { date: 'Jan 15, 2025', amount: '₹3,750', status: 'Completed' },
        { date: 'Dec 15, 2024', amount: '₹2,000', status: 'Completed' }
      ]
    },
    {
      id: 'FOREST_CONSERVATION',
      name: 'Forest Conservation & Biodiversity Scheme',
      shortName: 'Forest Conservation',
      description: 'Incentives for forest conservation and biodiversity protection',
      category: 'Environmental',
      status: 'Eligible',
      enrolledDate: null,
      amount: '₹5,000',
      frequency: 'Annual',
      nextPayment: null,
      lastPayment: null,
      totalReceived: '₹0',
      icon: Leaf,
      color: 'bg-emerald-500',
      benefits: [
        'Annual payment for forest conservation',
        'Additional incentives for biodiversity protection',
        'Training and capacity building',
        'Equipment support'
      ],
      eligibility: 'Forest dwelling communities with conservation activities',
      documents: ['Forest Rights Certificate', 'Conservation Plan', 'Community Resolution'],
      applicationStatus: 'Not Applied',
      requirements: [
        'Must have active FRA certificate',
        'Demonstrate conservation activities',
        'Submit biodiversity assessment'
      ]
    },
    {
      id: 'TRIBAL_WELFARE',
      name: 'Tribal Welfare Development Scheme',
      shortName: 'Tribal Welfare',
      description: 'Comprehensive welfare scheme for tribal communities',
      category: 'Welfare',
      status: 'Under Review',
      enrolledDate: 'Jan 20, 2024',
      amount: '₹3,000',
      frequency: 'Quarterly',
      nextPayment: 'Pending approval',
      lastPayment: null,
      totalReceived: '₹0',
      icon: Heart,
      color: 'bg-purple-500',
      benefits: [
        'Healthcare support',
        'Educational assistance',
        'Skill development programs',
        'Infrastructure development'
      ],
      eligibility: 'Scheduled Tribe communities',
      documents: ['Tribe Certificate', 'Income Certificate', 'Residence Proof'],
      applicationStatus: 'Under Review',
      reviewStage: 'Document Verification',
      estimatedApproval: 'Apr 15, 2025'
    },
    {
      id: 'SOLAR_SUBSIDY',
      name: 'Solar Power Subsidy Scheme',
      shortName: 'Solar Subsidy',
      description: 'Subsidized solar power systems for rural households',
      category: 'Energy',
      status: 'Available',
      enrolledDate: null,
      amount: '₹15,000',
      frequency: 'One-time',
      nextPayment: null,
      lastPayment: null,
      totalReceived: '₹0',
      icon: Zap,
      color: 'bg-yellow-500',
      benefits: [
        'Up to 70% subsidy on solar panels',
        'Free installation and maintenance',
        '25-year warranty',
        'Reduced electricity bills'
      ],
      eligibility: 'Rural households with electricity connection',
      documents: ['Electricity Bill', 'House Ownership Proof', 'Income Certificate'],
      applicationStatus: 'Not Applied',
      subsidyPercentage: 70,
      systemCapacity: '3 KW'
    },
    {
      id: 'EDUCATION_SCHOLARSHIP',
      name: 'Tribal Education Scholarship',
      shortName: 'Education Scholarship',
      description: 'Educational scholarships for tribal students',
      category: 'Education',
      status: 'Available',
      enrolledDate: null,
      amount: '₹12,000',
      frequency: 'Annual',
      nextPayment: null,
      lastPayment: null,
      totalReceived: '₹0',
      icon: GraduationCap,
      color: 'bg-indigo-500',
      benefits: [
        'Annual scholarship for students',
        'Book and uniform allowance',
        'Hostel facility support',
        'Merit-based additional benefits'
      ],
      eligibility: 'Tribal students pursuing higher education',
      documents: ['Student ID', 'Mark Sheets', 'Income Certificate', 'Caste Certificate'],
      applicationStatus: 'Not Applied',
      gradeLevel: 'Higher Secondary and above'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Under Review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Eligible':
      case 'Available':
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Eligible':
      case 'Available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         scheme.status.toLowerCase().replace(' ', '_') === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const totalBenefitsReceived = schemes
    .filter(scheme => scheme.totalReceived !== '₹0')
    .reduce((total, scheme) => total + parseInt(scheme.totalReceived.replace(/[₹,]/g, '')), 0);

  const activeSchemes = schemes.filter(scheme => scheme.status === 'Active').length;
  const availableSchemes = schemes.filter(scheme => scheme.status === 'Available' || scheme.status === 'Eligible').length;

  const SchemeCard = ({ scheme }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className={`${scheme.color} p-3 rounded-xl text-white`}>
              <scheme.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{scheme.shortName}</h3>
              <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                  {getStatusIcon(scheme.status)}
                  <span className="ml-1">{scheme.status}</span>
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {scheme.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount and Frequency */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{scheme.amount}</p>
            <p className="text-sm text-gray-600">{scheme.frequency}</p>
          </div>
          {scheme.totalReceived !== '₹0' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="font-bold text-green-600">{scheme.totalReceived}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status-specific information */}
        {scheme.status === 'Active' && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Next Payment:</span>
              <span className="font-medium text-gray-900">{scheme.nextPayment}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Payment:</span>
              <span className="font-medium text-gray-900">{scheme.lastPayment}</span>
            </div>
            {scheme.id === 'MGNREGA' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Days Worked:</span>
                  <span className="font-medium">{scheme.daysWorked}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${scheme.daysWorked}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {scheme.status === 'Under Review' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-700">Application Under Review</span>
            </div>
            <p className="text-sm text-yellow-700 mb-2">Current Stage: {scheme.reviewStage}</p>
            <p className="text-sm text-yellow-600">Estimated Approval: {scheme.estimatedApproval}</p>
          </div>
        )}

        {(scheme.status === 'Eligible' || scheme.status === 'Available') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Ready to Apply</span>
            </div>
            {scheme.requirements && (
              <div>
                <p className="text-sm text-blue-700 mb-2">Requirements:</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  {scheme.requirements.map((req, index) => (
                    <li key={index}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
          <ul className="space-y-2">
            {scheme.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Documents Required */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
          <div className="flex flex-wrap gap-2">
            {scheme.documents.map((doc, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {doc}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {scheme.status === 'Active' && (
            <>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Download className="h-4 w-4" />
                <span>Payment History</span>
              </button>
            </>
          )}
          
          {scheme.status === 'Under Review' && (
            <>
              <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>Track Status</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                <Eye className="h-4 w-4" />
                <span>View Application</span>
              </button>
            </>
          )}
          
          {(scheme.status === 'Eligible' || scheme.status === 'Available') && (
            <>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Plus className="h-4 w-4" />
                <span>Apply Now</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                <Info className="h-4 w-4" />
                <span>Learn More</span>
              </button>
            </>
          )}
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <ExternalLink className="h-4 w-4" />
            <span>Official Page</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schemes & Benefits</h2>
          <p className="text-gray-600">Government schemes and financial assistance programs</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Total Benefits Received</p>
            <p className="text-3xl font-bold mb-2">₹{totalBenefitsReceived.toLocaleString()}</p>
            <p className="text-green-200 text-sm">Across all active schemes</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Active Schemes</p>
            <p className="text-3xl font-bold mb-2">{activeSchemes}</p>
            <p className="text-blue-200 text-sm">Currently enrolled</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">Available Schemes</p>
            <p className="text-3xl font-bold mb-2">{availableSchemes}</p>
            <p className="text-purple-200 text-sm">Ready to apply</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search schemes by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Schemes', count: schemes.length },
              { key: 'active', label: 'Active', count: activeSchemes },
              { key: 'available', label: 'Available', count: availableSchemes },
              { key: 'under_review', label: 'Under Review', count: schemes.filter(s => s.status === 'Under Review').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredSchemes.length} of {schemes.length} schemes
        </p>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {/* Empty State */}
      {filteredSchemes.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemes Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || activeFilter !== 'all' 
              ? "No schemes match your current search and filter criteria."
              : "No schemes are currently available."
            }
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Access Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-left">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Download Benefits Summary</p>
              <p className="text-sm text-gray-600">Get a detailed report of all your benefits</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="flex items-center space-x-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-left">
            <div className="p-2 bg-green-500 rounded-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Payment History</p>
              <p className="text-sm text-gray-600">View all your payment transactions</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="flex items-center space-x-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-left">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Set Payment Alerts</p>
              <p className="text-sm text-gray-600">Get notified about upcoming payments</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schemes;