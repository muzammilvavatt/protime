import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FolderKanban, MapPin, Phone, Mail, FileText, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";

import { ProjectReportButtons } from "@/components/ProjectReportButtons";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignees: { include: { user: true } } }
      },
      files: {
        include: { uploader: true }
      }
    }
  });

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 no-print">
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
        <ProjectReportButtons project={project} tasks={project.tasks} />
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-600 mt-1">Project Status Report</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-slate-900">PROTIME / PRMC</h3>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN')}</p>
          </div>
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
                  <span className="font-semibold">{new Date(project.deadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
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
          
          {/* Project Files */}
          <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <FileUpload projectId={project.id} />
              
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Uploaded Files</h3>
                {project.files.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">No files uploaded yet.</p>
                ) : (
                  project.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {Math.round(file.size / 1024)} KB • By {file.uploader ? file.uploader.name.split(" ")[0] : "Deleted User"}
                        </p>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                        <Button size="icon" variant="ghost" className="hover:bg-blue-50 text-blue-600">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
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
