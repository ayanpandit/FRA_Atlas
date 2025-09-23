import logo from "../assets/react.svg";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CardNav from "../components/navbar";
import Hero from "../components/hero";
import About from "../components/about";
import Timelines from "../components/timelines"; 
import Level from "../components/level";
import Yojana from "../components/yojana";
import Data_Availability from "../components/data availability";
import Footer from "../components/footer";
import Workflow from "./workflow";
function LandingPage() {
  const items = [
    {
      label: "option1",
      bgColor: "#FACC15",
      textColor: "#fff",
      links: [
        { label: "suboption1", ariaLabel: "suboption1" },
        { label: "suboption2", ariaLabel: "suboption2" }
      ]
    },
    {
      label: "option2", 
      bgColor: "#000000",
      textColor: "#fff",
      links: [
        { label: "suboption1", ariaLabel: "suboption1" },
        { label: "suboption2", ariaLabel: "suboption2" }
      ]
    },
    {
      label: "option3",
      bgColor: "#FACC15", 
      textColor: "#fff",
      links: [
        { label: "suboption1", ariaLabel: "suboption1" },
        { label: "suboption2", ariaLabel: "suboption2" },
        { label: "suboption3", ariaLabel: "suboption3" }
      ]
    }
  ];

  return (
      <Routes>
        <Route path="/patta_management" element={<Workflow />} />
        <Route path="/workflow" element={<Workflow />} />
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
        <Route path="/workflow" element={<Workflow />} />
      </Routes>
  );
}

export default LandingPage;