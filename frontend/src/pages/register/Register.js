import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const REGISTER_URL = "http://localhost:8080/api/auth/register";

export default function Register() {
    const navigate = useNavigate();
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [matchPwd, setMatchPwd] = useState("");
    const [errMsg, setErrMsg] = useState("");

    // New state for validation
    const [validations, setValidations] = useState({
        username: { isValid: false, message: "" },
        email: { isValid: false, message: "" },
        password: { isValid: false, message: "" },
        confirmPassword: { isValid: false, message: "" }
    });

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg("");
    }, [user, email, pwd, matchPwd]);

    // Username validation
    const validateUsername = (username) => {
        if (username.length < 3) {
            return {
                isValid: false,
                message: "Username must be at least 3 characters long"
            };
        }
        if (username.length > 20) {
            return {
                isValid: false,
                message: "Username must not exceed 20 characters"
            };
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return {
                isValid: false,
                message: "Username can only contain letters, numbers, and underscores"
            };
        }
        return { isValid: true, message: "" };
    };

    // Email validation
    const validateEmail = (emailAddress) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailAddress) {
            return {
                isValid: false,
                message: "Email is required"
            };
        }
        if (!emailRegex.test(emailAddress)) {
            return {
                isValid: false,
                message: "Please enter a valid email address"
            };
        }
        return { isValid: true, message: "" };
    };

    // Password validation
    const validatePassword = (password) => {
        if (password.length < 8) {
            return {
                isValid: false,
                message: "Password must be at least 8 characters long"
            };
        }
        if (password.length > 50) {
            return {
                isValid: false,
                message: "Password must not exceed 50 characters"
            };
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return {
                isValid: false,
                message: "Password must include uppercase, lowercase, number, and special character"
            };
        }
        return { isValid: true, message: "" };
    };

    // Confirm password validation
    const validateConfirmPassword = (password, confirmPassword) => {
        if (password !== confirmPassword) {
            return {
                isValid: false,
                message: "Passwords do not match"
            };
        }
        return { isValid: true, message: "" };
    };

    // Handle input changes with validation
    const handleUsernameChange = (e) => {
        const newUsername = e.target.value;
        setUser(newUsername);
        setValidations(prev => ({
            ...prev,
            username: validateUsername(newUsername)
        }));
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setValidations(prev => ({
            ...prev,
            email: validateEmail(newEmail)
        }));
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPwd(newPassword);
        setValidations(prev => ({
            ...prev,
            password: validatePassword(newPassword),
            confirmPassword: validateConfirmPassword(newPassword, matchPwd)
        }));
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setMatchPwd(newConfirmPassword);
        setValidations(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(pwd, newConfirmPassword)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        const usernameValidation = validateUsername(user);
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(pwd);
        const confirmPasswordValidation = validateConfirmPassword(pwd, matchPwd);

        setValidations({
            username: usernameValidation,
            email: emailValidation,
            password: passwordValidation,
            confirmPassword: confirmPasswordValidation
        });

        // Check if all validations pass
        if (!(usernameValidation.isValid &&
            emailValidation.isValid &&
            passwordValidation.isValid &&
            confirmPasswordValidation.isValid)) {
            return;
        }

        try {
            const response = await axios.post(
                REGISTER_URL,
                JSON.stringify({
                    username: user,
                    email: email,
                    password: pwd
                }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            // Clear form
            setUser("");
            setEmail("");
            setPwd("");
            setMatchPwd("");

            // Redirect to login page after successful registration
            navigate("/login");
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No server response");
            } else if (err.response?.status === 400) {
                setErrMsg("Invalid registration data");
            } else if (err.response?.status === 409) {
                setErrMsg("Username or email already taken");
            } else {
                setErrMsg("Registration failed");
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
                <div className="mb-0">
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

                {/* Register Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="px-8 py-4 pt-0">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                            Create Your Account
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
                                        className={`pl-10 w-full py-3 border rounded-lg transition-all duration-200 
                                            ${!validations.username.isValid && user ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}
                                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                                        placeholder="      Enter your username"
                                        value={user}
                                        onChange={handleUsernameChange}
                                        required
                                    />
                                </div>
                                {!validations.username.isValid && user && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {validations.username.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className={`pl-10 w-full py-3 border rounded-lg transition-all duration-200 
                                            ${!validations.email.isValid && email ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}
                                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                                        style={{ width: "100%" }}
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                    />
                                </div>
                                {!validations.email.isValid && email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {validations.email.message}
                                    </p>
                                )}
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
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder=" ••••••••"
                                        className={`pl-10 w-full py-3 border rounded-lg transition-all duration-200 
                                            ${!validations.password.isValid && pwd ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}
                                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                                        value={pwd}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                {!validations.password.isValid && pwd && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {validations.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        name="confirm-password"
                                        id="confirm-password"
                                        placeholder=" ••••••••"
                                        className={`pl-10 w-full py-3 border rounded-lg transition-all duration-200 
                                            ${!validations.confirmPassword.isValid && matchPwd ? 'border-red-500 bg-red-50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}
                                            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                                        value={matchPwd}
                                        onChange={handleConfirmPasswordChange}
                                        required
                                    />
                                </div>
                                {!validations.confirmPassword.isValid && matchPwd && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {validations.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
                            >
                                Create Account
                            </button>

                            <div className="flex items-center pt-4 space-x-1">
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                                <p className="px-3 text-sm text-gray-500 dark:text-gray-400">Already have an account?</p>
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                >
                                    Sign in
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