import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Plus, Pencil, ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/session";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteEmployeeAction } from "@/actions/employee.actions";
import { redirect } from "next/navigation";

export default async function AdminsPage() {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Administrators</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage admins with full access to the system.</p>
          </div>
        </div>
        <Link href="/dashboard/employees/add">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 h-10 px-4 rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Administrator
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Administrator</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {admin.profilePictureUrl ? (
                      <img src={admin.profilePictureUrl} alt={admin.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold ring-2 ring-white shadow-sm">
                        {admin.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{admin.name}</p>
                      <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-medium">{admin.email}</span>
                    {admin.phoneNumber && <span className="text-slate-500 text-xs mt-0.5">{admin.phoneNumber}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {new Date(admin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/employees/${admin.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-8 text-slate-600 hover:text-indigo-600">
                        <Pencil className="w-4 h-4 mr-1.5" />
                        Edit
                      </Button>
                    </Link>
                    {session.user?.id !== admin.id && (
                      <DeleteButton
                        id={admin.id}
                        action={deleteEmployeeAction}
                        title="Delete Administrator"
                        description="Are you sure you want to remove this administrator? This action cannot be undone."
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                  <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-900">No administrators found</p>
                  <p className="text-sm mt-1">Add your first system administrator to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
