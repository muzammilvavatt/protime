"use client";

import { useActionState } from "react";
import { editProjectAction } from "@/actions/project.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

export function EditProjectForm({ project }: { project: any }) {
  const editActionWithId = editProjectAction.bind(null, project.id);
  const [state, formAction, isPending] = useActionState(editActionWithId, undefined);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${project.id}`}>
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Project</h2>
          <p className="text-slate-500 text-sm">Update details for {project.name}.</p>
        </div>
      </div>

      <form action={formAction}>
        <Card className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl overflow-hidden mb-6 border-0">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle className="text-lg font-bold">Project Details</CardTitle>
            </div>
            <CardDescription className="text-slate-500 text-sm ml-10">
              Basic information about the construction project or NOC application.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {state?.error && (
              <div className="p-4 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                {state.error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Project Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={project.name}
                  required
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={project.description || ""}
                  className="flex w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-900 placeholder:text-slate-400 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientName" className="text-sm font-semibold text-slate-700">Client Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="clientName"
                  name="clientName"
                  defaultValue={project.clientName}
                  required
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientPhone" className="text-sm font-semibold text-slate-700">Client Phone</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  defaultValue={project.clientPhone || ""}
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientEmail" className="text-sm font-semibold text-slate-700">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  defaultValue={project.clientEmail || ""}
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Site Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={project.location || ""}
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-sm font-semibold text-slate-700">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ""}
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11 block w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project.status}
                  className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-900"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6 bg-slate-50/50">
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm min-w-[130px]"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
