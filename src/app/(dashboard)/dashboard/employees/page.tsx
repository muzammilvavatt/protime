import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCircle, CheckCircle2, XCircle } from "lucide-react";
import { toggleEmployeeStatus } from "@/actions/employee.actions";

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employees</h2>
          <p className="text-slate-500">Manage your team members and their roles.</p>
        </div>
        <Link href="/dashboard/employees/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Role</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Joined</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UserCircle className="w-8 h-8 text-slate-400 mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                      {employee.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {employee.isActive ? (
                      <span className="flex items-center text-green-600 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-xs font-medium">
                        <XCircle className="w-4 h-4 mr-1.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleEmployeeStatus.bind(null, employee.id, employee.isActive)}>
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="sm"
                        className={employee.isActive 
                          ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No employees found. Add your first team member!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
