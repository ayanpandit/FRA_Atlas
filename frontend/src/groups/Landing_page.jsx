import logo from "../assets/logo.png";
import { Routes, Route, Navigate } from "react-router-dom";
import Hero from "../components/hero";
import About from "../components/about";
import Timelines from "../components/timelines";
import Level from "../components/level";
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
    <Routes>
      <Route path="/dashboard" element={<Navigate to="/workflow_off" />} />
      <Route path="/workflow_admin/*" element={<WorkflowAdmin />} />
      <Route path="/workflow_off/*" element={<WorkflowOff />} />
      <Route path="/workflow_user/*" element={<WorkflowUser />} />
      <Route path="/patta_management" element={<WorkflowAdmin />} />
      <Route path="/fra_documentation" element={<FRADocumentation />} />
      <Route path="/" element={
        <>
          <Navbar />
          <Hero />
          <div style={{ backgroundColor: '#FFECC0' }}>
            <About />
          </div>
          <div style={{ backgroundColor: '#FFECC0' }}>
            <Timelines />
          </div>
          {/* <div style={{ backgroundColor: '#FFECC0' }}>
            <Level />
          </div> */}
          <div style={{ backgroundColor: '#FFECC0' }}>
            <Yojana />
          </div>
          <div style={{ backgroundColor: '#FFECC0' }}>
            <Data_Availability />
          </div>
          <div style={{ backgroundColor: '#FFECC0' }}>
            <Footer />
          </div>
        </>
      } />
    </Routes>
  );
}

export default LandingPage;