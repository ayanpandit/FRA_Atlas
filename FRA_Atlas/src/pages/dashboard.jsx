import React, { useState } from 'react';
import { FiUpload, FiDownload, FiMap, FiCheckCircle, FiClock, FiAlertCircle, FiFileText, FiUser, FiHome, FiLayers } from 'react-icons/fi';

const Dashboard = () => {
  // Dummy data for demonstration
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stats data
  const stats = [
    { id: 1, title: 'Total Pattas', count: 1247, icon: <FiFileText className="text-blue-500" />, bgColor: 'bg-blue-50' },
    { id: 2, title: 'Verified', count: 892, icon: <FiCheckCircle className="text-green-500" />, bgColor: 'bg-green-50' },
    { id: 3, title: 'Approved', count: 756, icon: <FiCheckCircle className="text-teal-500" />, bgColor: 'bg-teal-50' },
    { id: 4, title: 'Pending', count: 355, icon: <FiClock className="text-amber-500" />, bgColor: 'bg-amber-50' },
  ];

  // Recent pattas data
  const recentPattas = [
    { id: 'PTT-2023-001', holder: 'Ramesh Kumar', village: 'Chandpur', area: '1.5 hectares', status: 'Approved', eligibility: 'Eligible' },
    { id: 'PTT-2023-002', holder: 'Sunita Devi', village: 'Bhimtal', area: '0.8 hectares', status: 'Pending', eligibility: 'Eligible' },
    { id: 'PTT-2023-003', holder: 'Mohan Singh', village: 'Ramnagar', area: '2.3 hectares', status: 'Verified', eligibility: 'Not Eligible' },
    { id: 'PTT-2023-004', holder: 'Priya Sharma', village: 'Haldwani', area: '1.2 hectares', status: 'Approved', eligibility: 'Eligible' },
  ];

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setExtractedData({
          pattaNumber: 'PTT-2023-005',
          holderName: 'Vikram Patel',
          fatherName: 'Suresh Patel',
          village: 'Kaladhungi',
          district: 'Nainital',
          state: 'Uttarakhand',
          landSize: '1.7 hectares',
          landType: 'Agricultural',
          issueDate: '15-06-2023',
          coordinates: [{
            lat: 29.3803,
            lng: 79.4636
          }]
        });
      }, 2000);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setExtractedData({
          pattaNumber: 'PTT-2023-006',
          holderName: 'Anita Rawat',
          fatherName: 'Govind Rawat',
          village: 'Bhowali',
          district: 'Nainital',
          state: 'Uttarakhand',
          landSize: '0.9 hectares',
          landType: 'Agricultural',
          issueDate: '22-07-2023',
          coordinates: [{
            lat: 29.3803,
            lng: 79.4636
          }]
        });
      }, 2000);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'Approved':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Verified':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'Pending':
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  // Eligibility badge component
  const EligibilityBadge = ({ eligibility }) => {
    const isEligible = eligibility === 'Eligible';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {eligibility}
      </span>
    );
  };

  return (
    <div className="w-full h-full">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.id} className={`${stat.bgColor} rounded-lg shadow-sm p-4 flex items-center`}>
            <div className="rounded-full p-3 mr-4 bg-white">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-gray-800 text-xl font-bold">{stat.count.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiUpload className="mr-2" /> Upload Patta Document
          </h2>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleFileUpload}
            />
            <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">Drag & drop your file here</p>
            <p className="text-gray-500 text-sm">or <span className="text-blue-500 font-medium">browse files</span></p>
            <p className="text-gray-400 text-xs mt-2">Supports: PDF, JPG, PNG</p>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
              <FiFileText className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700 truncate flex-1">{uploadedFile.name}</span>
              {isProcessing ? (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Processing...</span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Processed</span>
              )}
            </div>
          )}

          {/* Recent Uploads */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Recent Uploads</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holder</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {recentPattas.slice(0, 3).map((patta) => (
                    <tr key={patta.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{patta.id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{patta.holder}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge status={patta.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* OCR & Extracted Info Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiFileText className="mr-2" /> Extracted Information
          </h2>
          
          {!extractedData && !isProcessing && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiFileText className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">Upload a document to extract information</p>
              <p className="text-gray-400 text-sm mt-1">Supported formats: PDF, JPG, PNG</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600">Processing document...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a few moments</p>
            </div>
          )}

          {extractedData && !isProcessing && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Patta Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Patta Number</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.pattaNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Issue Date</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Land Size</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.landSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Land Type</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.landType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Holder Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.holderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Father's Name</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.fatherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Village</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.village}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">District</span>
                      <span className="text-sm font-medium text-gray-800">{extractedData.district}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Integration */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FiMap className="mr-1" /> Land Location
                </h3>
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* This would be replaced with an actual map component */}
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/79.4636,29.3803,12,0/600x300?access_token=placeholder')" }}></div>
                  <div className="absolute top-2 right-2 bg-white rounded-md shadow p-1 z-10">
                    <button className="p-1 hover:bg-gray-100 rounded" title="Toggle Layers">
                      <FiLayers className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Beneficiary Eligibility & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Eligibility Status</h3>
                  <div className="flex items-center">
                    <div className="mr-2">
                      <FiCheckCircle className="text-green-500 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Eligible for Government Schemes</p>
                      <p className="text-xs text-gray-500 mt-1">Qualifies for 3 schemes</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">PM-KISAN</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Van Dhan Yojana</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">MGNREGA</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Verification Status</h3>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600">Uploaded</span>
                      <span className="text-xs font-medium text-blue-600">Verified</span>
                      <span className="text-xs font-medium text-gray-400">Approved</span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div style={{ width: "66%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">2 of 3 steps completed</span>
                      <span className="text-xs font-medium text-blue-600">66%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                  <FiDownload className="mr-2" /> Export as PDF
                </button>
                <button className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium">
                  <FiDownload className="mr-2" /> Export as CSV
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                  <FiMap className="mr-2" /> Export Map Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Pattas Table */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiFileText className="mr-2" /> Recent Patta Records
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patta ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holder Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Village</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land Area</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPattas.map((patta) => (
                <tr key={patta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patta.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patta.holder}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patta.village}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patta.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={patta.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EligibilityBadge eligibility={patta.eligibility} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;