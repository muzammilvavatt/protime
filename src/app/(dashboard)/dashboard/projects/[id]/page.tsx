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
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h2>
          <p className="text-slate-500">Project Details & Tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <FolderKanban className="w-5 h-5 mr-2 text-blue-600" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-6">
              <div>
                <span className="text-slate-500 font-medium block">Status</span>
                <span className="font-semibold text-blue-700">{project.status.replace(/_/g, " ")}</span>
              </div>
              {project.description && (
                <div>
                  <span className="text-slate-500 font-medium block">Description</span>
                  <p className="text-slate-700 leading-relaxed mt-1">{project.description}</p>
                </div>
              )}
              <div>
                <span className="text-slate-500 font-medium block">Client</span>
                <span className="font-semibold">{project.clientName}</span>
              </div>
              {project.clientPhone && (
                <div>
                  <span className="text-slate-500 font-medium flex items-center"><Phone className="w-3 h-3 mr-1"/> Phone</span>
                  <span className="font-semibold">{project.clientPhone}</span>
                </div>
              )}
              {project.clientEmail && (
                <div>
                  <span className="text-slate-500 font-medium flex items-center"><Mail className="w-3 h-3 mr-1"/> Email</span>
                  <span className="font-semibold">{project.clientEmail}</span>
                </div>
              )}
              {project.location && (
                <div>
                  <span className="text-slate-500 font-medium flex items-center"><MapPin className="w-3 h-3 mr-1"/> Location</span>
                  <span className="font-semibold">{project.location}</span>
                </div>
              )}
              {project.deadline && (
                <div>
                  <span className="text-slate-500 font-medium block">Deadline</span>
                  <span className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                    No tasks assigned to this project yet.
                  </p>
                ) : (
                  project.tasks.map(task => (
                    <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                      <div className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer mb-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-800">{task.name}</h4>
                          <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-medium rounded-full">{task.status.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mt-3">
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">{task.category.replace(/_/g, " ")}</span>
                          <div className="flex space-x-2">
                            {task.assignees.map(a => (
                              <span key={a.userId} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-medium text-slate-700">{a.user.name}</span>
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
