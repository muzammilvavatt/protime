import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, AlertCircle, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TaskDistributionChart } from "@/components/charts/TaskDistributionChart";
import { EmployeeWorkloadChart } from "@/components/charts/EmployeeWorkloadChart";

export default async function DashboardPage() {
  // Fetch some real stats from the database
  const employeeCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();
  const pendingTaskCount = await prisma.task.count({
    where: { status: "PENDING" },
  });

  // Fetch data for Task Distribution Chart
  const todoCount = pendingTaskCount;
  const inProgressCount = await prisma.task.count({ where: { status: "IN_PROGRESS" } });
  const doneCount = await prisma.task.count({ where: { status: "COMPLETED" } });

  const taskDistributionData = [
    { name: 'To Do', value: todoCount, color: '#94a3b8' },      // slate-400
    { name: 'In Progress', value: inProgressCount, color: '#3b82f6' }, // blue-500
    { name: 'Done', value: doneCount, color: '#22c55e' },       // green-500
  ];

  // Fetch data for Employee Workload Chart (Tasks per user)
  const usersWithTasks = await prisma.user.findMany({
    include: {
      _count: {
        select: { assignedTasks: true }
      }
    },
    // Only show employees that have tasks, or top 5
    take: 10,
    orderBy: {
      assignedTasks: {
        _count: 'desc'
      }
    }
  });

  const employeeWorkloadData = usersWithTasks.map(u => ({
    name: u.name.split(' ')[0], // First name only for cleaner chart
    tasks: u._count.assignedTasks
  })).filter(u => u.tasks > 0);

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
        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
              <PieChartIcon className="w-5 h-5 mr-2 text-blue-600" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TaskDistributionChart data={taskDistributionData} />
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Employee Workload
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <EmployeeWorkloadChart data={employeeWorkloadData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
