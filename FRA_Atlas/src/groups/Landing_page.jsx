import logo from "../assets/react.svg";
import { Routes, Route, Navigate } from "react-router-dom";
import CardNav from "../components/navbar";
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

function LandingPage() {
  const items = [
    {
      label: "DashBoard",
      bgColor: "#FACC15",
      textColor: "#fff",
      links: [
        { label: "suboption1",  ariaLabel: "suboption1" },
        { label: "suboption2", ariaLabel: "suboption2" }
      ]
    },
    {
      label: "Resources", 
      bgColor: "#000000",
      textColor: "#fff",
      links: [
        { label: "Tribal Welfare Programmes", ariaLabel: "suboption1" },
        { label: "Mo Jungle Jami Yojana", ariaLabel: "suboption2" }
      ]
    },
    {
      label: "About Us",
      bgColor: "#FACC15", 
      textColor: "#fff",
      links: [
        { label: "Contact Us", ariaLabel: "suboption1" },
        { label: "Know More", ariaLabel: "suboption2" },
        { label: "Our Team", ariaLabel: "suboption3" }
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
        <Route path="/" element={
          <>
            <CardNav
              logo={logo}
              logoAlt="Company Logo"
              items={items}
              baseColor="#ffffff"
              menuColor="#000000"
              buttonBgColor="#FACC15"
              buttonTextColor="#000000"
              ease="power3.out"
            />
            <Hero />
            <div style={{ backgroundColor: '#FFECC0' }}>
              <About />
            </div>
            <div style={{ backgroundColor: '#FFECC0' }}>
              <Timelines />
            </div>
            <div style={{ backgroundColor: '#FFECC0' }}>
              <Level />
            </div>
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