import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FolderKanban, MapPin, Phone, Mail } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignees: { include: { user: true } } }
      }
    }
  });

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-zinc-400">Project Details & Tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FolderKanban className="w-5 h-5 mr-2 text-blue-500" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-zinc-500 block">Status</span>
                <span className="font-medium text-blue-400">{project.status}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Client</span>
                <span className="font-medium">{project.clientName}</span>
              </div>
              {project.clientPhone && (
                <div>
                  <span className="text-zinc-500 flex items-center"><Phone className="w-3 h-3 mr-1"/> Phone</span>
                  <span className="font-medium">{project.clientPhone}</span>
                </div>
              )}
              {project.clientEmail && (
                <div>
                  <span className="text-zinc-500 flex items-center"><Mail className="w-3 h-3 mr-1"/> Email</span>
                  <span className="font-medium">{project.clientEmail}</span>
                </div>
              )}
              {project.location && (
                <div>
                  <span className="text-zinc-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Location</span>
                  <span className="font-medium">{project.location}</span>
                </div>
              )}
              {project.deadline && (
                <div>
                  <span className="text-zinc-500 block">Deadline</span>
                  <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-zinc-500">No tasks assigned to this project yet.</p>
                ) : (
                  project.tasks.map(task => (
                    <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                      <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950 hover:bg-zinc-800 transition-colors cursor-pointer mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-zinc-200">{task.name}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">{task.status.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-400">
                          <span>{task.category.replace(/_/g, " ")}</span>
                          <div className="flex space-x-2">
                            {task.assignees.map(a => (
                              <span key={a.userId} className="bg-zinc-800 px-2 py-0.5 rounded">{a.user.name}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
