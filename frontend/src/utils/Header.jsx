import React, { useState } from "react";
import { Menu, X, Plus } from "lucide-react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* App Logo and Title */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">Scholar</h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <a href="#dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</a>
                    <a href="#calendar" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Calendar</a>
                    <a href="#courses" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Courses</a>
                    <a href="#assignments" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Assignments</a>
                    <a href="#resources" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Resources</a>
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>New Task</span>
                    </button>
                </nav>

                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3">
                    <span className="text-gray-600 font-medium">Alex Johnson</span>
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                        AJ
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-600"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
                    <nav className="flex flex-col space-y-4">
                        <a href="#dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">Dashboard</a>
                        <a href="#calendar" className="text-gray-700 hover:text-indigo-600 font-medium">Calendar</a>
                        <a href="#courses" className="text-gray-700 hover:text-indigo-600 font-medium">Courses</a>
                        <a href="#assignments" className="text-gray-700 hover:text-indigo-600 font-medium">Assignments</a>
                        <a href="#resources" className="text-gray-700 hover:text-indigo-600 font-medium">Resources</a>
                        <button className="bg-indigo-500 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>New Task</span>
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;