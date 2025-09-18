import React from 'react';
import { Mail, Phone, MapPin, Globe, FileText, Shield, Users, TrendingUp, ExternalLink } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: "Upload Patta", href: "/upload" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "AI Eligibility Check", href: "/eligibility" },
    { name: "States Coverage", href: "/states" },
    { name: "Reports & Analytics", href: "/reports" }
  ];

  const yojanas = [
    { name: "PM-Kisan Samman Nidhi", href: "/yojana/pm-kisan" },
    { name: "Jal Jeevan Mission", href: "/yojana/jal-jeevan" },
    { name: "PM Awas Yojana", href: "/yojana/pm-awas" },
    { name: "Forest Rights Act", href: "/yojana/forest-rights" },
    { name: "MGNREGA", href: "/yojana/mgnrega" }
  ];

  const features = [
    { icon: <FileText className="w-5 h-5" />, text: "OCR + AI Processing" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure Data Storage" },
    { icon: <Users className="w-5 h-5" />, text: "Multi-State Coverage" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Real-time Analytics" }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Glass Effect Background */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full translate-x-48 translate-y-48 blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Patta<span className="text-yellow-400">Portal</span>
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Transforming handwritten pattas into digital gold. AI-driven Yojana matching for transparent, 
                  inclusive government benefit delivery.
                </p>
              </div>
              
              {/* Key Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-300">
                    <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                      {React.cloneElement(feature.icon, { className: "w-4 h-4 text-yellow-400" })}
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Quick Access</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI-Recommended Yojanas */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">AI-Recommended Yojanas</h4>
              <ul className="space-y-3">
                {yojanas.map((yojana, index) => (
                  <li key={index}>
                    <a 
                      href={yojana.href} 
                      className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span>{yojana.name}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-sm">support@pattaportal.gov.in</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Helpline</p>
                    <p className="text-sm">1800-XXX-XXXX (Toll Free)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Office</p>
                    <p className="text-sm">Ministry of Rural Development<br />Government of India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300">
                  <Globe className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Coverage</p>
                    <p className="text-sm">Pan-India Digital Initiative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-gray-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-400">50K+</div>
                <div className="text-sm text-gray-300">Pattas Digitized</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-400">25K+</div>
                <div className="text-sm text-gray-300">Beneficiaries Verified</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-400">15+</div>
                <div className="text-sm text-gray-300">States Active</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-400">98%</div>
                <div className="text-sm text-gray-300">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © 2024 Patta Portal. A Digital India Initiative by Government of India. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Terms of Service
                </a>
                <a href="/accessibility" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;