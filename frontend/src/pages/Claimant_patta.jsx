import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  MapPin, 
  FileText, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Users, 
  Ruler, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Share2,
  Edit,
  Trash2,
  MapIcon,
  TreePine,
  Home,
  Briefcase,
  QrCode,
  X,
  Printer
} from 'lucide-react';

// Government Certificate Verification Component
const OfficialCertificate = ({ pattaId, onClose }) => {
  const [pattaData, setPattaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPattaData = async () => {
      try {
        const { data, error } = await supabase
          .from('pattas')
          .select('*')
          .or(`patta_id.eq.${pattaId},id.eq.${pattaId}`)
          .single();
        
        if (error) throw error;
        setPattaData(data);
      } catch (error) {
        console.error('Error fetching patta:', error);
        setPattaData({
          patta_id: pattaId,
          holder_name: 'Certificate Holder',
          village: 'N/A',
          district: 'N/A',
          state: 'N/A',
          area_hectares: 0,
          right_type: 'Individual',
          category: 'Forest Rights',
          forest_type: 'N/A',
          coordinates: 'N/A',
          status: 'verified',
          date_applied: new Date().toISOString(),
          date_verified: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    if (pattaId) {
      fetchPattaData();
    }
  }, [pattaId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!pattaData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-container { box-shadow: none; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white shadow-2xl border-4 border-yellow-600 print-container" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="text-yellow-600 opacity-5 text-9xl font-bold transform -rotate-45">VERIFIED</div>
        </div>

        {/* Header */}
        <div className="relative bg-gradient-to-b from-orange-500 via-white to-green-600 p-6 sm:p-8 text-center border-b-4 border-yellow-600">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center border-4 border-yellow-600 shadow-lg">
            <span className="text-4xl sm:text-5xl">🦁</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-blue-900 mb-2 tracking-wider">GOVERNMENT OF INDIA</h1>
          <h2 className="text-lg sm:text-2xl font-bold text-red-800 mb-1">Ministry of Tribal Affairs</h2>
          <p className="text-sm sm:text-base text-gray-700 italic">Forest Rights Act, 2006</p>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-8">
          <h3 className="text-2xl sm:text-4xl font-bold text-center text-red-800 mb-6 uppercase tracking-widest border-b-4 border-yellow-600 pb-4">
            Forest Rights Certificate (Patta)
          </h3>

          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full font-bold text-base sm:text-lg shadow-lg pulse-animation">
              ✓ OFFICIALLY VERIFIED
            </div>
          </div>

          <div className="text-center mb-6 text-base sm:text-lg font-bold text-red-800">
            Certificate No: {pattaData.patta_id || pattaData.id}
          </div>

          <p className="text-sm sm:text-base text-center leading-relaxed mb-8 px-2 sm:px-4">
            This is to certify that the Forest Rights mentioned herein have been duly recognized and verified under the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006.
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Holder Name', value: pattaData.holder_name },
              { label: 'Village', value: pattaData.village },
              { label: 'District', value: pattaData.district },
              { label: 'State', value: pattaData.state },
              { label: 'Area (Hectares)', value: pattaData.area_hectares },
              { label: 'Right Type', value: pattaData.right_type },
              { label: 'Category', value: pattaData.category },
              { label: 'Forest Type', value: pattaData.forest_type },
              { label: 'Coordinates', value: typeof pattaData.coordinates === 'object' ? JSON.stringify(pattaData.coordinates) : pattaData.coordinates },
              { label: 'Status', value: pattaData.status, isStatus: true },
              { label: 'Date Applied', value: pattaData.date_applied ? new Date(pattaData.date_applied).toLocaleDateString('en-IN') : 'N/A' },
              { label: 'Date Verified', value: pattaData.date_verified ? new Date(pattaData.date_verified).toLocaleDateString('en-IN') : 'N/A' }
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-l-4 border-yellow-600 rounded shadow-sm">
                <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider mb-1 font-semibold">{item.label}</div>
                <div className="text-sm sm:text-lg font-bold text-gray-900">
                  {item.isStatus ? (
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                      ✓ {String(item.value).toUpperCase()}
                    </span>
                  ) : (
                    item.value || 'N/A'
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Official Seal */}
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-yellow-600 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center shadow-xl transform -rotate-12">
              <div className="text-yellow-500 font-bold text-center text-xs sm:text-sm leading-tight">
                OFFICIAL<br/>SEAL<br/>⚖️
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pt-8 border-t-2 border-yellow-600">
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-16 mx-4">
                <p className="font-bold text-blue-900 text-sm sm:text-base">Authorized Officer</p>
                <p className="text-xs text-gray-600">Forest Rights Committee</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-16 mx-4">
                <p className="font-bold text-blue-900 text-sm sm:text-base">District Level Committee</p>
                <p className="text-xs text-gray-600">Verification Authority</p>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded text-xs sm:text-sm">
            <strong>Note:</strong> This certificate is issued under the provisions of the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006. Any misuse or forgery of this document is punishable under Indian law.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-900 text-white text-center p-4 sm:p-6 text-xs sm:text-sm">
          <p className="font-semibold">Ministry of Tribal Affairs, Government of India</p>
          <p className="mt-1">Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</p>
          <p className="mt-3">
            Generated: {new Date().toLocaleDateString('en-IN')} | 
            Verification ID: VRF-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print flex justify-center gap-4 mt-6 mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg"
        >
          <Printer className="h-5 w-5" />
          Print Certificate
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg"
        >
          <X className="h-5 w-5" />
          Close
        </button>
      </div>
    </div>
  );
};

const Claimant_patta = ({ userData }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [adminMode, setAdminMode] = useState(false);
  const [adminEditing, setAdminEditing] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPattaForQR, setSelectedPattaForQR] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedPattaForCert, setSelectedPattaForCert] = useState(null);
  const [pattas, setPattas] = useState([]);
  const [formData, setFormData] = useState({});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Under Review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Residential':
        return <Home className="h-5 w-5" />;
      case 'Agricultural':
        return <Briefcase className="h-5 w-5" />;
      case 'Forest Rights':
        return <TreePine className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // QR Code Modal Component
  const QRCodeModal = ({ patta, onClose }) => {
    const [qrDataURL, setQrDataURL] = useState('');

    useEffect(() => {
      if (!patta) return;
      
      // Create a shareable URL with patta ID encoded
      const shareableData = `PATTA_VERIFY:${patta.id}`;
      
      // Generate QR code URL using QR Server API
      const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareableData)}`;
      setQrDataURL(qrURL);
    }, [patta]);

    if (!patta) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg relative my-4 mx-2 sm:mx-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="p-4 sm:p-6 md:p-8 text-center">
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex p-2 sm:p-3 bg-green-100 rounded-full mb-3 sm:mb-4">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Share Patta Certificate</h3>
              <p className="text-xs sm:text-sm text-gray-600 px-2">Scan this QR code to view official patta certificate</p>
            </div>

            {/* QR Code Display */}
            <div className="bg-white border-2 sm:border-4 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 inline-block">
              <img 
                src={qrDataURL} 
                alt="Patta QR Code" 
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto"
              />
            </div>

            {/* Patta Info Summary */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Patta Information</h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium text-gray-900 text-right">{patta.id}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Holder:</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%] break-words">{patta.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patta.status)}`}>
                    {patta.status}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium text-gray-900 text-right">{patta.area}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedPattaForCert(patta.id);
                  setShowCertificate(true);
                }}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>View Certificate</span>
              </button>
              
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrDataURL;
                  link.download = `patta-${patta.id}-qr.png`;
                  link.click();
                }}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Download QR Code</span>
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">Scan with any QR scanner app or use "View Certificate" button</p>
          </div>
        </div>
      </div>
    );
  };

  function AdminEditModal({ pattaId, onClose, onSaved }) {
    const [loading, setLoading] = useState(false);
    const [row, setRow] = useState(null);
    const [status, setStatus] = useState('pending');
    const [dateVerified, setDateVerified] = useState('');
    const [rejectMessage, setRejectMessage] = useState('');

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const { data, error } = await supabase.from('pattas').select('*').or(`patta_id.eq.${pattaId},id.eq.${pattaId}`);
          if (error) throw error;
          const r = data && data[0];
          if (mounted && r) {
            setRow(r);
            setStatus(r.status || 'pending');
            setDateVerified(r.date_verified ? new Date(r.date_verified).toISOString().slice(0, 16) : '');
            setRejectMessage(r.reject_message || '');
          }
        } catch (err) {
          console.error('Failed to load patta for admin edit', err);
        }
      })();
      return () => { mounted = false };
    }, [pattaId]);

    const handleSave = async () => {
      setLoading(true);
      try {
        const update = {
          status,
          date_verified: dateVerified ? new Date(dateVerified).toISOString() : null,
          reject_message: rejectMessage
        };
        const { data, error } = await supabase.from('pattas').update(update).or(`patta_id.eq.${pattaId},id.eq.${pattaId}`).select();
        if (error) throw error;
        onSaved(data && data[0]);
      } catch (err) {
        console.error('Failed to update patta', err);
        alert('Failed to update patta: ' + (err.message || err));
      }
      setLoading(false);
    };

    if (!row) return null;
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Admin edit: {row.patta_id}</h3>
          <div className="space-y-3">
            <label className="block text-sm">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <label className="block text-sm">Date verified</label>
            <input type="datetime-local" value={dateVerified} onChange={(e) => setDateVerified(e.target.value)} className="w-full border rounded px-3 py-2" />

            <label className="block text-sm">Reject message</label>
            <input type="text" value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    );
  }

  const filteredPattas = pattas.filter(patta => {
    const title = (patta.title || '').toString();
    const location = (patta.location || '').toString();
    const pid = (patta.id || '').toString();
    const statusVal = (patta.status || '').toString();

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         statusVal.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const PattaCard = ({ patta }) => {
    const isVerified = patta.status && (patta.status.toLowerCase() === 'verified' || patta.status.toLowerCase() === 'approved');

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {patta.status && patta.status.toLowerCase() === 'rejected' && patta.reject_message && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm font-medium">
            <AlertCircle className="inline-block mr-2 h-4 w-4 text-red-500" />
            Rejected: {patta.reject_message}
          </div>
        )}
        
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                {getCategoryIcon(patta.category)}
              </div>

              {adminEditing && (
                <AdminEditModal
                  pattaId={adminEditing}
                  onClose={() => setAdminEditing(null)}
                  onSaved={(updatedRow) => {
                    setPattas(prev => prev.map(p => p.id === (updatedRow.patta_id || updatedRow.id) ? transformRowToCard(updatedRow) : p));
                    setAdminEditing(null);
                  }}
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{patta.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{patta.location}</p>
 
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patta.status)}`}>
                    {getStatusIcon(patta.status)}
                    <span className="ml-1">{patta.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">ID: {patta.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isVerified && (
                <button 
                  onClick={() => {
                    setSelectedPattaForQR(patta);
                    setShowQRModal(true);
                  }}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                  title="Share via QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
              {adminMode && (
                <button onClick={() => setAdminEditing(patta.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">Admin</button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {patta.patta_doc_url && (
            <div className="mb-4">
              <img src={patta.patta_doc_url} alt="patta document" className="w-full max-h-48 object-contain rounded-md border" />
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Processing Progress</span>
              <span className="text-gray-600">{patta.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  patta.progress === 100 ? 'bg-green-500' : 
                  patta.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${patta.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Ruler className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Area:</span>
                <span className="font-medium text-gray-900">{patta.area}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Applied:</span>
                <span className="font-medium text-gray-900">{patta.dateApplied}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {patta.type === 'Individual' ? 
                  <User className="h-4 w-4 text-gray-500" /> : 
                  <Users className="h-4 w-4 text-gray-500" />
                }
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">{patta.type}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium text-gray-900 text-xs">{patta.coordinates}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <TreePine className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Forest Type:</span>
                <span className="font-medium text-gray-900">{patta.forestType}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium text-gray-900">{patta.lastUpdated}</span>
              </div>
            </div>
          </div>

          {patta.issues.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-700">Pending Issues</span>
              </div>
              <ul className="space-y-1">
                {patta.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-orange-700">• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <MapIcon className="h-4 w-4" />
              <span>View on Map</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            {patta.status === 'Pending' && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                <Edit className="h-4 w-4" />
                <span>Update</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let mounted = true;
    const fetchPattas = async () => {
      try {
        const { data, error } = await supabase.from('pattas').select('*').order('date_applied', { ascending: false });
        if (error) {
          console.error('Error fetching pattas:', error);
          return;
        }
        const transformed = (data || []).map((r) => transformRowToCard(r));
        if (mounted) setPattas(transformed);
      } catch (err) {
        console.error('Failed to load supabase client or pattas', err);
      }
    };
    fetchPattas();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (ocrResult && ocrResult.success && ocrResult.data) {
      setFormData(prev => ({ ...prev, ...ocrResult.data }));
    }
  }, [ocrResult]);

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const transformRowToCard = (r) => {
    if (!r) return {};
    const coords = r.coordinates && typeof r.coordinates === 'object' ? (
      r.coordinates.lat && r.coordinates.lng ? `${r.coordinates.lat}°, ${r.coordinates.lng}°` : JSON.stringify(r.coordinates)
    ) : (r.coordinates || '');
    const status = r.status ? String(r.status).charAt(0).toUpperCase() + String(r.status).slice(1) : 'Pending';
    return {
      id: r.patta_id || r.id,
      title: r.holder_name || r.patta_id || 'Patta',
      location: [r.village, r.district].filter(Boolean).join(', '),
      coordinates: coords,
      area: r.area_hectares ? `${r.area_hectares} hectares` : (r.area || ''),
      areaInAcres: r.area_acres || '',
      status: status,
      type: r.right_type || 'Individual',
      category: r.category || '',
      dateApplied: r.date_applied ? new Date(r.date_applied).toLocaleDateString() : '',
      dateApproved: r.date_verified ? new Date(r.date_verified).toLocaleDateString() : null,
      validUntil: null,
      landUse: r.land_use || '',
      soilType: r.soil_type || '',
      forestType: r.forest_type || '',
      nearbyLandmarks: r.nearby_landmarks || [],
      documents: r.documents || [],
      lastUpdated: r.updated_at ? new Date(r.updated_at).toLocaleString() : '',
      progress: status.toLowerCase() === 'verified' || status.toLowerCase() === 'approved' ? 100 : (status.toLowerCase() === 'pending' ? 30 : 0),
      issues: r.issues || [],
      reject_message: r.reject_message || '',
      patta_doc_url: r.patta_doc_url || null
    };
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const pattaId = `PATTA_${Date.now()}`;
      const payload = {
        patta_id: pattaId,
        owner_id: 'guest',
        holder_name: formData.holder_name || formData.holdername || null,
        category: formData.category || null,
        right_type: formData.right_type || formData.rightType || null,
        village: formData.village || null,
        district: formData.district || null,
        state: formData.state || null,
        coordinates: typeof formData.coordinates === 'object' ? JSON.stringify(formData.coordinates) : (formData.coordinates || null),
        area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : (formData.area ? parseFloat(formData.area) : null),
        status: 'pending',
        recommended_schemes: formData.recommended_schemes ? JSON.stringify(formData.recommended_schemes) : JSON.stringify([]),
        date_applied: new Date().toISOString(),
        date_verified: null,
        reject_message: 'Illegal claim',
        patta_doc_filename: selectedFile ? selectedFile.name : null,
        patta_doc_url: null,
        scheme_priority: formData.scheme_priority || 'balanced'
      };

      const existingById = await supabase.from('pattas').select('patta_id').eq('patta_id', pattaId).limit(1);
      if (existingById.error) console.warn('dedupe check error', existingById.error);
      if (existingById.data && existingById.data.length > 0) {
        alert('A patta with this ID already exists. Please try again.');
        setLoading(false);
        return;
      }
      if (selectedFile && payload.holder_name) {
        const existingByFile = await supabase.from('pattas').select('id').eq('holder_name', payload.holder_name).eq('patta_doc_filename', selectedFile.name).limit(1);
        if (existingByFile.error) console.warn('dedupe check error', existingByFile.error);
        if (existingByFile.data && existingByFile.data.length > 0) {
          alert('A claim with the same holder name and uploaded file already exists. Duplicate prevented.');
          setLoading(false);
          return;
        }
      }

      let uploadedUrl = null;
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${pattaId}.${fileExt}`;
          const storageRes = await supabase.storage.from('patta-docs').upload(fileName, selectedFile, { upsert: false });
          if (storageRes.error) {
            console.warn('Storage upload warning:', storageRes.error.message || storageRes.error);
          } else {
            const urlRes = await supabase.storage.from('patta-docs').getPublicUrl(fileName);
            const publicUrl = urlRes?.data?.publicUrl || urlRes?.publicUrl || null;
            uploadedUrl = publicUrl;
            payload.patta_doc_url = uploadedUrl;
          }
        } catch (err) {
          console.warn('Failed to upload file to storage:', err.message || err);
        }
      }

      const { data, error } = await supabase.from('pattas').insert([payload]).select();
      if (error) throw error;
      const inserted = data && data[0] ? data[0] : null;
      const card = transformRowToCard(inserted || payload);
      setPattas(prev => [card, ...(prev || [])]);
      setShowModal(false);
      setSelectedFile(null);
      setOcrResult(null);
      setFormData({});
    } catch (err) {
      console.error('Failed to save patta:', err);
      alert('Failed to save patta: ' + (err.message || err.toString()));
    }
    setLoading(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setSelectedFile(null);
    setOcrResult(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setOcrResult(null);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('http://localhost:5000/extract', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setOcrResult(result);
    } catch (error) {
      setOcrResult({ error: 'Failed to process file.' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Pattas</h2>
          <p className="text-gray-600">Manage your forest rights certificates and land records</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          onClick={handleOpenModal}
        >
          <Plus className="h-5 w-5" />
          <span>Apply for New Patta</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl relative mx-2 sm:mx-0">
            <button className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl" onClick={handleCloseModal}>&times;</button>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-900 text-center">Apply for New Patta</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image or PDF</label>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="border rounded px-3 py-2 w-full" />
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors mb-4 w-full sm:w-auto"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Processing...' : 'Run OCR & Fill Form'}
            </button>
            {ocrResult && ocrResult.success && ocrResult.data && (
              <form className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(formData).length > 0 ? Object.entries(formData).map(([key, value]) => (
                      <div key={key} className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                        <input
                          type="text"
                          value={value ?? ''}
                          onChange={(e) => handleFormChange(key, e.target.value)}
                          className="border rounded px-3 py-2 w-full text-sm bg-white"
                        />
                      </div>
                    )) : Object.entries(ocrResult.data).map(([key, value]) => (
                      <div key={key} className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                        <input
                          type="text"
                          value={value ?? ''}
                          onChange={(e) => handleFormChange(key, e.target.value)}
                          className="border rounded px-3 py-2 w-full text-sm bg-white"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex items-center justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={handleClaim}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
                      >
                        {loading ? 'Saving...' : 'Claim'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
              </form>
            )}
            {ocrResult && ocrResult.error && (
              <div className="mt-4 text-red-600 text-center">{ocrResult.error}</div>
            )}
          </div>
        </div>
      )}

      {showQRModal && selectedPattaForQR && (
        <QRCodeModal 
          patta={selectedPattaForQR} 
          onClose={() => {
            setShowQRModal(false);
            setSelectedPattaForQR(null);
          }} 
        />
      )}

      {showCertificate && selectedPattaForCert && (
        <OfficialCertificate 
          pattaId={selectedPattaForCert}
          onClose={() => {
            setShowCertificate(false);
            setSelectedPattaForCert(null);
          }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, location, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredPattas.length} of {pattas.length} pattas
        </p>
      </div>

      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {filteredPattas.map((patta) => (
          <PattaCard key={patta.id} patta={patta} />
        ))}
      </div>

      {filteredPattas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pattas Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? "No pattas match your current search and filter criteria."
              : "You haven't applied for any pattas yet."
            }
          </p>
          <button 
            onClick={handleOpenModal}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Apply for New Patta
          </button>
        </div>
      )}
    </div>
  );
};

export default Claimant_patta;