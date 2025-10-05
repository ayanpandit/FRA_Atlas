import logo from "../assets/logo.png";
import { Routes, Route, Navigate } from "react-router-dom";
import Hero from "../components/hero";
import About from "../components/about";
import Timelines from "../components/timelines";
//import Level from "../components/level";
import Yojana from "../components/yojana";
import Data_Availability from "../components/data availability";
import Footer from "../components/footer";
import WorkflowAdmin from "./workflow_admin";
import WorkflowOff from "./workflow_off";
import WorkflowUser from "./workflow_user";
import Navbar from '../components/Navbar';
import FRADocumentation from '../pages/FRA Documentation';

function LandingPage() {
  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@728&display=swap');
        .alan-sans {
          font-family: "Alan Sans", sans-serif;
          font-optical-sizing: auto;
          font-weight: 728;
          font-style: normal;
        }`}
      </style>
      <Routes>
        <Route path="/dashboard" element={<Navigate to="/workflow_off" />} />
        <Route path="/workflow_admin/*" element={<WorkflowAdmin />} />
        <Route path="/workflow_off/*" element={<WorkflowOff />} />
        <Route path="/workflow_user/*" element={<WorkflowUser />} />
        <Route path="/patta_management" element={<WorkflowAdmin />} />
        <Route path="/fra_documentation" element={<FRADocumentation />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 alan-sans">
            <Navbar />
            <Hero />
            <div className="bg-gradient-to-b from-gray-50 to-white" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <About />
            </div>
            <div className="bg-gradient-to-b from-white to-gray-50" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <Timelines />
            </div>
            {/* <div className="bg-gray-50">
              <Level />
            </div> */}
            <div className="bg-gradient-to-b from-gray-50 to-white" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <Yojana />
            </div>
            <div className="bg-gradient-to-b from-white to-gray-100" style={{boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'}}>
              <Data_Availability />
            </div>
            <div className="bg-gradient-to-b from-gray-100 to-gray-200" style={{boxShadow: 'inset 0 4px 6px -1px rgba(0,0,0,0.1)'}}>
              <Footer />
            </div>
          </div>
        } />
      </Routes>
    </>
  );
}

export default LandingPage;