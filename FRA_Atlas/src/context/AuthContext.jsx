import React, { createContext, useState, useContext, useMemo } from 'react';

const AuthContext = createContext(null);

// Separate hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // Ensure role is properly set in userData
    if (!userData.role) {
      console.error('No role specified in user data');
      return;
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const getWorkflowPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/workflow_admin';
      case 'official':
        return '/workflow_off';
      case 'user':
        return '/workflow_user';
      default:
        return '/dashboard';
    }
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
    getWorkflowPath
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exported at the top of the file