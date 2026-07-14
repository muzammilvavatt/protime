"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Menu, X, BriefcaseBusiness, FileText, Clock, ShieldAlert
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only update state if it's currently open to avoid cascading renders
    if (isMobileOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const links = [
    { href: "/dashboard",                 label: "Dashboard",  icon: LayoutDashboard, adminOnly: false, exact: true },
    { href: "/dashboard/projects",        label: "Projects",   icon: FolderKanban,    adminOnly: true },
    { href: "/dashboard/tasks",           label: isAdmin ? "All Tasks" : "My Tasks", icon: CheckSquare, adminOnly: false },
    { href: "/dashboard/employees",       label: "Employees",  icon: Users,           adminOnly: true },
    { href: "/dashboard/attendance",      label: "Attendance", icon: Clock,           adminOnly: true },
    { href: "/dashboard/reports",         label: "Reports",    icon: FileText,        adminOnly: true },
    { href: "/dashboard/settings/roles",  label: "Roles",      icon: BriefcaseBusiness, adminOnly: true },
    { href: "/dashboard/settings/admins", label: "Administrators", icon: ShieldAlert, adminOnly: true },
    { href: "/dashboard/settings",        label: "Settings",   icon: Settings,        adminOnly: false, exact: true },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-50 p-2 bg-[#0F172A] rounded-lg text-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={`
          fixed md:relative bg-[#0F172A] flex flex-col transition-all duration-300 ease-in-out
          z-50 h-full no-print
          ${isCollapsed ? "md:w-[72px]" : "md:w-64"}
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-7 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/10 px-5 shrink-0 ${isCollapsed ? "md:justify-center md:px-0" : ""}`}>
          <div className={`flex items-center gap-2.5 ${isCollapsed ? "md:gap-0" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 shrink-0">
              <img src="/logo.png" alt="PROTIME Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`text-white font-bold text-lg tracking-tight ${isCollapsed ? "md:hidden" : ""}`}>
              PROTIME
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-5 space-y-0.5 overflow-y-auto overflow-x-hidden px-3">
          <p className={`text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-3 ${isCollapsed ? "md:hidden" : ""}`}>
            Navigation
          </p>
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
                className={`
                  flex items-center rounded-lg transition-all duration-150 group
                  ${isCollapsed ? "md:justify-center md:px-0 md:py-3 px-3 py-2.5" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30"
                    : "text-slate-400 hover:text-white hover:bg-white/8"}
                `}
              >
                <Icon className={`shrink-0 transition-colors
                  ${isCollapsed ? "md:w-5 md:h-5 md:mr-0 w-5 h-5 mr-3" : "w-5 h-5 mr-3"}
                  ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`}
                />
                <span className={`text-sm font-medium whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>
                  {link.label}
                </span>
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Logout */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <form action={logoutAction}>
            <button
              title={isCollapsed ? "Log out" : undefined}
              className={`
                flex items-center w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10
                rounded-lg transition-colors group
                ${isCollapsed ? "md:justify-center md:py-3 px-3 py-2.5" : "px-3 py-2.5"}
              `}
            >
              <LogOut className={`shrink-0 transition-transform group-hover:translate-x-0.5
                ${isCollapsed ? "md:w-5 md:h-5 md:mr-0 w-5 h-5 mr-3" : "w-5 h-5 mr-3"}`}
              />
              <span className={`text-sm font-medium whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>
                Log out
              </span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
