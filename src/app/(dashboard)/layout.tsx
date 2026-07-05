import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm relative z-10">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Workspace</h1>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
              {session?.user?.role?.replace(/_/g, " ")}
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {isAdmin ? "SA" : "EM"}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
