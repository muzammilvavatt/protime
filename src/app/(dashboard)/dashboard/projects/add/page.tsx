import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FolderPlus } from "lucide-react";
import Link from "next/link";
import { AddProjectForm } from "@/components/AddProjectForm";

export default async function AddProjectPage() {
  const employees = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Project</h2>
          <p className="text-slate-500">Create a new project and define its automated workflow.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <FolderPlus className="w-5 h-5 mr-2 text-blue-600" />
            Project Details & Workflow
          </CardTitle>
          <CardDescription className="text-slate-500">
            Fill in the essential details and define the sequential task workflow.
          </CardDescription>
        </CardHeader>
        <AddProjectForm employees={employees} />
      </Card>
    </div>
  );
}
