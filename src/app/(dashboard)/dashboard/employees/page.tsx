import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, UserCircle, CheckCircle2, XCircle } from "lucide-react";
import { toggleEmployeeStatus } from "@/actions/employee.actions";

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-zinc-400">Manage your team members and their roles.</p>
        </div>
        <Link href="/dashboard/employees/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Team Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-y border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserCircle className="w-8 h-8 text-zinc-500 mr-3" />
                        <div>
                          <div className="font-medium text-zinc-100">{employee.name}</div>
                          <div className="text-zinc-500 text-xs">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-medium">
                        {employee.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {employee.isActive ? (
                        <span className="flex items-center text-green-500 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500 text-xs font-medium">
                          <XCircle className="w-4 h-4 mr-1.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={toggleEmployeeStatus.bind(null, employee.id, employee.isActive)}>
                        <Button 
                          type="submit" 
                          variant="outline" 
                          size="sm"
                          className={employee.isActive 
                            ? "border-red-500/30 text-red-400 hover:bg-red-500/10" 
                            : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                          }
                        >
                          {employee.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No employees found. Add your first team member!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
