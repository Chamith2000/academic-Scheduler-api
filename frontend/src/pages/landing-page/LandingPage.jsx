import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            {/* Navigation */}
            <nav className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
                <div className="relative flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center">
                        <img className="w-10 h-10 mr-2" src="logoAS.svg" alt="logo" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Academic Scheduler
            </span>
                    </Link>
                    <ul className="flex items-center hidden space-x-8 lg:flex">
                        <li>
                            <a href="#features" className="font-medium tracking-wide text-gray-700 dark:text-gray-200 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#about" className="font-medium tracking-wide text-gray-700 dark:text-gray-200 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
                                About
                            </a>
                        </li>
                    </ul>
                    <div className="lg:hidden">
                        <button className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg className="w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M23,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,13,23,13z"></path>
                                <path fill="currentColor" d="M23,6H1C0.4,6,0,5.6,0,5s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,6,23,6z"></path>
                                <path fill="currentColor" d="M23,20H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,20,23,20z"></path>
                            </svg>
                        </button>
                    </div>
                    <ul className="flex items-center hidden space-x-8 lg:flex">
                        <li>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-gray-700 dark:text-white transition duration-200 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:shadow-outline focus:outline-none"
                            >
                                Sign In
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-white transition duration-200 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-md hover:shadow-lg focus:shadow-outline focus:outline-none"
                            >
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
                <div className="flex flex-col items-center justify-between lg:flex-row">
                    <div className="mb-10 lg:max-w-lg lg:pr-5 lg:mb-0">
                        <div className="max-w-xl mb-6">
                            <h1 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl sm:leading-tight">
                                Effortlessly Create <br className="hidden md:block" />
                                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Conflict-Free Timetables
                </span>
                            </h1>
                            <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
                                Academic Scheduler helps universities, colleges, and schools create perfect timetables.
                                Our intelligent system automatically resolves scheduling conflicts, saving you time and frustration.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:flex-row">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center w-full h-12 px-6 mb-3 font-medium tracking-wide text-white transition duration-200 rounded shadow-md md:w-auto md:mr-4 md:mb-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 focus:shadow-outline focus:outline-none"
                            >
                                Get Started Free
                            </Link>
                            <a
                                href="#demo"
                                className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-gray-700 dark:text-white transition duration-200 rounded border border-gray-300 dark:border-gray-600 md:w-auto bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 focus:shadow-outline focus:outline-none"
                            >
                                Watch Demo
                                <svg className="inline-block w-3 ml-2" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M9.707,5.293l-5-5A1,1,0,0,0,3.293,1.707L7.586,6,3.293,10.293a1,1,0,1,0,1.414,1.414l5-5A1,1,0,0,0,9.707,5.293Z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="relative lg:w-1/2">
                        <div className="w-full lg:w-4/5 lg:ml-auto h-56 sm:h-96 rounded-2xl overflow-hidden shadow-xl">
                            <div className="h-full w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 flex border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex space-x-1.5">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-6 gap-2">
                                        <div className="col-span-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                            <div className="h-8 bg-blue-100 dark:bg-blue-900 rounded mb-2"></div>
                                            <div className="space-y-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-5 grid grid-cols-5 gap-2">
                                            {[...Array(5)].map((_, day) => (
                                                <div key={day} className="space-y-2">
                                                    <div className="h-8 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center text-xs font-medium text-purple-800 dark:text-purple-200">
                                                        {["Mon", "Tue", "Wed", "Thu", "Fri"][day]}
                                                    </div>
                                                    {[...Array(10)].map((_, slot) => (
                                                        <div key={slot} className={`h-10 rounded flex items-center justify-center text-xs ${
                                                            Math.random() > 0.75 ?
                                                                'bg-blue-500 text-white' :
                                                                Math.random() > 0.75 ?
                                                                    'bg-purple-500 text-white' :
                                                                    'bg-gray-100 dark:bg-gray-700'
                                                        }`}>
                                                            {Math.random() > 0.5 ? '' : `Class ${(day + slot) % 10 + 1}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section id="features" className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
                <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                    <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            <span className="relative inline-block">
              <svg viewBox="0 0 52 24" fill="currentColor" className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-100 dark:text-blue-900 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block">
                <defs>
                  <pattern id="d52c9842-4d9d-4a70-af7f-190e5452c5d2" x="0" y="0" width=".135" height=".30">
                    <circle cx="1" cy="1" r=".7"></circle>
                  </pattern>
                </defs>
                <rect fill="url(#d52c9842-4d9d-4a70-af7f-190e5452c5d2)" width="52" height="24"></rect>
              </svg>
              <span className="relative">Why</span>
            </span>{' '}
                        Academic Scheduler Is Your Best Choice
                    </h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
                        Our platform combines powerful algorithms with user-friendly interfaces to solve even the most complex scheduling problems.
                    </p>
                </div>
                <div className="grid gap-8 row-gap-10 lg:grid-cols-3">
                    <div className="max-w-md sm:mx-auto sm:text-center transition duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900 sm:mx-auto sm:w-20 sm:h-20">
                            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <h6 className="mb-3 text-xl font-bold leading-5 text-gray-900 dark:text-white">Time-Saving Automation</h6>
                        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Our intelligent algorithms can create conflict-free schedules in minutes, not days. Save up to 95% of your scheduling time.
                        </p>
                    </div>
                    <div className="max-w-md sm:mx-auto sm:text-center transition duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900 sm:mx-auto sm:w-20 sm:h-20">
                            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <h6 className="mb-3 text-xl font-bold leading-5 text-gray-900 dark:text-white">Conflict Resolution</h6>
                        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Automatically detect and resolve scheduling conflicts for rooms, professors, and student groups with our advanced optimization engine.
                        </p>
                    </div>
                    <div className="max-w-md sm:mx-auto sm:text-center transition duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900 sm:mx-auto sm:w-20 sm:h-20">
                            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <h6 className="mb-3 text-xl font-bold leading-5 text-gray-900 dark:text-white">Flexible Planning</h6>
                        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Easily adjust schedules, add constraints, and create multiple planning scenarios to find the optimal solution for your institution.
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                    <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
                        What Our Users Say
                    </h2>
                </div>
                <div className="grid gap-10 lg:grid-cols-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                R
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Dr. Rebecca Chen</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Department Chair, Computer Science</p>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            "Academic Scheduler has revolutionized our department's scheduling process. What used to take weeks now takes just hours, and our faculty are much happier with their teaching schedules."
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                M
                            </div>
                            <div className="ml-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Prof. Michael Johnson</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Registrar, Westlake University</p>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            "We've tried several scheduling solutions, but Academic Scheduler is by far the most intuitive and powerful. The conflict resolution alone has saved us countless hours of manual adjustments."
                        </p>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center justify-between lg:flex-row">
                    <div className="mb-10 lg:max-w-lg lg:pr-5 lg:mb-0">
                        <div className="max-w-xl mb-6">
                            <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl sm:leading-tight">
                                See How It Works
                            </h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
                                Watch our quick demo to see how Academic Scheduler can transform your institution's scheduling process and eliminate conflicts forever.
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <p className="text-gray-700 dark:text-gray-300">Quick and easy setup process</p>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <p className="text-gray-700 dark:text-gray-300">Intuitive drag-and-drop interface</p>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <p className="text-gray-700 dark:text-gray-300">Powerful conflict resolution in action</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative lg:w-1/2">
                        <div className="w-full lg:w-4/5 lg:ml-auto h-56 sm:h-96 rounded-2xl overflow-hidden shadow-xl">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/VIDEO_ID"
                                title="Academic Scheduler Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
                <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                    <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className="max-w-screen-lg sm:mx-auto">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                How long does it take to set up Academic Scheduler?
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Most institutions can be up and running within a few days. Our onboarding team will help you import your existing data, set up your constraints, and train your staff to use the system effectively.
                            </p>
                        </div>
                        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                Can I import data from our existing systems?
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Yes! Academic Scheduler supports imports from most common academic management systems, Excel files, and CSV formats. Our team can also build custom integrations for your specific needs.
                            </p>
                        </div>
                        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                What types of constraints can the system handle?
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Our system can handle virtually any scheduling constraint, including room capacity, equipment needs, faculty preferences, back-to-back class restrictions, and student group conflicts.
                            </p>
                        </div>
                        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <div className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                Is there a limit to how many schedules we can create?
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                No, you can create as many schedule drafts and scenarios as you need. This makes it easy to compare different approaches and find the optimal solution for your institution.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-xl sm:mx-auto lg:max-w-2xl">
                    <div className="flex flex-col mb-16 sm:text-center sm:mb-0">
                        <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md g:mb-12">
                            <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl md:mx-auto">
                                Ready to Transform Your Scheduling Process?
                            </h2>
                            <p className="text-base text-white md:text-lg">
                                Join hundreds of educational institutions that trust Academic Scheduler to create perfect timetables.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center h-12 px-6 font-semibold tracking-wide text-blue-700 transition duration-200 rounded shadow-md md:w-auto bg-white hover:bg-gray-100 hover:scale-105 focus:shadow-outline focus:outline-none"
                            >
                                Click Here to Get Started
                            </Link>
                            <p className="max-w-xs mt-4 text-sm text-white">

                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
                <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2">
                        <Link to="/" className="inline-flex items-center">
                            <img className="w-10 h-10 mr-2" src="logoAS.svg" alt="logo" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Academic Scheduler
              </span>
                        </Link>
                        <div className="mt-6 lg:max-w-sm">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Creating perfect timetables for educational institutions worldwide. Our advanced algorithms solve complex scheduling problems in minutes, not days.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-base font-bold tracking-wide text-gray-900 dark:text-white">
                            Contacts
                        </p>
                        <div className="flex">
                            <p className="mr-1 text-gray-700 dark:text-gray-300">Email:</p>
                            <a
                                href="mailto:info@academicscheduler.com"
                                className="text-blue-600 dark:text-blue-400 transition-colors duration-300 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                info@academicscheduler.com
                            </a>
                        </div>
                        <div className="flex">
                            <p className="mr-1 text-gray-700 dark:text-gray-300">Phone:</p>
                            <a
                                href="tel:+94555555555"
                                className="text-blue-600 dark:text-blue-400 transition-colors duration-300 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                +94 (55) 555-5555
                            </a>
                        </div>
                    </div>
                    <div>
                        <p className="text-base font-bold tracking-wide text-gray-900 dark:text-white">
                            Links
                        </p>
                        <ul className="mt-2 space-y-2">
                            <li>
                                <a
                                    href="#features"
                                    className="text-gray-700 dark:text-gray-300 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    className="text-gray-700 dark:text-gray-300 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-gray-700 dark:text-gray-300 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t border-gray-300 dark:border-gray-700 lg:flex-row">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        © 2025 Academic Scheduler. All rights reserved.
                    </p>
                    <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
                        <li>
                            <a
                                href="/"
                                className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a
                                href="/"
                                className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Terms of Service
                            </a>
                        </li>
                    </ul>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;