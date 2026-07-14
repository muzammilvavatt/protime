import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckSquare } from "lucide-react";
import Link from "next/link";
import { AddTaskForm } from "@/components/AddTaskForm";

export default async function AddTaskPage() {
  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  const employees = await prisma.user.findMany({
    where: { isActive: true, role: { not: "ADMIN" } },
    orderBy: { name: "asc" }
  });

  const tasks = await prisma.task.findMany({
    where: { status: { not: "COMPLETED" } },
    orderBy: { createdAt: "desc" },
    include: { project: true }
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tasks">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assign Task</h2>
          <p className="text-slate-500 text-sm">Delegate work to your team members.</p>
        </div>
      </div>

      <Card className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl border-0">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            </div>
            Task Details
          </CardTitle>
          <CardDescription className="text-slate-500 ml-10">
            Define the scope, priority, and who is responsible.
          </CardDescription>
        </CardHeader>
        <AddTaskForm projects={projects} employees={employees} tasks={tasks} />
      </Card>
    </div>
  );
}
