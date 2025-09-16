import CardNav from "./components/navbar";
import Home from "./pages/home";
import logo from "./assets/react.svg";

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
      <Home />
    </>
  );
}

export default App;