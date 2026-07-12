import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

// Page title mapping — cleaner than reading from child components
const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/tasks": "Tasks",
  "/dashboard/employees": "Employees",
  "/dashboard/attendance": "Attendance",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/roles": "Roles & Responsibilities",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const userName: string = (session?.user as any)?.name ?? (isAdmin ? "Admin" : "Employee");
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex text-slate-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 pl-16 md:pl-6 md:px-6 bg-white border-b border-slate-200 shadow-sm relative z-10 shrink-0 no-print">
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">Workspace</h1>
            <p className="text-xs text-slate-400 font-medium">PROTIME Construction Management</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? "bg-indigo-500" : "bg-emerald-500"}`} />
              <span className="text-xs font-semibold text-slate-600">
                {session?.user?.role?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
