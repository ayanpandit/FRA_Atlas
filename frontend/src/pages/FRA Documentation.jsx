import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home,
  Book,
  Users,
  TreePine,
  Scale,
  FileText,
  Award,
  Heart,
  Shield,
  Target,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Info,
  ExternalLink,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  Globe,
  Lightbulb,
  Zap,
  Star,
  Quote
} from 'lucide-react';

const FRADocumentation = ({ onHomeClick }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Info,
      description: 'Introduction to the Forest Rights Act'
    },
    {
      id: 'rights-types',
      title: 'Types of Rights',
      icon: Scale,
      description: 'IFR, CR, and CFR explained'
    },
    {
      id: 'process',
      title: 'Application Process',
      icon: FileText,
      description: 'Step-by-step guide'
    },
    {
      id: 'digital-revolution',
      title: 'Digital Revolution',
      icon: Zap,
      description: 'Our project impact'
    },
    {
      id: 'benefits',
      title: 'Benefits & Impact',
      icon: Award,
      description: 'Community empowerment'
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: Book,
      description: 'Additional materials'
    }
  ];

  const rightsTypes = [
    {
      type: 'Individual Forest Rights (IFR)',
      acronym: 'IFR',
      description: 'The right of an individual or family to hold and live on forest land for habitation or cultivation.',
      icon: Home,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Right to hold and live on forest land',
        'Cultivation rights for subsistence',
        'Habitation and dwelling permissions',
        'Access to water sources',
        'Traditional land use practices'
      ],
      eligibility: 'Forest-dwelling communities who have been cultivating forest land before December 13, 2005',
      maxArea: 'Up to 4 hectares per family'
    },
    {
      type: 'Community Rights (CR)',
      acronym: 'CR',
      description: 'Rights of a community to use, collect, and sell minor forest produce, as well as rights for grazing and fishing.',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Collection of minor forest produce',
        'Grazing rights for livestock',
        'Fishing in water bodies',
        'Access to medicinal plants',
        'Traditional resource utilization'
      ],
      eligibility: 'Communities that have traditionally depended on forest resources',
      maxArea: 'As per traditional use patterns'
    },
    {
      type: 'Community Forest Resource Rights (CFR)',
      acronym: 'CFR',
      description: 'The right of the Gram Sabha to protect, manage, and conserve a community forest resource that they have traditionally protected.',
      icon: TreePine,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      features: [
        'Forest protection and conservation',
        'Sustainable resource management',
        'Biodiversity conservation',
        'Ecosystem restoration',
        'Community-based governance'
      ],
      eligibility: 'Gram Sabha with evidence of traditional forest protection',
      maxArea: 'Entire traditional forest area'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Gram Sabha Resolution',
      description: 'Village assembly passes a resolution to initiate the FRA claim process',
      icon: Users,
      timeline: 'Day 1-15'
    },
    {
      step: 2,
      title: 'Evidence Collection',
      description: 'Gather documents and evidence of traditional forest use and occupation',
      icon: FileText,
      timeline: 'Day 16-45'
    },
    {
      step: 3,
      title: 'Application Submission',
      description: 'Submit completed application with evidence to Sub-Divisional Level Committee',
      icon: Target,
      timeline: 'Day 46-60'
    },
    {
      step: 4,
      title: 'Field Verification',
      description: 'Joint verification by officials and community members',
      icon: MapPin,
      timeline: 'Day 61-120'
    },
    {
      step: 5,
      title: 'Committee Review',
      description: 'Review by Sub-Divisional and District Level Committees',
      icon: Scale,
      timeline: 'Day 121-180'
    },
    {
      step: 6,
      title: 'Title Distribution',
      description: 'Issue of forest rights titles and certificates',
      icon: Award,
      timeline: 'Day 181-210'
    }
  ];

  const benefits = [
    {
      title: 'Legal Recognition',
      description: 'Formal recognition of traditional forest rights and land tenure',
      icon: Scale,
      impact: 'Over 1.8 million titles issued nationwide'
    },
    {
      title: 'Economic Empowerment',
      description: 'Access to forest resources for livelihood and income generation',
      icon: Award,
      impact: 'Average 40% increase in household income'
    },
    {
      title: 'Forest Conservation',
      description: 'Community-led conservation efforts and sustainable practices',
      icon: TreePine,
      impact: '15% increase in forest cover in FRA areas'
    },
    {
      title: 'Social Justice',
      description: 'Correction of historical injustices against forest communities',
      icon: Heart,
      impact: 'Rights restored for 200 million people'
    }
  ];

  const digitalFeatures = [
    {
      title: 'Digital Application Portal',
      description: 'Online platform for submitting and tracking FRA applications',
      icon: Globe,
      benefits: ['24/7 accessibility', 'Reduced paperwork', 'Faster processing']
    },
    {
      title: 'GIS Mapping Integration',
      description: 'Satellite imagery and GPS technology for accurate land mapping',
      icon: MapPin,
      benefits: ['Precise boundaries', 'Conflict resolution', 'Scientific validation']
    },
    {
      title: 'Mobile App Solutions',
      description: 'Smartphone apps for rural communities and field officials',
      icon: Zap,
      benefits: ['Offline capability', 'Multi-language support', 'Photo documentation']
    },
    {
      title: 'Blockchain Verification',
      description: 'Secure, tamper-proof record keeping and title verification',
      icon: Shield,
      benefits: ['Document security', 'Fraud prevention', 'Transparent process']
    }
  ];

  const resources = [
    {
      category: 'Official Documents',
      items: [
        {
          title: 'Forest Rights Act, 2006 (Full Text)',
          type: 'PDF',
          size: '2.4 MB',
          description: 'Complete text of the Scheduled Tribes and Other Traditional Forest Dwellers Act, 2006',
          downloadUrl: '#'
        },
        {
          title: 'FRA Rules, 2007',
          type: 'PDF',
          size: '1.8 MB',
          description: 'Rules for implementation of the Forest Rights Act',
          downloadUrl: '#'
        },
        {
          title: 'Guidelines for CFR Rights',
          type: 'PDF',
          size: '3.1 MB',
          description: 'Detailed guidelines for Community Forest Resource Rights',
          downloadUrl: '#'
        }
      ]
    },
    {
      category: 'Application Forms',
      items: [
        {
          title: 'IFR Application Form',
          type: 'DOC',
          size: '456 KB',
          description: 'Form for Individual Forest Rights claims',
          downloadUrl: '#'
        },
        {
          title: 'CR/CFR Application Form',
          type: 'DOC',
          size: '512 KB',
          description: 'Form for Community and Community Forest Resource Rights',
          downloadUrl: '#'
        },
        {
          title: 'Joint Verification Format',
          type: 'PDF',
          size: '789 KB',
          description: 'Format for joint field verification report',
          downloadUrl: '#'
        }
      ]
    },
    {
      category: 'Training Materials',
      items: [
        {
          title: 'FRA Training Manual',
          type: 'PDF',
          size: '5.2 MB',
          description: 'Comprehensive training guide for officials and communities',
          downloadUrl: '#'
        },
        {
          title: 'Video Tutorials',
          type: 'MP4',
          size: 'Various',
          description: 'Step-by-step video guides in multiple languages',
          downloadUrl: '#'
        },
        {
          title: 'Community Awareness Kit',
          type: 'ZIP',
          size: '15.4 MB',
          description: 'Posters, pamphlets, and presentation materials',
          downloadUrl: '#'
        }
      ]
    }
  ];

  const RightsCard = ({ right }) => (
    <div className={`${right.bgColor} ${right.borderColor} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`} style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'}}>
      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
        <div className={`${right.color.replace('500', '600')} p-2 sm:p-3 rounded-lg sm:rounded-xl text-white flex-shrink-0`} style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)'}}>
          <right.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{right.type}</h3>
            <span className={`px-2 py-1 ${right.color.replace('500', '600')} text-white text-xs font-medium rounded-full self-start`} style={{boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
              {right.acronym}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4">{right.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
          <ul className="space-y-1">
            {right.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-900">Eligibility: </span>
            <span className="text-gray-600">{right.eligibility}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">Maximum Area: </span>
            <span className="text-gray-600">{right.maxArea}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ProcessStep = ({ step, isLast }) => (
    <div className="flex items-start space-x-3 sm:space-x-4">
      <div className="flex flex-col items-center">
        <div className="bg-blue-600 text-white rounded-full p-2 sm:p-3 flex items-center justify-center" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)'}}>
          <step.icon className="h-4 w-4 sm:h-6 sm:w-6" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
        </div>
        {!isLast && <div className="w-0.5 h-12 sm:h-16 bg-gray-300 mt-4"></div>}
      </div>
      <div className="flex-1 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Step {step.step}: {step.title}</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200 self-start" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            {step.timeline}
          </span>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">{step.description}</p>
      </div>
    </div>
  );

  const ResourceCard = ({ resource }) => (
    <div className="bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)'}}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{resource.title}</h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="bg-gray-200 px-2 py-1 rounded border border-gray-300">{resource.type}</span>
            <span>{resource.size}</span>
          </div>
        </div>
        <Download className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
      </div>
      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
      <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(59, 130, 246, 0.2)'}}>
        <Download className="h-3 w-3 sm:h-4 sm:w-4" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
        <span>Download</span>
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 20px rgba(34, 197, 94, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2), 0 20px 40px rgba(34, 197, 94, 0.4), 0 4px 6px rgba(0,0,0,0.2)'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10 max-w-4xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Scale className="h-6 w-6 sm:h-8 sm:w-8" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                  <h1 className="text-2xl sm:text-3xl font-bold">Forest Rights Act, 2006</h1>
                </div>
                <p className="text-green-100 text-base sm:text-lg mb-6 leading-relaxed">
                  A landmark legislation that recognizes the rights of forest-dwelling communities and tribal people 
                  to forest land and resources. It aims to correct the "historical injustice" done to these communities 
                  by colonial-era laws.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-green-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <span className="text-sm sm:text-base">Enacted: December 2006</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <span className="text-sm sm:text-base">Beneficiaries: 200+ million people</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Objectives */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Key Objectives</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    title: 'Historical Justice',
                    description: 'Correct historical injustices done to forest communities',
                    icon: Scale,
                    color: 'bg-blue-500'
                  },
                  {
                    title: 'Legal Recognition',
                    description: 'Recognize traditional rights of forest-dwelling communities',
                    icon: Award,
                    color: 'bg-green-500'
                  },
                  {
                    title: 'Forest Conservation',
                    description: 'Empower communities to protect and conserve forests',
                    icon: TreePine,
                    color: 'bg-emerald-500'
                  },
                  {
                    title: 'Livelihood Security',
                    description: 'Ensure sustainable livelihoods for forest communities',
                    icon: Heart,
                    color: 'bg-red-500'
                  },
                  {
                    title: 'Democratic Governance',
                    description: 'Strengthen Gram Sabha and community institutions',
                    icon: Users,
                    color: 'bg-purple-500'
                  },
                  {
                    title: 'Biodiversity Protection',
                    description: 'Promote conservation through traditional knowledge',
                    icon: Shield,
                    color: 'bg-orange-500'
                  }
                ].map((objective, index) => (
                  <div key={index} className={`${objective.color} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white hover:scale-105 transition-all duration-300 cursor-pointer`} style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 12px 24px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)'}}>
                    <div className={`${objective.color} p-2 sm:p-3 rounded-lg inline-block mb-3 sm:mb-4`}>
                      <objective.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2">{objective.title}</h3>
                    <p className="text-sm opacity-90">{objective.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.3)'}}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">FRA Impact Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Titles Issued', value: '1.8M+', icon: Award },
                  { label: 'Area Recognized', value: '5.5M hectares', icon: MapPin },
                  { label: 'States Covered', value: '24', icon: Globe },
                  { label: 'Beneficiaries', value: '200M+', icon: Users }
                ].map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.2)'}}>
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mx-auto mb-3" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rights-types':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Types of Forest Rights</h1>
              <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base">
                The Forest Rights Act recognizes three main categories of rights for forest-dwelling communities. 
                Each type serves different purposes and has specific eligibility criteria.
              </p>
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              {rightsTypes.map((right, index) => (
                <RightsCard key={index} right={right} />
              ))}
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Application Process</h1>
              <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base">
                The FRA application process involves multiple steps and stakeholders. Here's a comprehensive 
                guide to help you understand each phase of the journey.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.3)'}}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Step-by-Step Process</h2>
              <div className="space-y-4">
                {processSteps.map((step, index) => (
                  <ProcessStep 
                    key={index} 
                    step={step} 
                    isLast={index === processSteps.length - 1} 
                  />
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-blue-400/30" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(59, 130, 246, 0.3)'}}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Primary Documents</h3>
                  <ul className="space-y-2">
                    {[
                      'Gram Sabha Resolution',
                      'Survey Settlement Records',
                      'Revenue Records',
                      'Ration Card/Voter ID',
                      'Photographs of Land/Structure'
                    ].map((doc, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-white/90">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Supporting Evidence</h3>
                  <ul className="space-y-2">
                    {[
                      'Elderly person testimony',
                      'Traditional use evidence',
                      'Community verification',
                      'GPS coordinates',
                      'Historical documents'
                    ].map((doc, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-white/90">
                        <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'digital-revolution':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Digital Revolution for FRA</h1>
              <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base">
                Our project brings the Forest Rights Act into the digital age, making it more accessible, 
                transparent, and efficient for forest communities across India.
              </p>
            </div>

            {/* Problem Statement */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 15px 30px rgba(239, 68, 68, 0.4)'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">The Challenge</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Current Issues</h3>
                    <ul className="space-y-2 text-red-100 text-sm">
                      <li>• Complex bureaucratic processes</li>
                      <li>• Limited access to information</li>
                      <li>• Lengthy approval timelines</li>
                      <li>• Language and literacy barriers</li>
                      <li>• Lack of transparency</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Impact</h3>
                    <ul className="space-y-2 text-red-100 text-sm">
                      <li>• Only 30% claim success rate</li>
                      <li>• Average 3-year processing time</li>
                      <li>• Limited community participation</li>
                      <li>• Disputes and conflicts</li>
                      <li>• Delayed justice delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Solution */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Our Digital Solution</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {digitalFeatures.map((feature, index) => (
                  <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)'}}>
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-lg text-white" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'}}>
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-white/70 text-sm mb-4">{feature.description}</p>
                        <div className="space-y-1">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-white/90">
                              <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white border border-white/10" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.4)'}}>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Technology Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-blue-400 flex items-center space-x-2">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <span>Frontend</span>
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• React.js + Vite</li>
                    <li>• Tailwind CSS</li>
                    <li>• Progressive Web App</li>
                    <li>• Responsive Design</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-green-400 flex items-center space-x-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <span>Backend</span>
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Node.js + Express</li>
                    <li>• MongoDB Database</li>
                    <li>• RESTful APIs</li>
                    <li>• JWT Authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-purple-400 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <span>Integration</span>
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• GIS Mapping (QGIS)</li>
                    <li>• Satellite Imagery</li>
                    <li>• Blockchain Security</li>
                    <li>• Mobile Optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'benefits':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Benefits & Impact</h1>
              <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base">
                The Forest Rights Act has brought transformative changes to forest communities across India, 
                empowering them with legal rights and sustainable livelihoods.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)'}}>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg text-white" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'}}>
                      <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-white/70 text-sm mb-3">{benefit.description}</p>
                      <div className="bg-green-900/30 border border-green-400/30 rounded-lg p-3" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'}}>
                        <p className="text-green-300 text-sm font-medium">{benefit.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Stories */}
            <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-blue-400/30" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(59, 130, 246, 0.3)'}}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Success Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-black/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <h3 className="font-bold text-white text-sm sm:text-base">Odisha Tribal Community</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    "After receiving our CFR titles, we've been able to sustainably manage 500 hectares of forest, 
                    increasing our income by 60% through sustainable NTFP collection."
                  </p>
                  <p className="text-xs text-white/60">- Koraput District, Odisha</p>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                    <h3 className="font-bold text-white text-sm sm:text-base">Chhattisgarh Village</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    "Individual forest rights have given us security over our ancestral lands. 
                    We can now invest in better farming techniques and secure our children's future."
                  </p>
                  <p className="text-xs text-white/60">- Bastar District, Chhattisgarh</p>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 15px 30px rgba(34, 197, 94, 0.4)'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Environmental Conservation Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <TreePine className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-green-200" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    <div className="text-xl sm:text-2xl font-bold mb-1">15%</div>
                    <div className="text-green-100 text-sm">Increase in Forest Cover</div>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-green-200" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    <div className="text-xl sm:text-2xl font-bold mb-1">25%</div>
                    <div className="text-green-100 text-sm">Reduction in Forest Degradation</div>
                  </div>
                  <div className="text-center">
                    <Heart className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-green-200" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'}} />
                    <div className="text-xl sm:text-2xl font-bold mb-1">300+</div>
                    <div className="text-green-100 text-sm">Species Protected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Resources & Downloads</h1>
              <p className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base">
                Access official documents, guidelines, and additional resources to help you understand 
                and navigate the Forest Rights Act process.
              </p>
            </div>

            {/* Official Documents */}
            <div className="space-y-6 sm:space-y-8">
              {resources.map((category, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.3)'}}>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{category.category}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {category.items.map((resource, idx) => (
                      <ResourceCard key={idx} resource={resource} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 15px 30px rgba(59, 130, 246, 0.4)'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Additional Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Government Portals</h3>
                    <ul className="space-y-2 text-blue-100 text-sm">
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>Ministry of Tribal Affairs</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>State Tribal Welfare Departments</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>FRA Implementation Dashboard</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Support Organizations</h3>
                    <ul className="space-y-2 text-blue-100 text-sm">
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>Forest Rights Act Helpdesk</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>Legal Aid Centers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'}} />
                        <span>Community Support Networks</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap');
        .alan-sans { font-family: "Alan Sans", sans-serif; font-optical-sizing: auto; font-weight: 728; font-style: normal; }
      `}</style>
      <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden alan-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg" style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)' : 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'}}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className={`flex justify-between items-center ${window.innerWidth < 640 ? 'h-14' : 'h-16 md:h-20'}`}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-all duration-300 transform hover:scale-105 px-3 py-2 rounded-lg hover:bg-gray-100" style={{boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'}}
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
                <span className="font-medium text-sm sm:text-base">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2)) brightness(1.1)'}} />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">FRA Documentation</h1>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-64 sm:w-72 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)'}}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <nav className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 sticky top-6 sm:top-8" style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)' : 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'}}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2">
                <Book className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />
                <span>Documentation</span>
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${window.innerWidth < 640 ? 'hover:bg-gray-100' : 'hover:bg-gray-100 hover:shadow-sm'} ${activeSection === section.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:text-gray-900'}`} style={activeSection === section.id ? {boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(59, 130, 246, 0.2)'} : {}}
                    >
                      <section.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'}} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">{section.title}</div>
                        <div className="text-xs opacity-75 truncate">{section.description}</div>
                      </div>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8" style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1)' : 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'}}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default FRADocumentation;