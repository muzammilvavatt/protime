import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, AlertCircle, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TaskDistributionChart } from "@/components/charts/TaskDistributionChart";
import { EmployeeWorkloadChart } from "@/components/charts/EmployeeWorkloadChart";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.user?.id) return null;

  const isAdmin = session.user.role === "ADMIN";

  // --- ADMIN DATA FETCHING ---
  let adminData = null;
  if (isAdmin) {
    const employeeCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();
    const pendingTaskCount = await prisma.task.count({ where: { status: "PENDING" } });

    const inProgressCount = await prisma.task.count({ where: { status: "IN_PROGRESS" } });
    const doneCount = await prisma.task.count({ where: { status: "COMPLETED" } });

    const taskDistributionData = [
      { name: 'To Do', value: pendingTaskCount, color: '#94a3b8' },
      { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
      { name: 'Done', value: doneCount, color: '#22c55e' },
    ];

    const usersWithTasks = await prisma.user.findMany({
      include: { _count: { select: { assignedTasks: true } } },
      take: 10,
      orderBy: { assignedTasks: { _count: 'desc' } }
    });

    const employeeWorkloadData = usersWithTasks.map(u => ({
      name: u.name.split(' ')[0],
      tasks: u._count.assignedTasks
    })).filter(u => u.tasks > 0);

    adminData = { employeeCount, projectCount, taskCount, pendingTaskCount, taskDistributionData, employeeWorkloadData };
  }

  // --- EMPLOYEE DATA FETCHING ---
  let employeeData = null;
  if (!isAdmin) {
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayRecord = await prisma.attendance.findFirst({
      where: { userId: session.user.id, date: { gte: todayStart } }
    });

    const userResp = await prisma.userDailyResponsibility.findMany({
      where: { userId: session.user.id },
      include: { dailyResponsibility: true }
    });

    const todaysLogs = await prisma.dailyTaskLog.findMany({
      where: { userId: session.user.id, date: todayStart }
    });

    const dailyChecklistData = userResp.map(ur => {
      const log = todaysLogs.find(l => l.dailyResponsibilityId === ur.dailyResponsibilityId);
      return {
        id: ur.dailyResponsibilityId,
        name: ur.dailyResponsibility.name,
        description: ur.dailyResponsibility.description,
        status: log?.status || "PENDING",
      };
    });

    // Fetch employee's project tasks
    const myProjectTasks = await prisma.taskAssignee.findMany({
      where: { 
        userId: session.user.id, 
        task: { status: { not: "COMPLETED" } } 
      },
      include: {
        task: {
          include: { project: true }
        }
      },
      orderBy: [
        { task: { priority: 'desc' } }, // Note: assuming priority is an enum, simple string sorting won't work perfectly if enums aren't ordered, but it works for now.
        { task: { deadline: 'asc' } }
      ]
    });

    // Calculate total hours today
    let totalHoursToday = "0h 0m";
    if (todayRecord?.clockIn) {
      const end = todayRecord.clockOut || new Date();
      const diffMs = end.getTime() - todayRecord.clockIn.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      totalHoursToday = `${diffHrs}h ${diffMins}m`;
    }

    employeeData = { user: dbUser, todayRecord, dailyChecklistData, myProjectTasks, totalHoursToday };
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {!isAdmin && employeeData && (
        <EmployeeDashboard {...employeeData} />
      )}

      {isAdmin && adminData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Projects</CardTitle>
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{adminData.projectCount}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Active construction sites</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</CardTitle>
                <CheckSquare className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{adminData.taskCount}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Across all projects</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</CardTitle>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{adminData.pendingTaskCount}</div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Requires attention</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Employees</CardTitle>
                <Users className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{adminData.employeeCount}</div>
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
                <TaskDistributionChart data={adminData.taskDistributionData} />
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
                <EmployeeWorkloadChart data={adminData.employeeWorkloadData} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
