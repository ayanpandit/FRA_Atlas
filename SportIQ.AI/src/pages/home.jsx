import LightRays from '../components/light_background.jsx';

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
        <h1 className="text-6xl font-bold mb-4">SportIQ.AI</h1>
        <p className="text-xl text-center max-w-2xl">
          Experience the future of sports analytics with AI-powered insights
        </p>
      </div>
    </div>
  );
};

export default Home;
