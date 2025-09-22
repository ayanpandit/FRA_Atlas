import React from 'react';
import { Mail, Phone, MapPin, Globe, FileText, Shield, Users, TrendingUp, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';

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
  <footer className="relative overflow-hidden" style={{ background: 'inherit' }}>
      {/* Enhanced Glass Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      {/* Decorative Glass Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full translate-x-48 translate-y-48 blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Company Info with Logo */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                {/* Logo and Company Name */}
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={logo} 
                    alt="Patta Portal Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <h3 className=" text-2xl text-yellow-400">
                    FRA <span className="text-2xl font-bold text-black">Atlas</span>
                  </h3>
                </div>
                <p className="text-black text-sm leading-relaxed">
                  Transforming handwritten pattas into digital gold. AI-driven Yojana matching for transparent, 
                  inclusive government benefit delivery.
                </p>
              </div>
              
              {/* Key Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-black">
                    <div className="w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                      {React.cloneElement(feature.icon, { className: "w-4 h-4 text-yellow-400" })}
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-yellow-400">Quick Access</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-black hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center group"
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
              <h4 className="text-lg font-semibold text-yellow-400">AI-Recommended Yojanas</h4>
              <ul className="space-y-3">
                {yojanas.map((yojana, index) => (
                  <li key={index}>
                    <a 
                      href={yojana.href} 
                      className="text-black hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center group"
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
              <h4 className="text-lg font-semibold text-yellow-400">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-black">
                  <div className="w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-sm">support@pattaportal.gov.in</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-black">
                  <div className="w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Helpline</p>
                    <p className="text-sm">1800-XXX-XXXX (Toll Free)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-black">
                  <div className="w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Office</p>
                    <p className="text-sm">Ministry of Rural Development<br />Government of India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-black">
                  <div className="w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coverage</p>
                    <p className="text-sm">Pan-India Digital Initiative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">50K+</div>
                <div className="text-sm text-black">Pattas Digitized</div>
              </div>
              <div className="space-y-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">25K+</div>
                <div className="text-sm text-black">Beneficiaries Verified</div>
              </div>
              <div className="space-y-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">15+</div>
                <div className="text-sm text-black">States Active</div>
              </div>
              <div className="space-y-2 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">98%</div>
                <div className="text-sm text-black">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-black">
                © 2025 FRA Atlas. A Digital India Initiative by Government of India. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-black hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-black hover:text-yellow-400 transition-colors">
                  Terms of Service
                </a>
                <a href="/accessibility" className="text-black hover:text-yellow-400 transition-colors">
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