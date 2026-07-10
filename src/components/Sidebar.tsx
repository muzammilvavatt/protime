"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users, FolderKanban, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, BriefcaseBusiness } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false, exact: true },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, adminOnly: true },
    { href: "/dashboard/tasks", label: isAdmin ? "All Tasks" : "My Tasks", icon: CheckSquare, adminOnly: false },
    { href: "/dashboard/employees", label: "Employees", icon: Users, adminOnly: true },
    { href: "/dashboard/attendance", label: "Attendance", icon: CheckSquare, adminOnly: true },
    { href: "/dashboard/settings/roles", label: "Roles", icon: BriefcaseBusiness, adminOnly: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: false, exact: true },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Hamburger Menu Button (Mobile) */}
      <button 
        className="md:hidden fixed top-3 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-slate-200 text-slate-700"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside 
        className={`fixed md:relative bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50 h-full w-64 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm z-50`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <div className={`h-16 flex items-center border-b border-slate-200 transition-all duration-300 px-6 ${isCollapsed ? "md:justify-center md:px-0" : ""}`}>
          <Building2 className={`text-blue-600 shrink-0 w-6 h-6 mr-3 ${isCollapsed ? "md:w-7 md:h-7 md:mr-0" : ""}`} />
          <span className={`font-bold text-lg tracking-tight text-slate-800 truncate ${isCollapsed ? "md:hidden" : ""}`}>
            CPM System
          </span>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden px-3">
          {links.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center rounded-lg transition-all duration-200 group px-3 py-2.5 ${
                  isCollapsed ? "md:justify-center md:py-3" : ""
                } ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`shrink-0 w-5 h-5 mr-3 ${isCollapsed ? "md:w-6 md:h-6 md:mr-0" : ""} ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className={`font-medium whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <form action={logoutAction}>
            <button 
              title={isCollapsed ? "Log out" : undefined}
              className={`flex items-center w-full text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group ${
                isCollapsed ? "md:justify-center md:p-3 px-3 py-2.5" : "px-3 py-2.5 justify-start"
              }`}
            >
              <LogOut className={`shrink-0 text-red-400 group-hover:scale-105 transition-transform ${
                isCollapsed ? "md:w-6 md:h-6 md:mr-0 w-5 h-5 mr-3" : "w-5 h-5 mr-3"
              }`} />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Log out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
