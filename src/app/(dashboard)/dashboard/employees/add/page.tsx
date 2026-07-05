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
  "DOCUMENTATION_OFFICER"
];

export default function AddEmployeePage() {
  const [state, formAction, isPending] = useActionState(createEmployeeAction, undefined);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Employee</h2>
          <p className="text-zinc-400">Create a new account for your team member.</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
            Employee Details
          </CardTitle>
          <CardDescription className="text-zinc-400">
            They will use their email and password to log in.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-5">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                {state.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@consultancy.com"
                required
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Temporary Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-zinc-300">System Role</Label>
              <select
                id="role"
                name="role"
                required
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-100"
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
          <CardFooter className="flex justify-end space-x-4 border-t border-zinc-800 pt-6">
            <Link href="/dashboard/employees">
              <Button type="button" variant="ghost" className="hover:bg-zinc-800">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
