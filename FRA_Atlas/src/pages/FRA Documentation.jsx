import React, { useState } from 'react';
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
    <div className={`${right.bgColor} ${right.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-4 mb-4">
        <div className={`${right.color} p-3 rounded-xl text-white flex-shrink-0`}>
          <right.icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{right.type}</h3>
            <span className={`px-2 py-1 ${right.color} text-white text-xs font-medium rounded-full`}>
              {right.acronym}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-4">{right.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
          <ul className="space-y-1">
            {right.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-900">Eligibility: </span>
            <span className="text-gray-700">{right.eligibility}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">Maximum Area: </span>
            <span className="text-gray-700">{right.maxArea}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ProcessStep = ({ step, isLast }) => (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className="bg-blue-600 text-white rounded-full p-3 flex items-center justify-center">
          <step.icon className="h-6 w-6" />
        </div>
        {!isLast && <div className="w-0.5 h-16 bg-gray-300 mt-4"></div>}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900">Step {step.step}: {step.title}</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {step.timeline}
          </span>
        </div>
        <p className="text-gray-700">{step.description}</p>
      </div>
    </div>
  );

  const ResourceCard = ({ resource }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{resource.title}</h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">{resource.type}</span>
            <span>{resource.size}</span>
          </div>
        </div>
        <Download className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
      <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Download</span>
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
              <div className="max-w-4xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Scale className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Forest Rights Act, 2006</h1>
                </div>
                <p className="text-green-100 text-lg mb-6 leading-relaxed">
                  A landmark legislation that recognizes the rights of forest-dwelling communities and tribal people 
                  to forest land and resources. It aims to correct the "historical injustice" done to these communities 
                  by colonial-era laws.
                </p>
                <div className="flex items-center space-x-6 text-green-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Enacted: December 2006</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Beneficiaries: 200+ million people</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Objectives */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Objectives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                    <div className={`${objective.color} p-3 rounded-lg text-white inline-block mb-4`}>
                      <objective.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{objective.title}</h3>
                    <p className="text-gray-600 text-sm">{objective.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">FRA Impact Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Titles Issued', value: '1.8M+', icon: Award },
                  { label: 'Area Recognized', value: '5.5M hectares', icon: MapPin },
                  { label: 'States Covered', value: '24', icon: Globe },
                  { label: 'Beneficiaries', value: '200M+', icon: Users }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <stat.icon className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rights-types':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Types of Forest Rights</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The Forest Rights Act recognizes three main categories of rights for forest-dwelling communities. 
                Each type serves different purposes and has specific eligibility criteria.
              </p>
            </div>
            
            <div className="space-y-8">
              {rightsTypes.map((right, index) => (
                <RightsCard key={index} right={right} />
              ))}
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The FRA application process involves multiple steps and stakeholders. Here's a comprehensive 
                guide to help you understand each phase of the journey.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Step-by-Step Process</h2>
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
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Documents</h3>
                  <ul className="space-y-2">
                    {[
                      'Gram Sabha Resolution',
                      'Survey Settlement Records',
                      'Revenue Records',
                      'Ration Card/Voter ID',
                      'Photographs of Land/Structure'
                    ].map((doc, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Evidence</h3>
                  <ul className="space-y-2">
                    {[
                      'Elderly person testimony',
                      'Traditional use evidence',
                      'Community verification',
                      'GPS coordinates',
                      'Historical documents'
                    ].map((doc, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
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
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital Revolution for FRA</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our project brings the Forest Rights Act into the digital age, making it more accessible, 
                transparent, and efficient for forest communities across India.
              </p>
            </div>

            {/* Problem Statement */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Issues</h3>
                  <ul className="space-y-2 text-red-100">
                    <li>• Complex bureaucratic processes</li>
                    <li>• Limited access to information</li>
                    <li>• Lengthy approval timelines</li>
                    <li>• Language and literacy barriers</li>
                    <li>• Lack of transparency</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Impact</h3>
                  <ul className="space-y-2 text-red-100">
                    <li>• Only 30% claim success rate</li>
                    <li>• Average 3-year processing time</li>
                    <li>• Limited community participation</li>
                    <li>• Disputes and conflicts</li>
                    <li>• Delayed justice delivery</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Our Solution */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Digital Solution</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {digitalFeatures.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg text-white">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                        <div className="space-y-1">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                              <Star className="h-3 w-3 text-yellow-500" />
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
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Frontend</h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• React.js + Vite</li>
                    <li>• Tailwind CSS</li>
                    <li>• Progressive Web App</li>
                    <li>• Responsive Design</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-400">Backend</h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Node.js + Express</li>
                    <li>• MongoDB Database</li>
                    <li>• RESTful APIs</li>
                    <li>• JWT Authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">Integration</h3>
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
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Benefits & Impact</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The Forest Rights Act has brought transformative changes to forest communities across India, 
                empowering them with legal rights and sustainable livelihoods.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg text-white">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm font-medium">{benefit.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Stories */}
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Success Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <Quote className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-gray-900">Odisha Tribal Community</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">
                    "After receiving our CFR titles, we've been able to sustainably manage 500 hectares of forest, 
                    increasing our income by 60% through sustainable NTFP collection."
                  </p>
                  <p className="text-xs text-gray-500">- Koraput District, Odisha</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <Quote className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold text-gray-900">Chhattisgarh Village</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">
                    "Individual forest rights have given us security over our ancestral lands. 
                    We can now invest in better farming techniques and secure our children's future."
                  </p>
                  <p className="text-xs text-gray-500">- Bastar District, Chhattisgarh</p>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Environmental Conservation Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TreePine className="h-12 w-12 mx-auto mb-3 text-green-200" />
                  <div className="text-2xl font-bold mb-1">15%</div>
                  <div className="text-green-100 text-sm">Increase in Forest Cover</div>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-green-200" />
                  <div className="text-2xl font-bold mb-1">25%</div>
                  <div className="text-green-100 text-sm">Reduction in Forest Degradation</div>
                </div>
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-green-200" />
                  <div className="text-2xl font-bold mb-1">300+</div>
                  <div className="text-green-100 text-sm">Species Protected</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Resources & Downloads</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Access official documents, guidelines, and additional resources to help you understand 
                and navigate the Forest Rights Act process.
              </p>
            </div>

            {/* Official Documents */}
            <div className="space-y-8">
              {resources.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {category.items.map((resource, idx) => (
                      <ResourceCard key={idx} resource={resource} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Government Portals</h3>
                  <ul className="space-y-2 text-blue-100">
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Ministry of Tribal Affairs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>State Tribal Welfare Departments</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>FRA Implementation Dashboard</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Support Organizations</h3>
                  <ul className="space-y-2 text-blue-100">
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Forest Rights Act Helpdesk</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Legal Aid Centers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Community Support Networks</span>
                    </li>
                  </ul>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onHomeClick}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">FRA Documentation</h1>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Documentation</h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <section.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs opacity-75">{section.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRADocumentation;