import LightRays from '../components/light_background.jsx';
import heroImage from '../assets/hero.png';
import CardNav from '../components/navbar.jsx';
import logo from '../assets/hero.png';
import HeroLetterType from '../functions/hero_letter_type.js';
import LaserFlow from '../components/lava_falling.jsx';
import ScrollTextAnimation from '../functions/scroll_text_animation.jsx';
import PixelCard from '../components/features_card.jsx';
import FeatureCardContent from '../components/FeatureCardContent.jsx';
import feature1Img from '../assets/feature1.jpg';
import feature2Img from '../assets/feature2.jpg';
import feature3Img from '../assets/feature3.jpg';
import feature4Img from '../assets/feature4.jpg';
import feature5Img from '../assets/feature5.jpg';
import feature6Img from '../assets/feature6.jpg';

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
        <HeroLetterType
          text={["SportIQ.AI"]}
          as="h1"
          className="text-6xl font-bold mb-4"
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="_"
        />
        <p className="text-xl text-center max-w-2xl">
          Experience the future of sports analytics with AI-powered insights
        </p>
      </div>

      {/* ========== FEATURES SECTION START ========== */}
      <section className="relative bg-black py-20 px-4 md:py-32">
        <div className="max-w-7xl mx-auto">
          {/* ======= SCROLL TEXT ANIMATION START (Powerful Features) ======= */}
          <div className="text-center mb-16 md:mb-24">
            <ScrollTextAnimation
              text="Powerful Features"
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            />
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced AI-powered tools designed to revolutionize sports analytics and performance optimization
            </p>
          </div>
          {/* ======= SCROLL TEXT ANIMATION END (Powerful Features) ======= */}

          {/* Features Grid - PixelCard version */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* ======= PIXEL CARD FEATURE 1 START ======= */}
            <PixelCard variant="pink">
              <FeatureCardContent
                image={feature1Img}
                title="Real-Time Analytics"
                description="Get instant insights into player performance, team dynamics, and game strategies with our advanced real-time processing engine."
                icon={
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 1 END ======= */}

            {/* ======= PIXEL CARD FEATURE 2 START ======= */}
            <PixelCard variant="blue">
              <FeatureCardContent
                image={feature2Img}
                title="AI Predictions"
                description="Leverage machine learning algorithms to predict game outcomes, player injuries, and optimal team formations with high accuracy."
                icon={
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 2 END ======= */}

            {/* ======= PIXEL CARD FEATURE 3 START ======= */}
            <PixelCard variant="yellow">
              <FeatureCardContent
                image={feature3Img}
                title="Performance Tracking"
                description="Monitor individual and team performance metrics across multiple dimensions with comprehensive visualization tools."
                icon={
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 3 END ======= */}

            {/* ======= PIXEL CARD FEATURE 4 START ======= */}
            <PixelCard variant="pink">
              <FeatureCardContent
                image={feature4Img}
                title="Team Collaboration"
                description="Enable seamless collaboration between coaches, analysts, and players with integrated communication and reporting tools."
                icon={
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 4 END ======= */}

            {/* ======= PIXEL CARD FEATURE 5 START ======= */}
            <PixelCard variant="yellow">
              <FeatureCardContent
                image={feature5Img}
                title="Data Security"
                description="Enterprise-grade security with end-to-end encryption, ensuring your sensitive sports data remains protected at all times."
                icon={
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 5 END ======= */}

            {/* ======= PIXEL CARD FEATURE 6 START ======= */}
            <PixelCard variant="blue">
              <FeatureCardContent
                image={feature6Img}
                title="Advanced Reporting"
                description="Generate comprehensive reports with customizable dashboards, detailed analytics, and exportable insights for stakeholders."
                icon={
                  <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </PixelCard>
            {/* ======= PIXEL CARD FEATURE 6 END ======= */}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 md:mt-24">
            <button className="bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-200 transition-all duration-300 hover:transform hover:scale-105 shadow-lg">
              Explore All Features
            </button>
          </div>
        </div>
      </section>
      {/* ========== FEATURES SECTION END ========== */}

    </div>
  );
};

export default Home;
