"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Building2, 
  CreditCard, 
  AlertCircle, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  FileText,
  UserCircle
} from "lucide-react";

const menuConfigs = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Landlords", href: "/admin/landlords", icon: Users },
    { name: "Tenants", href: "/admin/tenants", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: Building2 },
    { name: "Billing", href: "/admin/billing", icon: CreditCard },
    { name: "Issues", href: "/admin/issues", icon: AlertCircle },
    { name: "Notices", href: "/admin/notices", icon: Bell },
  ],
  landlord: [
    { name: "Dashboard", href: "/landlord/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/landlord/properties", icon: Building2 },
    { name: "Tenants", href: "/landlord/tenants", icon: Users },
    { name: "Billing", href: "/landlord/billing", icon: CreditCard },
    { name: "Issues", href: "/landlord/issues", icon: AlertCircle },
    { name: "Documents", href: "/landlord/documents", icon: FileText },
    { name: "Notices", href: "/landlord/notices", icon: Bell },
    { name: "Profile", href: "/landlord/profile", icon: UserCircle },
  ],
  tenant: [
    { name: "Dashboard", href: "/tenant/dashboard", icon: LayoutDashboard },
    { name: "My Home", href: "/tenant/my-home", icon: Home },
    { name: "Bills", href: "/tenant/bills", icon: CreditCard },
    { name: "Issues", href: "/tenant/issues", icon: AlertCircle },
    { name: "Documents", href: "/tenant/documents", icon: FileText },
    { name: "Notices", href: "/tenant/notices", icon: Bell },
    { name: "Profile", href: "/tenant/profile", icon: UserCircle },
  ],
};

export default function Sidebar({ role, isOpen, toggleSidebar }) {
  const pathname = usePathname();
  const menus = menuConfigs[role] || [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Rentora
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 absolute -right-3 top-20 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto scrollbar-thin">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400" 
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  }
                `}
                title={isCollapsed ? item.name : ""}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"}`} />
                {!isCollapsed && <span>{item.name}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section (Logout) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-all duration-200 
              ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Sign Out" : ""}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
