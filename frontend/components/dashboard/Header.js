"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  ChevronDown
} from "lucide-react";

export default function Header({ toggleSidebar }) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roleColors = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    landlord: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    tenant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  };

  const role = session?.user?.role || "tenant";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center relative w-64 lg:w-96">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[role]}`}>
          {role}
        </span>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[120px]">
                {session?.user?.name || "User"}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 z-20">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{session?.user?.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </button>
                </div>
                <div className="py-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
