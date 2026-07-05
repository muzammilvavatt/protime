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
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/tasks">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assign Task</h2>
          <p className="text-slate-500">Delegate work to your team members.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
            Task Details
          </CardTitle>
          <CardDescription className="text-slate-500">
            Define the scope, priority, and who is responsible.
          </CardDescription>
        </CardHeader>
        <AddTaskForm projects={projects} employees={employees} />
      </Card>
    </div>
  );
}
