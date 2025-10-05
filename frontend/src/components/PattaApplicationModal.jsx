import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, FileText, CheckCircle, AlertCircle, Plus, Save, X } from 'lucide-react';

const createPattaId = () => `PATTA_${Date.now()}`;

const formatKeyLabel = (key) => key.replace(/_/g, ' ');

const DEFAULT_SUCCESS_MESSAGE = {
  title: 'OCR Processing Complete',
  description: 'Review and edit the extracted information below'
};

const DEFAULT_UPLOAD_META = {
  accept: 'image/*,.pdf',
  maxSizeLabel: 'PDF, JPG, PNG up to 10MB'
};

const PattaApplicationModal = ({
  isOpen,
  onClose,
  ownerId = 'guest',
  onPattaCreated,
  title = 'Apply for New Patta',
  subtitle = 'Upload your document and let AI extract the information automatically',
  submitLabel = 'Submit Application',
  storageBucket = 'patta-docs'
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setOcrResult(null);
      setFormData({});
      setLoading(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (ocrResult?.success && ocrResult?.data) {
      setFormData((prev) => ({ ...prev, ...ocrResult.data }));
    }
  }, [ocrResult]);

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (event) => {
    if (event?.target?.files?.[0]) {
      setSelectedFile(event.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const payload = new FormData();
      payload.append('file', selectedFile);
      const { backendUrl } = await import('../lib/api');
      const response = await fetch(backendUrl('/extract'), {
        method: 'POST',
        body: payload
      });
      const result = await response.json();
      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to process file.');
      }
      setOcrResult(result);
    } catch (err) {
      console.error('OCR upload failed:', err);
      setOcrResult({ error: err.message || 'Failed to process file.' });
    } finally {
      setLoading(false);
    }
  };

  const dedupeChecks = async (payload) => {
    const { patta_id: pattaId, holder_name: holderName } = payload;

    const { data: existingById, error: idError } = await supabase
      .from('pattas')
      .select('patta_id')
      .eq('patta_id', pattaId)
      .limit(1);

    if (idError) {
      console.warn('Patta ID dedupe check error:', idError);
    } else if (existingById && existingById.length > 0) {
      throw new Error('A patta with this generated ID already exists. Please retry.');
    }

    if (selectedFile && holderName) {
      const { data: existingByFile, error: fileError } = await supabase
        .from('pattas')
        .select('id')
        .eq('holder_name', holderName)
        .eq('patta_doc_filename', selectedFile.name)
        .limit(1);

      if (fileError) {
        console.warn('Patta file dedupe check error:', fileError);
      } else if (existingByFile && existingByFile.length > 0) {
        throw new Error('A claim with the same holder name and uploaded file already exists.');
      }
    }
  };

  const uploadDocumentIfNeeded = async (pattaId, payload) => {
    if (!selectedFile) return payload;

    try {
      const extension = selectedFile.name.split('.').pop();
      const storageFileName = `${pattaId}.${extension}`;
      const { error: uploadError } = await supabase
        .storage
        .from(storageBucket)
        .upload(storageFileName, selectedFile, { upsert: false });

      if (uploadError) {
        console.warn('Storage upload warning:', uploadError);
        return payload;
      }

      const { data: publicUrlData } = await supabase
        .storage
        .from(storageBucket)
        .getPublicUrl(storageFileName);

      const publicUrl = publicUrlData?.publicUrl || publicUrlData?.signedUrl || null;
      return {
        ...payload,
        patta_doc_url: publicUrl
      };
    } catch (err) {
      console.warn('Failed to upload patta document to storage:', err);
      return payload;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const pattaId = createPattaId();
      const normalizedOwnerId = ownerId || 'guest';
      const basePayload = {
        patta_id: pattaId,
  owner_id: normalizedOwnerId,
        holder_name: formData.holder_name || formData.holdername || null,
        category: formData.category || null,
        right_type: formData.right_type || formData.rightType || null,
        village: formData.village || null,
        district: formData.district || null,
        state: formData.state || null,
        coordinates:
          typeof formData.coordinates === 'object'
            ? JSON.stringify(formData.coordinates)
            : formData.coordinates || null,
        area_hectares: formData.area_hectares
          ? parseFloat(formData.area_hectares)
          : formData.area
          ? parseFloat(formData.area)
          : null,
        status: 'pending',
        recommended_schemes: formData.recommended_schemes
          ? JSON.stringify(formData.recommended_schemes)
          : JSON.stringify([]),
        date_applied: new Date().toISOString(),
        date_verified: null,
        reject_message: null,
        patta_doc_filename: selectedFile ? selectedFile.name : null,
        patta_doc_url: null,
        scheme_priority: formData.scheme_priority || 'balanced'
      };

      await dedupeChecks(basePayload);
      const payloadWithFile = await uploadDocumentIfNeeded(pattaId, basePayload);

      const { data, error } = await supabase
        .from('pattas')
        .insert([payloadWithFile])
        .select();

      if (error) {
        throw error;
      }

      const insertedRow = data?.[0] ?? payloadWithFile;
      onPattaCreated?.(insertedRow);
      onClose?.();
    } catch (err) {
      console.error('Failed to submit patta application:', err);
      setErrorMessage(err.message || 'Failed to submit patta application.');
    } finally {
      setLoading(false);
    }
  };

  const extractedDataEntries = useMemo(() => {
    if (Object.keys(formData).length > 0) return Object.entries(formData);
    if (ocrResult?.success && ocrResult?.data) return Object.entries(ocrResult.data);
    return [];
  }, [formData, ocrResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 overflow-hidden">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg sm:max-w-xl md:max-w-2xl relative mx-2 transform transition-all duration-300 max-h-[95vh] overflow-y-auto"
        style={{
          boxShadow:
            'inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        <button
          onClick={() => {
            if (!loading) {
              onClose?.();
            }
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div
              className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(20, 184, 166, 0.3)'
              }}
            >
              <Plus
                className="h-7 w-7 text-teal-700"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{subtitle}</p>
          </div>

          <div className="space-y-5">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-teal-700 transition-colors duration-200">
                Upload Document
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept={DEFAULT_UPLOAD_META.accept}
                  onChange={handleFileChange}
                  className="hidden"
                  id="patta-document-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="patta-document-upload"
                  className="flex items-center justify-center w-full px-6 py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-600 hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-gray-400 group-hover:text-teal-600 mx-auto mb-3 transition-colors duration-200" />
                    <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-medium text-sm">
                      {selectedFile ? selectedFile.name : 'Click to upload document'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{DEFAULT_UPLOAD_META.maxSizeLabel}</p>
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
                  <span>Run OCR &amp; Fill Form</span>
                </>
              )}
            </button>

            {ocrResult?.success && extractedDataEntries.length > 0 && (
              <div className="mt-6">
                <div className="text-center mb-5">
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <CheckCircle
                      className="h-6 w-6 text-green-700"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{DEFAULT_SUCCESS_MESSAGE.title}</h4>
                  <p className="text-gray-600 text-sm">{DEFAULT_SUCCESS_MESSAGE.description}</p>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {extractedDataEntries.map(([key, value]) => (
                      <div key={key} className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-teal-700 transition-colors duration-200 capitalize">
                          {formatKeyLabel(key)}
                        </label>
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
                      onClick={handleSubmit}
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
                          <span>{submitLabel}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => !loading && onClose?.()}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 border border-gray-300 text-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {ocrResult?.error && (
              <div
                className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-medium text-sm">Processing Error</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{ocrResult.error}</p>
              </div>
            )}

            {errorMessage && (
              <div
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-medium text-sm">Submission Error</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PattaApplicationModal;
