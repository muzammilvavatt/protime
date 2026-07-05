"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/actions/project.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FolderPlus } from "lucide-react";
import Link from "next/link";

export default function AddProjectPage() {
  const [state, formAction, isPending] = useActionState(createProjectAction, undefined);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Project</h2>
          <p className="text-slate-500">Create a new construction or NOC project.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <FolderPlus className="w-5 h-5 mr-2 text-blue-600" />
            Project Details
          </CardTitle>
          <CardDescription className="text-slate-500">
            Fill in the essential details for this project.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
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
                  placeholder="e.g. Skyline Tower Phase 1"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-slate-700 font-medium">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="John Doe"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-slate-700 font-medium">Client Phone</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  placeholder="+1 (555) 000-0000"
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-slate-700 font-medium">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-700 font-medium">Site Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, Area"
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="address" className="text-slate-700 font-medium">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Construction Ave..."
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Description / Notes</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 placeholder:text-slate-400"
                  placeholder="Details about the project..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-700 font-medium">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
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

            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 pt-6 bg-slate-50 rounded-b-xl">
            <Link href="/dashboard/projects">
              <Button type="button" variant="ghost" className="hover:bg-slate-200 text-slate-700">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
