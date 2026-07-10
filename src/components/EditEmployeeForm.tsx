"use client";

import { useActionState } from "react";
import { editEmployeeAction } from "@/actions/employee.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCog } from "lucide-react";
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

export function EditEmployeeForm({ employee }: { employee: any }) {
  const editActionWithId = editEmployeeAction.bind(null, employee.id);
  const [state, formAction, isPending] = useActionState(editActionWithId, undefined);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Edit Employee</h2>
          <p className="text-slate-500">Update {employee.name}'s details.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <form action={formAction}>
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCog className="w-5 h-5 text-blue-700" />
              </div>
              <CardTitle className="text-lg">Employee Details</CardTitle>
            </div>
            <CardDescription>
              Update the employee's system access and role. Leave password blank to keep it unchanged.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                {state.error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={employee.name}
                  placeholder="e.g. Jane Doe"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={employee.email}
                  placeholder="jane.doe@company.com"
                  required
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700 font-medium">System Role *</Label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue={employee.role}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-900"
                >
                  <option value="">Select a role...</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label htmlFor="password" className="text-slate-700 font-medium">New Password (Optional)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="bg-white border-slate-300 focus-visible:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 pt-6 bg-slate-50">
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
