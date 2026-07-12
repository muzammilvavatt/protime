import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, History, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/session";
import { TaskList } from "@/components/TaskList";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab === "completed" ? "completed" : "active";

  let isClockedIn = false;
  if (!isAdmin && session?.user?.id) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = await prisma.attendance.findFirst({
      where: { userId: session.user.id, date: { gte: today } },
    });
    isClockedIn = !!(todayRecord && !todayRecord.clockOut);
  }

  const statusFilter = activeTab === "completed"
    ? { status: "COMPLETED" }
    : { status: { not: "COMPLETED" } };

  const tasks = await prisma.task.findMany({
    where: isAdmin ? statusFilter : {
      ...statusFilter,
      assignees: { some: { userId: session?.user?.id } }
    },
    orderBy: [{ project: { name: "asc" } }, { priority: "desc" }, { createdAt: "desc" }],
    include: {
      project: true,
      dependsOn: true,
      assignees: { include: { user: true } }
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isAdmin ? "All Tasks" : "My Tasks"}</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track task progress and team assignments.</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/tasks/add">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          </Link>
        )}
      </div>

      {/* Clock-in Warning */}
      {!isAdmin && activeTab === "active" && !isClockedIn && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          You must clock in from the Dashboard before you can start or submit tasks.
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <Link href="/dashboard/tasks?tab=active">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
            activeTab === 'active'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}>
            <ListTodo className="w-4 h-4" />
            Active Tasks
          </button>
        </Link>
        <Link href="/dashboard/tasks?tab=completed">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
            activeTab === 'completed'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}>
            <History className="w-4 h-4" />
            Completed
          </button>
        </Link>
      </div>

      <TaskList initialTasks={tasks} activeTab={activeTab} isAdmin={isAdmin} isClockedIn={isClockedIn} />
    </div>
  );
}
