import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { getSession } from "@/lib/session";

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
    <div className="space-y-6 max-w-7xl mx-auto">
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

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold w-1/4">Task & Project</th>
                <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                <th scope="col" className="px-6 py-4 font-semibold">Assignees</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status & Progress</th>
                <th scope="col" className="px-6 py-4 font-semibold">Deadline</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/tasks/${task.id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline line-clamp-2">
                      {task.name}
                    </Link>
                    <div className="text-xs text-slate-500 mt-1">{task.project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium">
                      {task.category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {task.assignees.map((a, i) => (
                        <div key={a.user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm" title={a.user.name}>
                          {a.user.name.substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {task.assignees.length === 0 && (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold w-fit ${
                        task.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        task.status === "REVIEW" ? "bg-purple-100 text-purple-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {task.deadline ? (
                      <span className={`flex items-center text-xs font-medium ${
                        new Date(task.deadline) < new Date() && task.status !== "COMPLETED" ? "text-red-600" : "text-slate-500"
                      }`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No deadline</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        Open
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No tasks assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
