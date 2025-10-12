import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import loader component from same directory
import Loader from './loader';
import { Menu, X, Home, User, Phone, Briefcase, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
    // Working states for mobile functionality
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showExploreDropdown, setShowExploreDropdown] = useState(false);

    // Loader and navigation states for Explore Now dropdown
    // showLoader: Controls visibility of the 3-second loader
    // selectedPortal: Stores which portal user selected (for navigation after loader)
    const [showLoader, setShowLoader] = useState(false);
    const [selectedPortal, setSelectedPortal] = useState(null);
    const navigate = useNavigate();

    // Handler for portal selection from Explore Now dropdown
    // Shows loader for 3 seconds, then navigates to the correct workflow
    const handleExplorePortal = (portalType) => {
        let route = '';
        // Map portal type to corresponding route/component
        // User Portal -> workflow_user.jsx in ../groups
        // Gram Panchayat Portal -> workflow_off.jsx in ../groups
        // Admin Portal -> Admin-workflow_admin.jsx in ../groups
        switch(portalType) {
            case 'user':
                route = '/workflow_user';
                break;
            case 'gp':
                route = '/workflow_off';
                break;
            case 'admin':
                route = '/workflow_admin';
                break;
            default:
                route = '/';
        }
        setSelectedPortal(route);
        setShowLoader(true);
        setShowExploreDropdown(false);
        // Navigate after 3 second delay
        setTimeout(() => {
            setShowLoader(false);
            navigate(route);
        }, 3000);
    };
    
    // Static states for UI demonstration
    const isScrolled = false;
    const visible = true;
    const currentUser = null; // Change to mock user object if needed to test user dropdown
    const isAnalyzerPage = false;

    const navItems = [
        { name: 'Home', icon: Home },
        { 
            name: 'Services', 
            icon: Briefcase, 
            isDropdown: true,
            subItems: [
                { name: 'FRA ATLAS', route: '/Services_fra_atlas' },
                { name: 'Village Directory', route: '/VillageDirectory' },
                { name: 'CodeForces' }
            ]
        },
        { name: 'About', icon: User },
        { name: 'Contact', icon: Phone }
    ];

    return (
        <>
            {/* Show loader overlay when loading */}
            {showLoader && <Loader />}
            <nav className={
                isAnalyzerPage
                    ? "relative rounded-xl sm:rounded-2xl backdrop-blur-lg border border-white/20 sm:border-2 sm:border-white/30 mt-3 mb-0 sm:mt-4 md:mt-6 lg:mt-8 mx-3 sm:mx-4 md:mx-6 lg:mx-12"
                    : `fixed top-3 sm:top-4 md:top-6 lg:top-9 left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 lg:left-12 lg:right-12 z-40 transition-all duration-500 rounded-xl sm:rounded-2xl ${
                        !visible
                            ? 'opacity-0 translate-y-[-100%] pointer-events-none'
                            : isScrolled
                                ? 'bg-black/20 backdrop-blur-lg border border-white/20 sm:border-2 sm:border-white/30 opacity-100 translate-y-0'
                                : 'bg-black/20 backdrop-blur-lg border border-white/20 sm:border-2 sm:border-white/30 opacity-100 translate-y-0'
                    }`
            } style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 10px 20px -8px rgba(0,0,0,0.3)' : 'inset 0 1px 0 0 rgba(255,255,255,0.15), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 20px 40px -12px rgba(0,0,0,0.4), 0 4px 6px -1px rgba(0,0,0,0.3)'}}>
                <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className={`flex items-center justify-between ${isAnalyzerPage ? 'h-14 sm:h-16 md:h-20' : 'h-14 sm:h-16 md:h-20'}`}>
                        {/* Logo */}
                        <div className="flex-shrink-0 cursor-pointer">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                <span className="text-yellow-400">
                                    Van
                                </span>
                                <span className="text-white">Mitra</span>
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-6 lg:space-x-8">
                            {navItems.map((item) => (
                                <div key={item.name} className="dropdown-container relative">
                                    <button 
                                        onClick={() => item.isDropdown ? setOpenDropdown(openDropdown === item.name ? '' : item.name) : null}
                                        className="text-white hover:text-purple-400 transition-colors duration-200 flex items-center space-x-1 group">
                                        <item.icon className="w-4 h-4 transform hover:scale-110 transition-transform duration-200" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4)) brightness(1.1)'}} />
                                        <span className="text-sm lg:text-base">{item.name}</span>
                                        {item.isDropdown && (
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button - Desktop */}
                        <div className="hidden md:block">
                            {currentUser ? (
                                <div className="relative dropdown-container">
                                    <button 
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors duration-200">
                                        <span className="text-sm lg:text-base">Hi, User</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative dropdown-container">
                                    <button 
                                        onClick={() => setShowExploreDropdown(!showExploreDropdown)}
                                        className="px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold rounded-full hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-sm lg:text-base" style={{boxShadow: window.innerWidth < 640 ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 8px rgba(250, 204, 21, 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(250, 204, 21, 0.4), 0 2px 4px rgba(0,0,0,0.2)'}}>
                                        <span>Explore Now</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExploreDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                {isMenuOpen ? (
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : (
                                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden transition-all duration-500 overflow-hidden ${
                    isMenuOpen 
                        ? 'max-h-[500px] opacity-100' 
                        : 'max-h-0 opacity-0'
                }`}>
                    <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 rounded-b-2xl">
                        <div className="px-3 sm:px-4 py-4 space-y-2">
                            {navItems.map((item, index) => (
                                <div key={item.name}>
                                    {item.isDropdown ? (
                                        <>
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === item.name ? '' : item.name)}
                                                className="group flex items-center w-full px-3 sm:px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                                                style={{
                                                    animationDelay: `${index * 100}ms`,
                                                    animation: isMenuOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                                                }}
                                            >
                                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                                <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left text-sm sm:text-base">
                                                    {item.name}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {/* Mobile Services Dropdown */}
                                            <div className={`pl-8 sm:pl-12 mt-2 space-y-1 sm:space-y-2 transition-all duration-300 ${openDropdown === item.name ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                {item.subItems.map((subItem) => (
                                                    <button
                                                        key={subItem.name}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg text-left text-white hover:bg-white/10 transition-colors duration-200 text-sm sm:text-base"
                                                    >
                                                        {subItem.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            className="group flex items-center w-full px-3 sm:px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                                animation: isMenuOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left text-sm sm:text-base">
                                                {item.name}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 border-t border-white/10">
                                {currentUser ? (
                                    <div className="space-y-2">
                                        <button className="group flex items-center w-full px-3 sm:px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left text-sm sm:text-base">
                                                Profile (Hi, User)
                                            </span>
                                        </button>
                                        <button className="group flex items-center w-full px-3 sm:px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left text-sm sm:text-base">
                                                Logout
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => setShowExploreDropdown(!showExploreDropdown)}
                                            className="w-full px-3 sm:px-4 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-all duration-300 flex items-center justify-between text-sm sm:text-base">
                                            <span>Explore Now</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExploreDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        {/* Mobile Explore Dropdown */}
                                        <div className={`transition-all duration-300 ${showExploreDropdown ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <div className="mt-2 space-y-1 pl-2 sm:pl-4">
                                                <button 
                                                    className="w-full px-3 sm:px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 group rounded-xl"
                                                    onClick={() => { setIsMenuOpen(false); setShowExploreDropdown(false); handleExplorePortal('user'); }}
                                                >
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
                                                    <div className="text-left min-w-0">
                                                        <div className="font-medium text-sm sm:text-base">Explore User Side</div>
                                                        <div className="text-xs sm:text-sm text-white/70">Citizen portal access</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    className="w-full px-3 sm:px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 group rounded-xl"
                                                    onClick={() => { setIsMenuOpen(false); setShowExploreDropdown(false); handleExplorePortal('gp'); }}
                                                >
                                                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
                                                    <div className="text-left min-w-0">
                                                        <div className="font-medium text-sm sm:text-base">Explore Gramsabha Side</div>
                                                        <div className="text-xs sm:text-sm text-white/70">Local governance portal</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    className="w-full px-3 sm:px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 group rounded-xl"
                                                    onClick={() => { setIsMenuOpen(false); setShowExploreDropdown(false); handleExplorePortal('admin'); }}
                                                >
                                                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
                                                    <div className="text-left min-w-0">
                                                        <div className="font-medium text-sm sm:text-base">Explore Administrator Side</div>
                                                        <div className="text-xs sm:text-sm text-white/70">Admin management portal</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animation styles */}
                <style jsx>{`
                    @keyframes slideInFromRight {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                `}</style>
            </nav>

            {/* Desktop Dropdowns - Positioned BELOW navbar */}
            {/* Services Desktop Dropdown */}
            {openDropdown === 'Services' && (
                <div className="hidden md:block fixed left-0 right-0 z-30 mt-2" style={{ top: isAnalyzerPage ? '120px' : '110px' }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center">
                            <div className="py-2 w-48 bg-black/20 backdrop-blur-lg rounded-xl border-2 border-white/30" style={{boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.35), 0 4px 6px rgba(0,0,0,0.25)'}}>
                                {navItems.find(item => item.name === 'Services')?.subItems.map((subItem) => (
                                    <button
                                        key={subItem.name}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2 text-sm lg:text-base"
                                        onClick={() => {
                                            if (subItem.route) {
                                                navigate(subItem.route);
                                                setOpenDropdown('');
                                            }
                                        }}
                                    >
                                        <span>{subItem.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Explore Now Desktop Dropdown */}
            {showExploreDropdown && !currentUser && (
                <div className="hidden md:block fixed left-0 right-0 z-30 mt-2" style={{ top: isAnalyzerPage ? '120px' : '110px' }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-end">
                            <div className="py-2 w-48 sm:w-52 md:w-56 lg:w-64 bg-black/20 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/20 sm:border-2 sm:border-white/30" style={{boxShadow: window.innerWidth < 768 ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.35), 0 4px 6px rgba(0,0,0,0.25)'}}>
                                {/* User Portal Option */}
                                <button className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-2 sm:space-x-3 group"
                                    onClick={() => handleExplorePortal('user')}
                                >
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors transform group-hover:scale-110 duration-200" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4)) brightness(1.2)'}} />
                                    <div className="text-left">
                                        <div className="font-medium text-sm lg:text-base">User Portal</div>
                                        <div className="text-xs text-white/70">Citizen portal access</div>
                                    </div>
                                </button>
                                {/* Gram Panchayat Portal Option */}
                                <button className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 group"
                                    onClick={() => handleExplorePortal('gp')}
                                >
                                    <Home className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors transform group-hover:scale-110 duration-200" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4)) brightness(1.2)'}} />
                                    <div className="text-left">
                                        <div className="font-medium text-sm lg:text-base">Gram Panchayat Portal</div>
                                        <div className="text-xs text-white/70">Local governance portal</div>
                                    </div>
                                </button>
                                {/* Admin Portal Option */}
                                <button className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 group"
                                    onClick={() => handleExplorePortal('admin')}
                                >
                                    <Briefcase className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors transform group-hover:scale-110 duration-200" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4)) brightness(1.2)'}} />
                                    <div className="text-left">
                                        <div className="font-medium text-sm lg:text-base">Admin Portal</div>
                                        <div className="text-xs text-white/70">Admin management portal</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Dropdown - if currentUser exists */}
            {showUserDropdown && currentUser && (
                <div className="hidden md:block fixed left-0 right-0 z-30 mt-2" style={{ top: isAnalyzerPage ? '120px' : '110px' }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-end">
                            <div className="py-2 w-48 bg-black/20 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm lg:text-base">Profile</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2">
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm lg:text-base">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;