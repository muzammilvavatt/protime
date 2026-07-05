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
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Project</h2>
          <p className="text-zinc-400">Create a new construction or NOC project.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderPlus className="w-5 h-5 mr-2 text-blue-500" />
            Project Details
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Fill in the essential details for this project.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                {state.error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="name" className="text-zinc-300">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Skyline Tower Phase 1"
                  required
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-zinc-300">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="John Doe"
                  required
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-zinc-300">Client Phone</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  placeholder="+1 (555) 000-0000"
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-zinc-300">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-zinc-300">Site Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, Area"
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="address" className="text-zinc-300">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Construction Ave..."
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="description" className="text-zinc-300">Description / Notes</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-100 placeholder:text-zinc-500"
                  placeholder="Details about the project..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 text-zinc-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
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
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 block text-white color-scheme-dark"
                  style={{ colorScheme: "dark" }}
                />
              </div>

            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-zinc-800 pt-6">
            <Link href="/dashboard/projects">
              <Button type="button" variant="ghost" className="hover:bg-zinc-800">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
