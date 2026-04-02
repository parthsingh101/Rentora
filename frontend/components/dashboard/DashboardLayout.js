"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children, role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 lg:pl-64 transition-all duration-300">
        <Header toggleSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
