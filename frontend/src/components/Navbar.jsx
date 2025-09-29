import { useState } from 'react';
import { Menu, X, Home, User, Phone, Briefcase, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
    // Working states for mobile functionality
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    
    // Static states for UI demonstration
    const isScrolled = false;
    const visible = true;
    const currentUser = null; // Change to mock user object if needed
    const isAnalyzerPage = false;

    const navItems = [
        { name: 'Home', icon: Home },
        { 
            name: 'Services', 
            icon: Briefcase, 
            isDropdown: true,
            subItems: [
                { name: 'CodeChef' },
                { name: 'LeetCode' },
                { name: 'CodeForces' }
            ]
        },
        { name: 'About', icon: User },
        { name: 'Contact', icon: Phone }
    ];

    return (
        <>
            <nav className={
                isAnalyzerPage
                    ? "relative rounded-2xl backdrop-blur-lg shadow-2xl border border-white/20 mt-4 mb-0 md:mt-6 md:mb-0 lg:mt-8 lg:mb-0 mx-12"
                    : `fixed top-9 left-12 right-12 z-50 transition-all duration-500 rounded-2xl ${
                        !visible
                            ? 'opacity-0 translate-y-[-100%] pointer-events-none'
                            : isScrolled
                                ? 'bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 opacity-100 translate-y-0'
                                : 'bg-black/20 backdrop-blur-lg shadow-2xl border border-white/20 opacity-100 translate-y-0'
                    }`
            }>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex items-center justify-between ${isAnalyzerPage ? 'h-16 md:h-20' : 'h-16 md:h-20'}`}>
                        {/* Logo */}
                        <div className="flex-shrink-0 cursor-pointer">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                <span className="text-yellow-400">
                                    FRA
                                </span>
                                <span className="text-white"> Atlas</span>
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-8">
                            {navItems.map((item) => (
                                <div key={item.name} className="dropdown-container relative">
                                    <button 
                                        onClick={() => setOpenDropdown(openDropdown === item.name ? '' : item.name)}
                                        className="text-white hover:text-purple-400 transition-colors duration-200 flex items-center space-x-1 group">
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                        {item.isDropdown && (
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                    
                                    {/* Desktop Dropdown Menu */}
                                    {item.isDropdown && openDropdown === item.name && (
                                        <div className="absolute top-full left-0 mt-2 py-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50">
                                            {item.subItems.map((subItem) => (
                                                <button
                                                    key={subItem.name}
                                                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2"
                                                >
                                                    <span>{subItem.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
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
                                        <span>Hi, User</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showUserDropdown && (
                                        <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 z-50">
                                            <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>Profile</span>
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2">
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-lg">
                                  Explore Now
                                </button>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                {isMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden transition-all duration-500 overflow-hidden ${
                    isMenuOpen 
                        ? 'max-h-[400px] opacity-100' 
                        : 'max-h-0 opacity-0'
                }`}>
                    <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 rounded-b-2xl">
                        <div className="px-4 py-4 space-y-2">
                            {navItems.map((item, index) => (
                                <div key={item.name}>
                                    {item.isDropdown ? (
                                        <>
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === item.name ? '' : item.name)}
                                                className="group flex items-center w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                                                style={{
                                                    animationDelay: `${index * 100}ms`,
                                                    animation: isMenuOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                                                }}
                                            >
                                                <item.icon className="w-5 h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                                <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left">
                                                    {item.name}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {/* Mobile Dropdown Menu */}
                                            <div className={`pl-12 mt-2 space-y-2 transition-all duration-300 ${openDropdown === item.name ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                {item.subItems.map((subItem) => (
                                                    <button
                                                        key={subItem.name}
                                                        className="w-full px-4 py-2 rounded-lg text-left text-white hover:bg-white/10 transition-colors duration-200"
                                                    >
                                                        {subItem.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            className="group flex items-center w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                                animation: isMenuOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <item.icon className="w-5 h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left">
                                                {item.name}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 border-t border-white/10">
                                {currentUser ? (
                                    <div className="space-y-2">
                                        <button className="group flex items-center w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                            <User className="w-5 h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left">
                                                Profile (Hi, User)
                                            </span>
                                        </button>
                                        <button className="group flex items-center w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
                                            <LogOut className="w-5 h-5 mr-3 group-hover:text-purple-400 transition-colors" />
                                            <span className="font-medium group-hover:text-purple-400 transition-colors flex-1 text-left">
                                                Logout
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                            <button className="w-full px-4 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-all duration-300">
                                                Explore Now
                                    </button>
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
        </>
    );
};

export default Navbar;