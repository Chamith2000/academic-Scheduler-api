import React, { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
            <Sidebar isSidebarExpanded={isSidebarExpanded} setIsSidebarExpanded={setIsSidebarExpanded} />
            <main
                className={`flex-grow p-6 transition-all duration-300 ${
                    isSidebarExpanded ? "ml-64" : "ml-16"
                }`}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;