import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h2>
          <p className="text-slate-500">Manage your construction sites and NOCs.</p>
        </div>
        <Link href="/dashboard/projects/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Project Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Client</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Tasks</th>
                <th scope="col" className="px-6 py-4 font-semibold">Deadline</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:text-blue-600 hover:underline">
                      {project.name}
                    </Link>
                    {project.location && (
                      <div className="text-xs text-slate-500 mt-0.5">{project.location}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{project.clientName}</div>
                    {project.clientPhone && (
                      <div className="text-xs text-slate-500">{project.clientPhone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      project.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      project.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                      project.status === "ARCHIVED" ? "bg-slate-100 text-slate-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {project._count.tasks}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No projects created yet. Click 'New Project' to get started.
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
