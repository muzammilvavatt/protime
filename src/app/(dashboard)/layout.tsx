import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-zinc-200 selection:bg-blue-500/30">
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Crisp professional top gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none" />
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md relative z-10">
          <h1 className="text-xl font-semibold">Workspace</h1>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-300">
              {session?.user?.role?.replace(/_/g, " ")}
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-zinc-950">
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
