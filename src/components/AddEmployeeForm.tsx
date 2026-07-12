"use client";

import { useActionState } from "react";
import { createEmployeeAction } from "@/actions/employee.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

export function AddEmployeeForm({ 
  projectRoles, 
  dailyResponsibilities 
}: { 
  projectRoles: any[], 
  dailyResponsibilities: any[] 
}) {
  const [state, formAction, isPending] = useActionState(createEmployeeAction, undefined);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Employee</h2>
          <p className="text-slate-500 text-sm">Create a new account for your team member.</p>
        </div>
      </div>

      <form action={formAction}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl md:col-span-1 border-0">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-bold">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                </div>
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {state?.error && (
                <div className="p-4 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                  {state.error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">WhatsApp Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+919876543210"
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
                <p className="text-xs text-slate-500">Include country code for WhatsApp task assignments.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@consultancy.com"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Temporary Password <span className="text-rose-500">*</span></Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-indigo-500 text-slate-900 rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700">System Access Level <span className="text-rose-500">*</span></Label>
                <select
                  id="role"
                  name="role"
                  required
                  className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <p className="text-xs text-slate-500">Admins have full access. Employees only see their tasks.</p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-1 space-y-6">
            <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl border-0">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold">Project Roles</CardTitle>
                <CardDescription className="text-sm text-slate-500">Select all roles this employee can perform.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 h-64 overflow-y-auto">
                <div className="space-y-3">
                  {projectRoles.map(role => (
                    <label key={role.id} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <input 
                        type="checkbox" 
                        name="projectRoles" 
                        value={role.id} 
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{role.name}</span>
                        {role.description && <span className="text-xs text-slate-500 mt-0.5">{role.description}</span>}
                      </div>
                    </label>
                  ))}
                  {projectRoles.length === 0 && <p className="text-sm text-slate-500 p-2">No roles defined.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl border-0">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold">Daily Responsibilities</CardTitle>
                <CardDescription className="text-sm text-slate-500">Select recurring tasks for their daily checklist.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 h-64 overflow-y-auto">
                <div className="space-y-3">
                  {dailyResponsibilities.map(task => (
                    <label key={task.id} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <input 
                        type="checkbox" 
                        name="dailyResponsibilities" 
                        value={task.id} 
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{task.name}</span>
                        {task.description && <span className="text-xs text-slate-500 mt-0.5">{task.description}</span>}
                      </div>
                    </label>
                  ))}
                  {dailyResponsibilities.length === 0 && <p className="text-sm text-slate-500 p-2">No responsibilities defined.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link href="/dashboard/employees">
            <Button type="button" variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm min-w-[150px]"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : "Create Employee"}
          </Button>
        </div>
      </form>
    </div>
  );
}
