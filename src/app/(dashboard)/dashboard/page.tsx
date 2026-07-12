import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderKanban,
  CheckSquare,
  Users,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart3,
  Plus,
  ClipboardList,
  FileBarChart2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TaskDistributionChart } from "@/components/charts/TaskDistributionChart";
import { EmployeeWorkloadChart } from "@/components/charts/EmployeeWorkloadChart";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) return null;

  const isAdmin = session.user.role === "ADMIN";

  // --- ADMIN DATA FETCHING ---
  let adminData = null;
  if (isAdmin) {
    const [
      employeeCount,
      projectCount,
      taskCount,
      pendingTaskCount,
      inProgressCount,
      doneCount,
      usersWithTasks,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.user.findMany({
        include: { _count: { select: { assignedTasks: true } } },
        take: 10,
        orderBy: { assignedTasks: { _count: "desc" } },
      }),
    ]);

    const taskDistributionData = [
      { name: "To Do", value: pendingTaskCount, color: "#94a3b8" },
      { name: "In Progress", value: inProgressCount, color: "#3b82f6" },
      { name: "Done", value: doneCount, color: "#22c55e" },
    ];

    const employeeWorkloadData = usersWithTasks
      .map((u) => ({
        name: u.name.split(" ")[0],
        tasks: u._count.assignedTasks,
      }))
      .filter((u) => u.tasks > 0);

    adminData = {
      employeeCount,
      projectCount,
      taskCount,
      pendingTaskCount,
      taskDistributionData,
      employeeWorkloadData,
    };
  }

  // --- EMPLOYEE DATA FETCHING ---
  let employeeData = null;
  if (!isAdmin) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [dbUser, todayRecord, userResp, todaysLogs, myProjectTasks] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: session.user.id } }),
        prisma.attendance.findFirst({
          where: { userId: session.user.id, date: { gte: todayStart } },
        }),
        prisma.userDailyResponsibility.findMany({
          where: { userId: session.user.id },
          include: { dailyResponsibility: true },
        }),
        prisma.dailyTaskLog.findMany({
          where: { userId: session.user.id, date: todayStart },
        }),
        prisma.taskAssignee.findMany({
          where: {
            userId: session.user.id,
            task: { status: { not: "COMPLETED" } },
          },
          include: {
            task: {
              include: { project: true },
            },
          },
          orderBy: [
            { task: { priority: "desc" } },
            { task: { deadline: "asc" } },
          ],
        }),
      ]);

    const dailyChecklistData = userResp.map((ur) => {
      const log = todaysLogs.find(
        (l) => l.dailyResponsibilityId === ur.dailyResponsibilityId
      );
      return {
        id: ur.dailyResponsibilityId,
        name: ur.dailyResponsibility.name,
        description: ur.dailyResponsibility.description,
        status: log?.status || "PENDING",
      };
    });

    // Calculate total hours today
    let totalHoursToday = "0h 0m";
    if (todayRecord?.clockIn) {
      const end = todayRecord.clockOut || new Date();
      const diffMs = end.getTime() - todayRecord.clockIn.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.round(
        (diffMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      totalHoursToday = `${diffHrs}h ${diffMins}m`;
    }

    employeeData = {
      user: dbUser,
      todayRecord,
      dailyChecklistData,
      myProjectTasks,
      totalHoursToday,
    };
  }

  // Greeting helper
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {!isAdmin && employeeData && <EmployeeDashboard {...employeeData} />}

      {isAdmin && adminData && (
        <>
          {/* ── Welcome Strip ── */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {greeting}, Admin 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{todayLabel}</p>
            </div>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 no-print">
              <Link href="/dashboard/projects/add">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </Link>
              <Link href="/dashboard/tasks/add">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium ring-1 ring-slate-200 transition-colors shadow-sm">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Assign Task
                </button>
              </Link>
              <Link href="/dashboard/reports">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium ring-1 ring-slate-200 transition-colors shadow-sm">
                  <FileBarChart2 className="w-4 h-4 text-indigo-500" />
                  View Reports
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children animate-fade-in-up">
            {/* Projects */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-slate-900">
                  {adminData.projectCount}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Total Projects
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-b-xl" />
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-slate-900">
                  {adminData.taskCount}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Total Tasks
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-b-xl" />
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-slate-900">
                  {adminData.pendingTaskCount}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Pending Tasks
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-b-xl" />
            </div>

            {/* Employees */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-slate-900">
                  {adminData.employeeCount}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Employees
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-violet-600 rounded-b-xl" />
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                  <PieChartIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <TaskDistributionChart data={adminData.taskDistributionData} />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
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
