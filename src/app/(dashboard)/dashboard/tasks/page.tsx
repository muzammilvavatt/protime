import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { getSession } from "@/lib/session";

import { KanbanBoard } from "@/components/KanbanBoard";

export default async function TasksPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : {
      assignees: {
        some: { userId: session?.user?.id }
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
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

      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}
