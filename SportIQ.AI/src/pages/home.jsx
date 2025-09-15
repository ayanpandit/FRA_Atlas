import LightRays from '../components/light_background.jsx';
import heroImage from '../assets/hero.png';
import CardNav from '../components/navbar.jsx';
import logo from '../assets/hero.png';

const Home = () => {
  return (
    <div className="min-h-screen relative bg-black">
      {/* Light Rays Background */}
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ff8080"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="hero-background"
        />
      </div>
      
      {/* Content over the background */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
        {/* CardNav centered and slightly down */}
        <div className="flex justify-center w-full" style={{ marginTop: '4.5rem' }}>
          <CardNav
            logo={logo}
            logoAlt="Company Logo"
            items={[
              {
                label: "About",
                bgColor: "#0D0716",
                textColor: "#fff",
                links: [
                  { label: "Company", ariaLabel: "About Company" },
                  { label: "Careers", ariaLabel: "About Careers" }
                ]
              },
              {
                label: "Projects", 
                bgColor: "#170D27",
                textColor: "#fff",
                links: [
                  { label: "Featured", ariaLabel: "Featured Projects" },
                  { label: "Case Studies", ariaLabel: "Project Case Studies" }
                ]
              },
              {
                label: "Contact",
                bgColor: "#271E37", 
                textColor: "#fff",
                links: [
                  { label: "Email", ariaLabel: "Email us" },
                  { label: "Twitter", ariaLabel: "Twitter" },
                  { label: "LinkedIn", ariaLabel: "LinkedIn" }
                ]
              }
            ]}
            baseColor="#fff"
            menuColor="#000"
            buttonBgColor="#111"
            buttonTextColor="#fff"
            ease="power3.out"
          />
        </div>
        {/* Hero Image */}
        <div className="mb-8">
          <img 
            src={heroImage} 
            alt="SportIQ.AI Hero" 
            className="max-w-[80px] md:max-w-[120px] lg:max-w-[160px] xl:max-w-[200px] h-auto object-contain mt-6"
          />
        </div>
        <h1 className="text-6xl font-bold mb-4">SportIQ.AI</h1>
        <p className="text-xl text-center max-w-2xl">
          Experience the future of sports analytics with AI-powered insights
        </p>
      </div>
    </div>
  );
};

export default Home;
