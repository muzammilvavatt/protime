import { ReactNode } from "react";
import Link from "next/link";
import { Building2, LayoutDashboard, Users, FolderKanban, CheckSquare, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Building2 className="w-6 h-6 text-blue-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">CPM System</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 bg-blue-600/10 text-blue-500 rounded-md transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          {isAdmin && (
            <Link href="/dashboard/projects" className="flex items-center px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
              <FolderKanban className="w-5 h-5 mr-3" />
              <span className="font-medium">Projects</span>
            </Link>
          )}
          
          <Link href="/dashboard/tasks" className="flex items-center px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
            <CheckSquare className="w-5 h-5 mr-3" />
            <span className="font-medium">{isAdmin ? "All Tasks" : "My Tasks"}</span>
          </Link>
          
          {isAdmin && (
            <Link href="/dashboard/employees" className="flex items-center px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
              <Users className="w-5 h-5 mr-3" />
              <span className="font-medium">Employees</span>
            </Link>
          )}
          
          <Link href="/dashboard/settings" className="flex items-center px-3 py-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <form action={logoutAction}>
            <button className="flex items-center w-full px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Log out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800 bg-zinc-900/50">
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
