import React, { useState } from "react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-blue-700 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* App Logo and Title */}
                <div className="flex items-center space-x-2">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <h1 className="text-xl font-bold">Academic Scheduler</h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <a href="#dashboard" className="hover:text-blue-200 font-medium">Dashboard</a>
                    <a href="#calendar" className="hover:text-blue-200 font-medium">Calendar</a>
                    <a href="#courses" className="hover:text-blue-200 font-medium">Courses</a>
                    <a href="#assignments" className="hover:text-blue-200 font-medium">Assignments</a>
                    <a href="#resources" className="hover:text-blue-200 font-medium">Resources</a>
                    <button className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium shadow hover:bg-blue-100 transition-colors">
                        Add Task
                    </button>
                </nav>

                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3">
                    <span className="font-medium">Hi, Student</span>
                    <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        S
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-blue-800 px-4 py-2">
                    <nav className="flex flex-col space-y-3 pb-3">
                        <a href="#dashboard" className="hover:text-blue-200 font-medium">Dashboard</a>
                        <a href="#calendar" className="hover:text-blue-200 font-medium">Calendar</a>
                        <a href="#courses" className="hover:text-blue-200 font-medium">Courses</a>
                        <a href="#assignments" className="hover:text-blue-200 font-medium">Assignments</a>
                        <a href="#resources" className="hover:text-blue-200 font-medium">Resources</a>
                        <button className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium shadow hover:bg-blue-100 transition-colors">
                            Add Task
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;