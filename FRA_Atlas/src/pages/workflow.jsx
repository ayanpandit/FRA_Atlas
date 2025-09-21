import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import Dashboard from './dashboard';
import PattaManagement from './patta_management';
import BeneficiarySchemes from './beneficiary_schemes';

const Workflow = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'patta_management':
        return <PattaManagement />;
      case 'beneficiary_schemes':
        return <BeneficiarySchemes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg lg:block md:w-64 sm:w-48 xs:w-full xs:absolute xs:z-50 xs:h-full">
        <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden lg:ml-0 md:ml-0 sm:ml-0 xs:ml-0">
        <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Workflow;