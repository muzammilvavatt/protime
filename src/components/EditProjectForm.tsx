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
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/projects/${project.id}`}>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Project</h2>
          <p className="text-slate-500">Update details for {project.name}.</p>
        </div>
      </div>

      <form action={formAction}>
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden mb-6">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </div>
            <CardDescription>
              Basic information about the construction project or NOC application.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                {state.error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={project.name}
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={project.description || ""}
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-slate-700 font-medium">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  defaultValue={project.clientName}
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-slate-700 font-medium">Client Phone</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  defaultValue={project.clientPhone || ""}
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-slate-700 font-medium">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  defaultValue={project.clientEmail || ""}
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-700 font-medium">Site Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={project.location || ""}
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-slate-700 font-medium">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ""}
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 block text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-700 font-medium">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project.status}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 pt-6 bg-slate-50">
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button type="button" variant="ghost" className="hover:bg-slate-200 text-slate-700">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
