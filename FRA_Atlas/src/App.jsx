import CardNav from "./components/navbar";
import Hero from "./pages/hero";
import About from "./pages/about";
import States from "./pages/states";
import logo from "./assets/react.svg";
import Data_Availability from "./pages/data availability";
import Timelines from "./pages/timelines"; 
import Yojana from "./pages/yojana";
import Footer from "./pages/footer";
import Level from "./pages/level";

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
    <>
      <CardNav
        logo={logo}
        logoAlt="Company Logo"
        items={items}
        baseColor="#ffffff" //  navbar ka background color
        menuColor="#000000" // two lines color
        buttonBgColor="#FACC15"//get started button color
        buttonTextColor="#000000"// get started button text color
        ease="power3.out"
      />
      <Hero />
  <div style={{ backgroundColor: '#FFECC0' }}>
        <About />
      </div>
      <div style={{ backgroundColor: '#FFECC0' }}>
        <States />
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
  );
}

export default App;