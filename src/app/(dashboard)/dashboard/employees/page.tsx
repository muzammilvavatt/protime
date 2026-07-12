import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Plus, CheckCircle2, XCircle, Pencil, Wifi, Building } from "lucide-react";
import { toggleEmployeeStatus, toggleEmployeeWFH, deleteEmployeeAction } from "@/actions/employee.actions";
import { getSession } from "@/lib/session";
import { DeleteButton } from "@/components/DeleteButton";

export default async function EmployeesPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeCount = employees.filter(e => e.isActive).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Team Members</h2>
          <p className="text-slate-500 text-sm mt-0.5">{activeCount} active of {employees.length} total employees</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/employees/add">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Mode</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                {isAdmin && <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => {
                const initials = employee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <tr key={employee.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{employee.name}</div>
                          <div className="text-xs text-slate-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                        {employee.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${employee.isWFH ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-slate-100 text-slate-600'}`}>
                        {employee.isWFH ? <Wifi className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        {employee.isWFH ? "WFH" : "Office"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {employee.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(employee.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <form action={toggleEmployeeWFH.bind(null, employee.id, employee.isWFH)}>
                            <Button type="submit" variant="ghost" size="sm"
                              className={`text-xs h-7 px-2 rounded-lg ${employee.isWFH ? "text-violet-600 hover:bg-violet-50" : "text-slate-500 hover:bg-slate-100"}`}>
                              {employee.isWFH ? "Set Office" : "Set WFH"}
                            </Button>
                          </form>
                          <form action={toggleEmployeeStatus.bind(null, employee.id, employee.isActive)}>
                            <Button type="submit" variant="ghost" size="sm"
                              className={`text-xs h-7 px-2 rounded-lg ${employee.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                              {employee.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </form>
                          <Link href={`/dashboard/employees/${employee.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <form action={deleteEmployeeAction.bind(null, employee.id)}>
                            <DeleteButton itemName="Employee" />
                          </form>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No employees yet</p>
                    <p className="text-slate-400 text-xs mt-1">Add your first team member to get started.</p>
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
