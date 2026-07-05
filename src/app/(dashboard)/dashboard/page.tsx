import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // Fetch some real stats from the database
  const employeeCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  const pendingTaskCount = await prisma.task.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Projects</CardTitle>
            <FolderKanban className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{projectCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Active construction sites</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</CardTitle>
            <CheckSquare className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{taskCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Across all projects</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</CardTitle>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{pendingTaskCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Employees</CardTitle>
            <Users className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{employeeCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Registered team members</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 col-span-1 lg:col-span-2 rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              No recent activity to display. Start by creating a project!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
