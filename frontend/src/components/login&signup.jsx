import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginSignup = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [role, setRole] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    aadhar: '',
    otp: ''
  });
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (role === 'user') {
      if (!formData.name || !formData.aadhar) {
        setError('Please fill all fields');
        return;
      }
      if (formData.aadhar.length !== 12) {
        setError('Aadhar number must be 12 digits');
        return;
      }
      setStep(3);
    } else {
      if (!formData.username || !formData.password) {
        setError('Please fill all fields');
        return;
      }
      // Simulate successful login (frontend only)
      login({
        role,
        name: formData.username,
      });
      onClose();
    }
  };

  const verifyOTP = (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter OTP');
      return;
    }
    // Simulate successful verification (frontend only)
    login({
      role: 'user',
      name: formData.name,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-all duration-300"
      onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-slideIn"
        onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome to FRA Portal</h2>
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center mb-4">Select your role</h3>
              <div className="grid gap-4">
                {['admin', 'officer', 'user'].map((roleType) => (
                  <button
                    key={roleType}
                    onClick={() => handleRoleSelect(roleType)}
                    className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors
                             bg-[#FFECC0] hover:bg-[#FACC15] text-gray-800
                             border-2 border-[#FACC15] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  >
                    Login as {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === 'user' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-[#FACC15] focus:border-[#FACC15]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-[#FACC15] focus:border-[#FACC15]"
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength="12"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-[#FACC15] focus:border-[#FACC15]"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-[#FACC15] focus:border-[#FACC15]"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-sm font-medium
                         bg-[#FACC15] hover:bg-[#FACC15]/90 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                {role === 'user' ? 'Get OTP' : 'Login'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-[#FACC15] focus:border-[#FACC15]"
                  placeholder="Enter OTP"
                  maxLength="6"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-sm font-medium
                         bg-[#FACC15] hover:bg-[#FACC15]/90 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                Verify OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
