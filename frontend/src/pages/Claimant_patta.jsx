import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
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
  Printer,
  Upload,
  Save
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
  const navigate = useNavigate();
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

  // Add Alan Sans font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!patta) return;
      
  // Prefer encoding the actual patta document URL so scanning goes directly to the document
  const shareableData = patta.patta_doc_url && patta.patta_doc_url !== 'null' ? patta.patta_doc_url : `https://fra-atlas.vercel.app/verify/${patta.id}`;

  // Generate QR code URL using QR Server API (encodes the document URL)
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&format=png&ecc=M&margin=20&data=${encodeURIComponent(shareableData)}`;
  setQrDataURL(qrURL);
      
      // Simulate loading
      setTimeout(() => setIsLoading(false), 800);
    }, [patta]);

    // Share the QR image (preferred) or fallback to sharing the document URL
    const handleShare = async () => {
      const shareableData = patta.patta_doc_url && patta.patta_doc_url !== 'null' ? patta.patta_doc_url : `https://fra-atlas.vercel.app/verify/${patta.id}`;
      try {
        // Attempt to fetch the generated QR image and share as a file (Web Share API with files)
        if (qrDataURL) {
          const resp = await fetch(qrDataURL, { mode: 'cors' });
          const blob = await resp.blob();
          const file = new File([blob], `fra-patta-${patta.id}-qr.png`, { type: blob.type || 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: `Patta QR: ${patta.id}`, text: `${patta.title || patta.id}` });
            return;
          }
        }

        // Fallback: share the document URL (or verification URL)
        if (navigator.share) {
          await navigator.share({ title: `Patta: ${patta.id}`, text: `${patta.title || patta.id}`, url: shareableData });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareableData);
          alert('Document link copied to clipboard');
        } else {
          // Last resort open the link in a new tab
          window.open(shareableData, '_blank');
        }
      } catch (err) {
        console.error('Error sharing QR/image:', err);
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareableData);
            alert('Document link copied to clipboard');
          } else {
            window.open(shareableData, '_blank');
          }
        } catch (e) {
          console.error('Fallback share failed', e);
        }
      }
    };

    if (!patta) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm p-2 overflow-hidden">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-full max-w-xs sm:max-w-sm relative mx-2 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-green-50/30 to-emerald-50/50 rounded-xl"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative p-4 text-center">
            {/* Compact Header */}
            <div className="mb-3">
              <div className="relative inline-flex p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-2 shadow-lg">
                <QrCode className="relative h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">QR Certificate</h3>
            </div>

            {/* Compact QR Code Display */}
            <div className="relative mb-3">
              <div className="bg-white/90 border border-gray-100 rounded-lg p-2 inline-block shadow-lg">
                {isLoading ? (
                  <div className="w-28 h-28 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <img 
                    src={qrDataURL} 
                    alt="Patta QR Code" 
                    className="w-28 h-28 mx-auto rounded"
                    onLoad={() => setIsLoading(false)}
                  />
                )}
              </div>
            </div>

            {/* Compact Info Cards */}
            <div className="bg-gray-50/80 rounded-lg p-2 mb-3 text-left">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/60 rounded p-1.5">
                  <div className="text-gray-500 text-xs mb-0.5">ID: <span className="font-mono font-bold text-gray-900">{patta.id}</span></div>
                </div>
                <div className="bg-white/60 rounded p-1.5">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(patta.status)}`}>
                    {patta.status}
                  </span>
                </div>
                <div className="bg-white/60 rounded p-1.5 col-span-2">
                  <div className="text-gray-500 text-xs">Holder: <span className="font-bold text-gray-900 truncate">{patta.title}</span></div>
                </div>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const url = patta.patta_doc_url && patta.patta_doc_url !== 'null' ? patta.patta_doc_url : `https://fra-atlas.vercel.app/verify/${patta.id}`;
                    window.open(url, '_blank');
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  <Eye className="h-3 w-3" />
                  <span>View</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            {/* Mini footer */}
            <p className="mt-3 text-xs text-gray-500">🔒 Secure verification</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group transform hover:scale-[1.02] hover:-translate-y-1" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
        {patta.status && patta.status.toLowerCase() === 'rejected' && patta.reject_message && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-sm font-medium">
            <AlertCircle className="inline-block mr-2 h-4 w-4 text-red-600" />
            Rejected: {patta.reject_message}
          </div>
        )}
        
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'}}>
                <div style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) brightness(1.2) contrast(1.4)', color: '#0f766e'}}>
                  {getCategoryIcon(patta.category)}
                </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{patta.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{patta.location}</p>
 
                <div className="flex items-center space-x-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    getStatusColor(patta.status)
                  } flex items-center gap-1`}>
                    {getStatusIcon(patta.status)}
                    <span>{patta.status}</span>
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {patta.id}</span>
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
                  className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
                  title="Share via QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <MoreVertical className="h-4 w-4" />
              </button>
              {adminMode && (
                <button onClick={() => setAdminEditing(patta.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">Admin</button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {patta.patta_doc_url && (
            <div className="mb-4">
              <img src={patta.patta_doc_url} alt="patta document" className="w-full max-h-48 object-contain rounded-md border border-gray-200" />
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Processing Progress</span>
              <span className="text-teal-700 font-semibold">{patta.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <div 
                className={`h-2.5 rounded-full transition-all duration-1000 ${
                  patta.progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 
                  patta.progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${patta.progress}%`, boxShadow: '0 2px 4px rgba(20, 184, 166, 0.4)' }}
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
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)'}}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Pending Issues</span>
              </div>
              <ul className="space-y-1">
                {patta.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-orange-700">• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
              onClick={() => {
                try {
                  // publish patta for dashboard to pick up and navigate there
                  window.__openPattaOnDashboard = patta;
                } catch (e) { console.warn('Failed to set global patta', e); }
                // navigate to workflow_user dashboard
                try {
                  navigate('/workflow_user');
                } catch (e) {
                  console.warn('Failed to navigate to dashboard', e);
                  window.location.href = '/#/workflow_user';
                }
              }}
            >
              <MapIcon className="h-4 w-4" />
              <span>View on Map</span>
            </button>
            {patta.status === 'Pending' && (
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-200 text-sm">
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
      const { backendUrl } = await import('../lib/api');
      const response = await fetch(backendUrl('/extract'), {
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
    <div className="min-h-screen bg-gray-50" style={{fontFamily: '"Alan Sans", sans-serif', fontOpticalSizing: 'auto', fontWeight: 728, fontStyle: 'normal'}}>
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            My Pattas
          </h2>
          <p className="text-gray-600 text-base">Manage your forest rights certificates and land records</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {pattas.length} total records
            </span>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
          onClick={handleOpenModal}
        >
          <Plus className="h-5 w-5" />
          <span>Apply for New Patta</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg sm:max-w-xl md:max-w-2xl relative mx-2 transform transition-all duration-300 max-h-[95vh] overflow-y-auto" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.25)'}}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm" onClick={handleCloseModal}>
                <X className="h-5 w-5" />
              </button>
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'}}>
                    <Plus className="h-7 w-7 text-teal-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Apply for New Patta</h3>
                  <p className="text-gray-600 text-sm">Upload your document and let AI extract the information automatically</p>
                </div>
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-teal-700 transition-colors duration-200">Upload Document</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="document-upload-modal"
                      />
                      <label htmlFor="document-upload-modal" className="flex items-center justify-center w-full px-6 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-600 hover:bg-gray-100 transition-all duration-200 group">
                        <div className="text-center">
                          <Upload className="h-10 w-10 text-gray-400 group-hover:text-teal-600 mx-auto mb-3 transition-colors duration-200" />
                          <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-medium text-sm">
                            {selectedFile ? selectedFile.name : 'Click to upload document'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    className="w-full px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        <span>Run OCR & Fill Form</span>
                      </>
                    )}
                  </button>

                  {ocrResult && ocrResult.success && ocrResult.data && (
                    <div className="mt-6">
                      <div className="text-center mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(34, 197, 94, 0.3)'}}>
                          <CheckCircle className="h-6 w-6 text-green-700" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">OCR Processing Complete</h4>
                        <p className="text-gray-600 text-sm">Review and edit the extracted information below</p>
                      </div>

                      <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(formData).length > 0 ? Object.entries(formData).map(([key, value]) => (
                            <div key={key} className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-teal-700 transition-colors duration-200 capitalize">{key.replace(/_/g, ' ')}</label>
                              <input
                                type="text"
                                value={value ?? ''}
                                onChange={(e) => handleFormChange(key, e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm"
                              />
                            </div>
                          )) : Object.entries(ocrResult.data).map(([key, value]) => (
                            <div key={key} className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-teal-700 transition-colors duration-200 capitalize">{key.replace(/_/g, ' ')}</label>
                              <input
                                type="text"
                                value={value ?? ''}
                                onChange={(e) => handleFormChange(key, e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleClaim}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5" />
                                <span>Claim Patta</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 border border-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {ocrResult && ocrResult.error && (
                    <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)'}}>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800 font-medium text-sm">Processing Error</p>
                      </div>
                      <p className="text-red-700 text-sm mt-1">{ocrResult.error}</p>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}      {showQRModal && selectedPattaForQR && (
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform hover:scale-[1.01] transition-all duration-300" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05)'}}>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, location, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600 font-medium text-sm">
          Showing <span className="text-gray-900 font-semibold">{filteredPattas.length}</span> of <span className="text-gray-900 font-semibold">{pattas.length}</span> pattas
        </p>
      </div>

      </div>

      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {filteredPattas.map((patta) => (
          <PattaCard key={patta.id} patta={patta} />
        ))}
      </div>

      {filteredPattas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center" style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.1)'}}>
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-6" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1)'}}>
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pattas Found</h3>
          <p className="text-gray-600 mb-6 text-base max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? "No pattas match your current search and filter criteria."
              : "You haven't applied for any pattas yet."
            }
          </p>
          <button 
            onClick={handleOpenModal}
            className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium transition-all duration-200"
          >
            Apply for New Patta
          </button>
        </div>
      )}
    </div>
  );
};

export default Claimant_patta;