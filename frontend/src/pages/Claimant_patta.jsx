import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// For file upload and backend communication
// You may want to use axios or fetch for API calls
// import axios from 'axios';
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
  Briefcase
} from 'lucide-react';

const Claimant_patta = ({ userData }) => {
  // Modal state for new patta application
  const [showModal, setShowModal] = useState(false);
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  // OCR result state
  const [ocrResult, setOcrResult] = useState(null);
  // Loading state for OCR
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [adminMode, setAdminMode] = useState(false);
  const [adminEditing, setAdminEditing] = useState(null); // selected patta id for editing

  // pattas will be loaded from Supabase; remove hardcoded/dummy data
  const [pattas, setPattas] = useState([]);
  const [formData, setFormData] = useState({});
  
  // Supabase client is imported at top

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

// AdminEditModal component (moved to top-level to avoid declaring a function inside JSX)
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

  const PattaCard = ({ patta }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Show reject message if patta is rejected */}
      {patta.status && patta.status.toLowerCase() === 'rejected' && patta.reject_message && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle className="inline-block mr-2 h-4 w-4 text-red-500" />
          Rejected: {patta.reject_message}
        </div>
      )}
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              {getCategoryIcon(patta.category)}
            </div>

            {/* Admin Edit Modal */}
            {adminEditing && (
              <AdminEditModal
                pattaId={adminEditing}
                onClose={() => setAdminEditing(null)}
                onSaved={(updatedRow) => {
                  // update local pattas list
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

      {/* Content */}
      <div className="p-6">
        {/* Document preview */}
        {patta.patta_doc_url && (
          <div className="mb-4">
            <img src={patta.patta_doc_url} alt="patta document" className="w-full max-h-48 object-contain rounded-md border" />
          </div>
        )}
        {/* Progress Bar */}
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

        {/* Details Grid */}
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

        {/* Issues */}
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

        {/* Actions */}
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

  // Fetch pattas from Supabase on mount
  useEffect(() => {
    let mounted = true;
    const fetchPattas = async () => {
      try {
        const { data, error } = await supabase.from('pattas').select('*').order('date_applied', { ascending: false });
        if (error) {
          console.error('Error fetching pattas:', error);
          return;
        }
        // transform DB rows to the UI shape expected by PattaCard
        const transformed = (data || []).map((r) => transformRowToCard(r));
        if (mounted) setPattas(transformed);
      } catch (err) {
        console.error('Failed to load supabase client or pattas', err);
      }
    };
    fetchPattas();
    return () => { mounted = false };
  }, []);

  // When OCR result comes in, populate editable formData
  useEffect(() => {
    if (ocrResult && ocrResult.success && ocrResult.data) {
      setFormData(prev => ({ ...prev, ...ocrResult.data }));
    }
  }, [ocrResult]);

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Helper to convert DB row into the UI card shape (used by fetch and insert)
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
      reject_message: r.reject_message || ''
    };
  };

  // Claim handler: insert patta as guest into Supabase
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

      // Deduplication: check existing patta_id and (holder + filename) duplicates
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

      // If a file is selected, try to upload to Supabase Storage (bucket: 'patta-docs')
      let uploadedUrl = null;
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${pattaId}.${fileExt}`;
          // attempt to upload; this will fail if bucket doesn't exist or anon key lacks permissions
          const storageRes = await supabase.storage.from('patta-docs').upload(fileName, selectedFile, { upsert: false });
          if (storageRes.error) {
            console.warn('Storage upload warning:', storageRes.error.message || storageRes.error);
          } else {
            // get public URL
            const urlRes = await supabase.storage.from('patta-docs').getPublicUrl(fileName);
            // getPublicUrl returns { data: { publicUrl } } in many versions, or { publicUrl }
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
      // transform db row to UI card
      const inserted = data && data[0] ? data[0] : null;
      const card = transformRowToCard(inserted || payload);
      // prepend new patta to list
      setPattas(prev => [card, ...(prev || [])]);
      // Close modal and reset
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

  // Handler for Apply for New Patta button
  const handleOpenModal = () => {
    setShowModal(true);
    setSelectedFile(null);
    setOcrResult(null);
  };

  // Handler for closing modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setOcrResult(null);
    setLoading(false);
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handler for uploading file and getting OCR result
  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Send to backend ocr.py (assume endpoint: /api/ocr)
      // You may need to adjust the endpoint and CORS settings
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
      {/* Header */}
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
      {/* Modal for new patta application */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl relative mx-2 sm:mx-0">
            {/* Close button */}
            <button className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl" onClick={handleCloseModal}>&times;</button>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-900 text-center">Apply for New Patta</h3>
            {/* File upload input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image or PDF</label>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="border rounded px-3 py-2 w-full" />
            </div>
            {/* Upload button */}
            <button
              className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors mb-4 w-full sm:w-auto"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Processing...' : 'Run OCR & Fill Form'}
            </button>
            {/* OCR result form - Responsive and structured */}
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
                    {/* Claim button to save to Supabase */}
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
                {/* You can add Save/Submit logic here */}
              </form>
            )}
            {/* Error message */}
            {ocrResult && ocrResult.error && (
              <div className="mt-4 text-red-600 text-center">{ocrResult.error}</div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
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

          {/* Status Filter */}
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

          {/* View Mode Toggle */}
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredPattas.length} of {pattas.length} pattas
        </p>
      </div>

      {/* Pattas Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {filteredPattas.map((patta) => (
          <PattaCard key={patta.id} patta={patta} />
        ))}
      </div>

      {/* Empty State */}
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
          <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
            Apply for New Patta
          </button>
        </div>
      )}
    </div>
  );
};

export default Claimant_patta;