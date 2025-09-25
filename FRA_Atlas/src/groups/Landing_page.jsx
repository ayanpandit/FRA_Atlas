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
import PillNav from '../components/PillNav';
import FRADocumentation from '../pages/FRA Documentation';


function LandingPage() {
  const items = [
    {
      label: "DashBoard",
      bgColor: "#FACC15",
      textColor: "#fff",
      links: [
        { label: "suboption1", ariaLabel: "suboption1", url: "https://example.com/dashboard/suboption1" },
        { label: "suboption2", ariaLabel: "suboption2", url: "https://example.com/dashboard/suboption2" }
      ]
    },
    {
      label: "Resources",
      bgColor: "#000000",
      textColor: "#fff",
      links: [
        { label: "Tribal Welfare Programmes", ariaLabel: "suboption1", url: "https://example.com/resources/tribal" },
        { label: "Mo Jungle Jami Yojana", ariaLabel: "suboption2", url: "https://example.com/resources/mojungle" }
      ]
    },
    {
      label: "About Us",
      bgColor: "#FACC15",
      textColor: "#fff",
      links: [
        { label: "Contact Us", ariaLabel: "suboption1", url: "https://example.com/about/contact" },
        { label: "Know More", ariaLabel: "suboption2", url: "https://example.com/about/knowmore" },
        { label: "Our Team", ariaLabel: "suboption3", url: "https://example.com/about/team" }
      ]
    }
  ];

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
          <div style={{ width: '100vw', height: '60px', background: 'rgba(255,255,255,0.1)', position: 'sticky', top: 0, left: 0, zIndex: 101, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(24px)', }}>
            <PillNav
              logo={logo}
              logoAlt="Company Logo"
              items={[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Contact', href: '/contact' }
              ]}
              activeHref="/"
              className="custom-nav"
              ease="power2.easeOut"
              baseColor="transparent"
              pillColor="transparent"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#000000"
            />
          </div>
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