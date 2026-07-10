"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/actions/project.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AddProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, undefined);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <form action={formAction}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Project Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Skyline Residency"
              required
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-slate-700 font-medium">Client Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="e.g. Acme Corp"
              required
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-slate-700 font-medium">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900 w-full"
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
              placeholder="client@acme.com"
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location" className="text-slate-700 font-medium">Project Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. 123 Business Ave, Suite 100"
              className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">Project Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Enter detailed project requirements, scope, or notes here..."
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-slate-100">
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
        </div>
      </form>
    </div>
  );
}
