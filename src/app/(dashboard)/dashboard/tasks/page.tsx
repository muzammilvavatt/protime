import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, Clock, User } from "lucide-react";
import { getSession } from "@/lib/session";

export default async function TasksPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const tasks = await prisma.task.findMany({
    where: isAdmin ? undefined : {
      assignees: {
        some: {
          userId: session?.user?.id
        }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isAdmin ? "Tasks" : "My Tasks"}</h2>
          <p className="text-zinc-400">Manage site visits, NOCs, and drawings.</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/tasks/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
            Task Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-y border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Task / Project</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Assigned To</th>
                  <th className="px-6 py-4 font-medium">Status / Progress</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/tasks/${task.id}`} className="font-medium text-blue-400 hover:underline">
                        {task.name}
                      </Link>
                      <div className="text-zinc-500 text-xs mt-1">{task.project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-medium">
                        {task.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {task.assignees.map(a => (
                          <div key={a.userId} className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-blue-600 flex items-center justify-center text-xs font-bold text-white" title={a.user.name}>
                            {a.user.name.substring(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {task.assignees.length === 0 && (
                          <span className="text-zinc-500 text-xs italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold w-fit ${
                          task.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                          task.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400" :
                          task.status === "REVIEW" ? "bg-purple-500/10 text-purple-400" :
                          "bg-zinc-500/10 text-zinc-400"
                        }`}>
                          {task.status.replace(/_/g, " ")}
                        </span>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.deadline ? (
                        <span className={`flex items-center text-xs font-medium ${
                          new Date(task.deadline) < new Date() && task.status !== "COMPLETED" ? "text-red-400" : "text-zinc-400"
                        }`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">No deadline</span>
                      )}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No tasks assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
