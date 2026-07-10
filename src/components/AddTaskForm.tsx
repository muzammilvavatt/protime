"use client";

import { useActionState } from "react";
import { createTaskAction } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
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

export function AddTaskForm({ projects, employees, tasks = [] }: { projects: any[], employees: any[], tasks?: any[] }) {
  const [state, formAction, isPending] = useActionState(createTaskAction, undefined);

  return (
    <form action={formAction}>
      <CardContent className="space-y-6 pt-6">
        {state?.error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
            {state.error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Task Title *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Conduct Initial Site Survey"
              required
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId" className="text-slate-700 font-medium">Project *</Label>
            <select
              id="projectId"
              name="projectId"
              required
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
            >
              <option value="">Select a Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.clientName}</option>
              ))}
            </select>
            {projects.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Please create a project first!</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 font-medium">Category *</Label>
            <select
              id="category"
              name="category"
              required
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
            >
              <option value="">Select Category...</option>
              {TASK_CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeId" className="text-slate-700 font-medium">Assign To *</Label>
            <select
              id="assigneeId"
              name="assigneeId"
              required
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
            >
              <option value="">Select Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role.replace(/_/g, " ")})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-slate-700 font-medium">Priority</Label>
            <select
              id="priority"
              name="priority"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
            >
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-slate-700 font-medium">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="bg-white border-slate-300 focus-visible:ring-blue-500 block text-slate-900"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dependsOnId" className="text-slate-700 font-medium">Depends On (Optional)</Label>
            <select
              id="dependsOnId"
              name="dependsOnId"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
            >
              <option value="">No Dependencies</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>[{t.project.name}] {t.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">This task will remain locked until the selected task is completed.</p>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="notes" className="text-slate-700 font-medium">Task Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              placeholder="Instructions for the employee..."
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 pt-6 bg-slate-50 rounded-b-xl">
        <Link href="/dashboard/tasks">
          <Button type="button" variant="ghost" className="hover:bg-slate-200 text-slate-700">
            Cancel
          </Button>
        </Link>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          disabled={projects.length === 0 || employees.length === 0 || isPending}
        >
          {isPending ? "Assigning..." : "Assign Task"}
        </Button>
      </CardFooter>
    </form>
  );
}
