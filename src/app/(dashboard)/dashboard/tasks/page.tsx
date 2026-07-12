import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, History } from "lucide-react";
import { getSession } from "@/lib/session";

import { TaskList } from "@/components/TaskList";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab === "completed" ? "completed" : "active";

  // Base status filter based on the active tab
  const statusFilter = activeTab === "completed" 
    ? { status: "COMPLETED" } 
    : { status: { not: "COMPLETED" } };

  const tasks = await prisma.task.findMany({
    where: isAdmin ? statusFilter : {
      ...statusFilter,
      assignees: {
        some: { userId: session?.user?.id }
      }
    },
    orderBy: [
      { project: { name: "asc" } },
      { priority: "desc" },
      { createdAt: "desc" }
    ],
    include: {
      project: true,
      dependsOn: true,
      assignees: {
        include: { user: true }
      }
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isAdmin ? "All Tasks" : "My Tasks"}</h2>
          <p className="text-slate-500">Track task progress and priorities.</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/tasks/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          </Link>
        )}
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-px">
        <Link href="/dashboard/tasks?tab=active">
          <Button variant="ghost" className={`rounded-none border-b-2 px-4 py-2 hover:bg-transparent ${activeTab === 'active' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <ListTodo className="w-4 h-4 mr-2" />
            Active Tasks
          </Button>
        </Link>
        <Link href="/dashboard/tasks?tab=completed">
          <Button variant="ghost" className={`rounded-none border-b-2 px-4 py-2 hover:bg-transparent ${activeTab === 'completed' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <History className="w-4 h-4 mr-2" />
            Completed History
          </Button>
        </Link>
      </div>

      <TaskList initialTasks={tasks} activeTab={activeTab} isAdmin={isAdmin} />
    </div>
  );
}
