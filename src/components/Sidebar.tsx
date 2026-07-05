"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users, FolderKanban, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, adminOnly: true },
    { href: "/dashboard/tasks", label: isAdmin ? "All Tasks" : "My Tasks", icon: CheckSquare, adminOnly: false },
    { href: "/dashboard/employees", label: "Employees", icon: Users, adminOnly: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: false },
  ];

  return (
    <aside 
      className={`relative bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out z-10 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className={`h-16 flex items-center border-b border-white/5 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
        <Building2 className={`text-blue-500 shrink-0 ${isCollapsed ? "w-7 h-7" : "w-6 h-6 mr-3"}`} />
        {!isCollapsed && <span className="font-bold text-lg tracking-tight truncate">CPM System</span>}
      </div>
      
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden px-3">
        {links.map((link) => {
          if (link.adminOnly && !isAdmin) return null;
          
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              title={isCollapsed ? link.label : undefined}
              className={`flex items-center rounded-lg transition-all duration-200 group ${
                isCollapsed ? "justify-center py-3" : "px-3 py-2.5"
              } ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_12px_rgba(37,99,235,0.1)]" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              }`}
            >
              <Icon className={`shrink-0 ${isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3"} ${isActive ? "text-blue-500" : "group-hover:text-zinc-300"}`} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-2">
        <form action={logoutAction}>
          <button 
            title={isCollapsed ? "Log out" : undefined}
            className={`flex items-center w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group ${
              isCollapsed ? "justify-center py-3" : "px-3 py-2.5"
            }`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3"} group-hover:scale-105 transition-transform`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Log out</span>}
          </button>
        </form>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center w-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors py-3`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <ChevronLeft className="w-5 h-5 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
