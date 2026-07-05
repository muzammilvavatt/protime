import { prisma } from "@/lib/prisma";
import { createTaskAction } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckSquare } from "lucide-react";
import Link from "next/link";

const TASK_CATEGORIES = [
  "SITE_INSPECTION",
  "SITE_PLAN",
  "FLOOR_PLAN",
  "RULE_CHART",
  "NOC_FIRE",
  "NOC_PCB",
  "NOC_RTP",
  "DOCUMENTATION",
  "OTHER"
];

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
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assign Task</h2>
          <p className="text-zinc-400">Delegate work to your team members.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
            Task Details
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Define the scope, priority, and who is responsible.
          </CardDescription>
        </CardHeader>
        {/* We use a traditional form post to a server action since we can't easily use useActionState in a Server Component directly,
            or we can use a wrapper client component. For simplicity in Next 14/15 RSC, we can pass Server Actions directly to the action attribute! */}
        <form action={createTaskAction}>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="name" className="text-zinc-300">Task Title *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Conduct Initial Site Survey"
                  required
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-zinc-300">Project *</Label>
                <select
                  id="projectId"
                  name="projectId"
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-100"
                >
                  <option value="">Select a Project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.clientName}</option>
                  ))}
                </select>
                {projects.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Please create a project first!</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-zinc-300">Category *</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-100"
                >
                  <option value="">Select Category...</option>
                  {TASK_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeId" className="text-zinc-300">Assign To *</Label>
                <select
                  id="assigneeId"
                  name="assigneeId"
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-100"
                >
                  <option value="">Select Employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role.replace(/_/g, " ")})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-100"
                >
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-zinc-300">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 block text-white"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="notes" className="text-zinc-300">Task Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-100 placeholder:text-zinc-500"
                  placeholder="Instructions for the employee..."
                />
              </div>

            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-zinc-800 pt-6">
            <Link href="/dashboard/tasks">
              <Button type="button" variant="ghost" className="hover:bg-zinc-800">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={projects.length === 0 || employees.length === 0}
            >
              Assign Task
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
