import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CardNav from "./components/navbar";
import Hero from "./pages/hero";
import About from "./pages/about";
import logo from "./assets/react.svg";
import Data_Availability from "./pages/data availability";
import Timelines from "./pages/timelines"; 
import Yojana from "./pages/yojana";
import Footer from "./pages/footer";
import Level from "./pages/level";
import Workflow from "./pages/workflow";

function App() {
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
    <Router>
      <Routes>
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
    </Router>
  );
}

export default App;