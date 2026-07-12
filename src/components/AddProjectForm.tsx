"use client";

import { useActionState, useEffect } from "react";
import { createProjectAction } from "@/actions/project.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AddProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/projects");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">New Project</h2>
          <p className="text-slate-500 text-sm">Create a new construction project</p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="p-4 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
            {state.error}
          </div>
        )}

        {/* Project Details Card */}
        <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Project Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Project Name <span className="text-rose-500">*</span></Label>
              <Input id="name" name="name" placeholder="e.g. Skyline Residency Block A" required
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-sm font-semibold text-slate-700">Client Name <span className="text-rose-500">*</span></Label>
              <Input id="clientName" name="clientName" placeholder="e.g. Acme Corp" required
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadline" className="text-sm font-semibold text-slate-700">Project Deadline</Label>
              <Input id="deadline" name="deadline" type="date"
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11 w-full" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientPhone" className="text-sm font-semibold text-slate-700">Client Phone</Label>
              <Input id="clientPhone" name="clientPhone" placeholder="+91 98765 43210"
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientEmail" className="text-sm font-semibold text-slate-700">Client Email</Label>
              <Input id="clientEmail" name="clientEmail" type="email" placeholder="client@company.com"
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Project Location</Label>
              <Input id="location" name="location" placeholder="e.g. Kozhikode, Kerala"
                className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Project Description</Label>
              <textarea id="description" name="description" rows={4}
                placeholder="Enter detailed project requirements, scope, and notes..."
                className="flex w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  text-slate-900 placeholder:text-slate-400 resize-y transition-colors" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/projects">
            <Button type="button" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm min-w-[140px]">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
