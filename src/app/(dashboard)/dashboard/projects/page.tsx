import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FolderKanban, Plus, MapPin, CalendarClock, Phone } from "lucide-react";
import { deleteProjectAction, updateProjectStatusAction } from "@/actions/project.actions";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-zinc-400">Manage your construction sites and NOCs.</p>
        </div>
        <Link href="/dashboard/projects/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="bg-zinc-900 border-zinc-800 text-zinc-100 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold flex items-center">
                  <FolderKanban className="w-5 h-5 mr-2 text-blue-500" />
                  {project.name}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  project.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                  project.status === "COMPLETED" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                  project.status === "ARCHIVED" ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" :
                  "bg-amber-500/10 text-amber-400 border border-amber-500/20" // ON_HOLD
                }`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Client</p>
                <p className="font-medium">{project.clientName}</p>
                {project.clientPhone && (
                  <p className="text-xs text-zinc-500 flex items-center mt-1">
                    <Phone className="w-3 h-3 mr-1" /> {project.clientPhone}
                  </p>
                )}
              </div>
              
              {project.location && (
                <div>
                  <p className="text-sm text-zinc-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-zinc-500" /> Location
                  </p>
                  <p className="font-medium text-sm mt-1">{project.location}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pt-4 border-t border-zinc-800">
                <div className="flex items-center text-zinc-400">
                  <CalendarClock className="w-4 h-4 mr-1" />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
                </div>
                <div className="font-medium">
                  {project._count.tasks} Tasks
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 space-x-2">
              <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white" variant="secondary">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No projects created yet. Click 'New Project' to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
