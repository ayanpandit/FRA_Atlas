import React, { useState, useRef } from 'react';

// Simple implementations for required sections
const UploadSection = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const handleUpload = (e) => {
    setFileName(e.target.files[0]?.name || '');
    if (onUpload) onUpload('patta123');
  };
  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {e.preventDefault(); setDragActive(false); if (onUpload) onUpload('patta123');}}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}> <FiUpload className={`w-6 h-6 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} /> </div>
      <h3 className="text-base font-medium text-gray-900 mb-2">{dragActive ? 'Drop file here' : 'Upload Patta Document'}</h3>
      <p className="text-sm text-gray-600 mb-3">PDF, JPG, PNG</p>
      {fileName && <div className="text-xs text-blue-600">Selected: {fileName}</div>}
      <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => fileInputRef.current?.click()}>Browse</button>
    </div>
  );
};

const MapSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
      <FiMap className="mr-2 text-blue-600" /> Land Location
    </h3>
    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">Map Placeholder</div>
  </div>
);

const SchemeEligibility = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
      <FiAward className="mr-2 text-emerald-600" /> Scheme Eligibility
    </h3>
    <div className="w-full p-4 bg-emerald-100 text-emerald-800 rounded">Eligible for FRA Scheme</div>
  </div>
);
import { 
  FiUpload, FiDownload, FiMap, FiCheckCircle, FiClock, FiAlertCircle, 
  FiFileText, FiUser, FiHome, FiLayers, FiEdit3, FiSave, FiX, FiEye,
  FiRefreshCw, FiTrash2, FiFilter, FiSearch, FiBell, FiMapPin,
  FiTrendingUp, FiTrendingDown, FiMoreVertical, FiZoomIn, FiZoomOut,
  FiCornerUpRight, FiCheck, FiAlertTriangle, FiInfo, FiTarget,
  FiAward, FiDollarSign, FiCalendar, FiGlobe, FiMenu, FiChevronDown,
  FiChevronRight, FiMaximize2, FiMinimize2
} from 'react-icons/fi';

const UserDashboard = () => {
  const [selectedPatta, setSelectedPatta] = useState(null);

  const handleUpload = (pattaId) => {
    setSelectedPatta(pattaId);
  };

  // Dashboard-style header state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Document uploaded', time: '2 min ago' },
    { id: 2, type: 'info', message: 'Eligibility updated', time: '10 min ago' }
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Dashboard-style sticky header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Forest Rights Act Document Processing System</p>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="verified">Verified</option>
                <option value="processing">Processing</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="relative">
                <button className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Mobile Search - Collapsible */}
          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 lg:hidden">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="verified">Verified</option>
                  <option value="processing">Processing</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main dashboard content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <UploadSection onUpload={handleUpload} />
          </div>
          {selectedPatta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MapSection />
              <SchemeEligibility />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
//                 autoFocus
//               />
//               <button
//                 onClick={() => saveEdit(field)}
//                 className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors touch-manipulation"
//               >
//                 <FiSave className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={cancelEdit}
//                 className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors touch-manipulation"
//               >
//                 <FiX className="w-4 h-4" />
//               </button>
//             </>
//           ) : (
//             <>
//               <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-800 text-sm">
//                 {value || 'Not extracted'}
//               </div>
//               <button
//                 onClick={() => startEditing(field, value)}
//                 className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors touch-manipulation"
//               >
//                 <FiEdit3 className="w-4 h-4" />
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Expandable Section Component for Mobile
//   const ExpandableSection = ({ title, children, id, icon }) => {
//     const isExpanded = expandedSection === id;
    
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
//         <button
//           onClick={() => setExpandedSection(isExpanded ? null : id)}
//           className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center space-x-3">
//             <div className="text-blue-600">{icon}</div>
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           </div>
//           {isExpanded ? <FiChevronDown className="w-5 h-5 text-gray-500" /> : <FiChevronRight className="w-5 h-5 text-gray-500" />}
//         </button>
//         {isExpanded && (
//           <div className="p-4 pt-0 border-t border-gray-100">
//             {children}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="w-full min-h-screen bg-gray-50">
//       {/* Enhanced Mobile-First Header */}
//       <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
//         <div className="px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex-1 min-w-0">
//               <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
//                 FRA Portal
//               </h1>
//               <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
//                 Forest Rights Act Document Processing System
//               </p>
//             </div>
            
//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
//             >
//               <FiMenu className="w-6 h-6" />
//             </button>

//             {/* Desktop Actions */}
//             <div className="hidden lg:flex items-center space-x-4">
//               <div className="relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search by holder name, ID, or village..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//   // ...existing code...
                
//                 <div className="flex items-center space-x-2 flex-shrink-0">
//                   {file.status === 'uploading' && (
//                     <div className="w-16 lg:w-20 bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
//                         style={{ width: `${file.progress}%` }}
//                       // ...existing code...
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
//             <FiAward className="mr-2 text-emerald-600" /> Scheme Eligibility
//           </h3>
//         )}
        
//         {selectedPatta ? (
//           <div className="space-y-4">
//             {availableSchemes.map((scheme) => {
//               const isEligible = selectedPatta.schemes.includes(scheme.name);
//               return (
//                 <div key={scheme.id} className={`p-3 lg:p-4 rounded-lg border ${isEligible ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1 min-w-0">
//                       <h4 className={`text-sm lg:text-base font-medium ${isEligible ? 'text-emerald-900' : 'text-gray-700'}`}>
//                         {scheme.name}
//                       </h4>
//                       <p className={`text-xs lg:text-sm ${isEligible ? 'text-emerald-700' : 'text-gray-600'}`}>
//                         {scheme.description}
//                       </p>
//                       <div className={`text-xs font-medium mt-1 ${isEligible ? 'text-emerald-800' : 'text-gray-500'}`}>
//                         {scheme.amount}
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2 flex-shrink-0">
//                       <ConfidenceIndicator score={scheme.confidence} />
//                       {isEligible ? (
//                         <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
//                       ) : (
//                         <FiAlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {scheme.criteria.map((criterion, idx) => (
//                       <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
//                         {criterion}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="flex space-x-2">
//                     {isEligible ? (
//                       <button className="px-2 lg:px-3 py-1 lg:py-1.5 bg-emerald-600 text-white text-xs lg:text-sm rounded-lg hover:bg-emerald-700 transition-colors touch-manipulation">
//                         Approve
//                       </button>
//                     ) : (
//                       <button className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gray-600 text-white text-xs lg:text-sm rounded-lg hover:bg-gray-700 transition-colors touch-manipulation">
//                         Mark Eligible
//                       </button>
//                     )}
//                     <button className="px-2 lg:px-3 py-1 lg:py-1.5 border border-gray-300 text-gray-700 text-xs lg:text-sm rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
//                       Add Note
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="text-center py-6 lg:py-8">
//             <FiAward className="mx-auto w-8 lg:w-12 h-8 lg:h-12 text-gray-300 mb-3" />
//             <p className="text-gray-600 text-sm lg:text-base">Select a patta to check scheme eligibility</p>
//           </div>
//         )}
//       </div>
//     );
//   }
// };

// export default UserDashboard;