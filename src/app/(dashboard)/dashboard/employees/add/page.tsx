"use client";

import { useActionState } from "react";
import { createEmployeeAction } from "@/actions/employee.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

const ROLES = [
  "ADMIN",
  "SITE_INSPECTOR",
  "SITE_PLANNER",
  "FLOOR_PLANNER",
  "RULE_CHART_EXPERT",
  "NOC_FIRE",
  "NOC_PCB",
  "NOC_RTP",
  "ARCHITECT",
  "CIVIL_ENGINEER",
  "STRUCTURAL_ENGINEER",
  "DOCUMENTATION_OFFICER",
  "OTHER"
];

export default function AddEmployeePage() {
  const [state, formAction, isPending] = useActionState(createEmployeeAction, undefined);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Employee</h2>
          <p className="text-slate-500">Create a new account for your team member.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Employee Details
          </CardTitle>
          <CardDescription className="text-slate-500">
            They will use their email and password to log in.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-5 pt-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                {state.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@consultancy.com"
                required
                className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Temporary Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 font-medium">System Role</Label>
              <select
                id="role"
                name="role"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
              >
                <option value="">Select a role...</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 pt-6 bg-slate-50 rounded-b-xl">
            <Link href="/dashboard/employees">
              <Button type="button" variant="ghost" className="hover:bg-slate-200 text-slate-700">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Employee"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
