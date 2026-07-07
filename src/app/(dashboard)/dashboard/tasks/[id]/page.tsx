import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckSquare, FileText, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";
import { TaskActivityFeed } from "@/components/TaskActivityFeed";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      assignees: { include: { user: true } },
      files: { include: { uploader: true } }
    }
  });

  if (!task) notFound();

  const activities = await prisma.activityLog.findMany({
    where: { entityId: id, entityType: "TASK" },
    orderBy: { createdAt: "asc" },
    include: { user: true }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/tasks">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{task.name}</h2>
          <p className="text-slate-500">Project: {task.project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Updates */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                Task Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 font-medium block">Category</span>
                  <span className="font-semibold">{task.category.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Priority</span>
                  <span className="font-semibold">{task.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Deadline</span>
                  <span className="font-semibold">
                    {task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "No deadline"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Assigned To</span>
                  <div className="font-semibold flex flex-wrap gap-2 mt-1">
                    {task.assignees.map(a => (
                      <span key={a.userId} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-xs text-slate-700">
                        {a.user.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-700 font-medium block text-sm mb-2">Notes & Instructions</span>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap text-sm text-slate-700 min-h-[100px]">
                  {task.notes || "No additional notes provided."}
                </div>
              </div>
            </CardContent>
          </Card>

          <TaskActivityFeed taskId={task.id} activities={activities} />
        </div>

        {/* Right Column: Files */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <FileUpload taskId={task.id} projectId={task.projectId} />
              
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Uploaded Files</h3>
                {task.files.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">No files uploaded yet.</p>
                ) : (
                  task.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {Math.round(file.size / 1024)} KB • By {file.uploader.name.split(" ")[0]}
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
