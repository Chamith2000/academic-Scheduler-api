import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";

import axios from "axios";
const LOGIN_URL = "http://localhost:8080/api/auth/authenticate";

export default function Login() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState("");
    const [pwd, setPwd] = useState("");
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        userRef.current.focus();
    }, []);
    useEffect(() => {
        setErrMsg("");
    }, [user, pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                LOGIN_URL,
                JSON.stringify({ username: user, password: pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            const accessToken = res?.data?.token;
            const decodedToken = window.atob(accessToken.split(".")[1]);

            const role = JSON.parse(decodedToken).role;

            const authUser = { user, pwd, role, accessToken }; // define user object

            setAuth(authUser); // update state
            localStorage.setItem("user", JSON.stringify(authUser)); // update localStorage

            setUser("");
            setPwd("");

            if (role === "INSTRUCTOR") {
                navigate("/dashboard");
            } else if (role === "STUDENT") {
                navigate("/dashboard"); // New condition for student
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            if (!err?.res) {
                setErrMsg("No server response");
            } else if (err.res?.status === 400) {
                setErrMsg("Missing UserName or Password");
            } else if (err.res?.status === 401) {
                setErrMsg("Unauthorized");
            } else {
                setErrMsg("Login failed");
            }
            errRef.current.focus();
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-0">
                    <Link to="/landingpage" className="inline-flex items-center">
                        <img className="w-12 h-12 mr-2" src="logoAS.svg" alt="logo" />
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Academic Scheduler
            </span>
                    </Link>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Your conflict free timetabling solution
                    </p>
                </div>

                {/* Error Message */}
                <div className="mb-4">
                    <p
                        ref={errRef}
                        className={`rounded-md p-3 text-sm font-medium text-center ${
                            errMsg
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "offscreen"
                        }`}
                        aria-live="assertive"
                    >
                        {errMsg}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                            Welcome Back
                        </h1>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        ref={userRef}
                                        name="username"
                                        id="username"
                                        className="pl-10 w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-200"
                                        placeholder="     Enter your username"
                                        value={user}
                                        onChange={(e) => setUser(e.target.value)}
                                        required=""
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <input
                                        value={pwd}
                                        onChange={(e) => setPwd(e.target.value)}
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="pl-10 w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all duration-200"
                                        required=""
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
                            >
                                Sign In
                            </button>

                            <div className="flex items-center pt-4 space-x-1">
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                                <p className="px-3 text-sm text-gray-500 dark:text-gray-400">Don't have an account?</p>
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/register"
                                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                >
                                    Create an account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Academic Scheduler &copy; {new Date().getFullYear()} - Conflict Free Timetabling System
                </div>
            </div>
        </section>
    );
}