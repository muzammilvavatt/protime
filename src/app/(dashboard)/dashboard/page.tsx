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
  Activity,
  UserPlus,
  ArrowRight,
  Clock,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { EmployeeDashboard } from "@/components/EmployeeDashboard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) return null;

  const isAdmin = session.user.role === "ADMIN";
  const adminUser = isAdmin ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }) : null;
  const adminName = adminUser?.name?.split(" ")[0] || "Admin";

  // --- ADMIN DATA FETCHING ---
  let adminData = null;
  if (isAdmin) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      employeeCount,
      activeEmployeeCount,
      projectCount,
      activeProjectCount,
      taskCount,
      pendingTaskCount,
      inProgressCount,
      doneCount,
      reviewCount,
      overdueTasks,
      upcomingDeadlineTasks,
      todayAttendanceCount,
      topActiveProjects,
      topPerformers,
      recentTaskUpdates,
      recentEmployees,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { status: "REVIEW" } }),
      // Overdue: has deadline, deadline passed, not completed
      prisma.task.findMany({
        where: {
          deadline: { lt: new Date() },
          status: { not: "COMPLETED" },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          priority: true,
          project: { select: { name: true } },
          assignees: { select: { user: { select: { name: true } } }, take: 1 },
        },
        orderBy: { deadline: "asc" },
        take: 5,
      }),
      // Upcoming deadlines: next 7 days
      prisma.task.findMany({
        where: {
          deadline: { gte: new Date(), lte: nextWeek },
          status: { not: "COMPLETED" },
        },
        select: {
          id: true,
          name: true,
          deadline: true,
          priority: true,
          status: true,
          project: { select: { name: true } },
        },
        orderBy: { deadline: "asc" },
        take: 5,
      }),
      // Today's attendance
      prisma.attendance.count({
        where: { date: { gte: todayStart } },
      }),
      // Top active projects
      prisma.project.findMany({
        where: { status: "ACTIVE" },
        include: {
          tasks: { select: { status: true } },
          _count: { select: { tasks: true } }
        },
        orderBy: { updatedAt: "desc" },
        take: 4
      }),
      // Top performers
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          profilePictureUrl: true,
          role: true,
          _count: {
            select: {
              assignedTasks: {
                where: { task: { status: "COMPLETED" } }
              }
            }
          }
        },
        orderBy: {
          assignedTasks: { _count: "desc" }
        },
        take: 4
      }),
      prisma.task.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
          project: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, createdAt: true, role: true },
      }),
    ]);


    adminData = {
      employeeCount,
      activeEmployeeCount,
      projectCount,
      activeProjectCount,
      taskCount,
      pendingTaskCount,
      inProgressCount,
      reviewCount,
      overdueTasks,
      upcomingDeadlineTasks,
      todayAttendanceCount,
      topActiveProjects,
      topPerformers,
      recentTaskUpdates,
      recentEmployees,
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

    const globalSetting = await prisma.globalSetting.findUnique({
      where: { id: "global" }
    });

    employeeData = {
      user: dbUser,
      todayRecord,
      dailyChecklistData,
      myProjectTasks,
      totalHoursToday,
      requireSelfieVerification: globalSetting?.requireSelfieVerification ?? true,
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

  // Attendance percentage for admin
  const attendancePercent = adminData
    ? Math.round((adminData.todayAttendanceCount / Math.max(adminData.activeEmployeeCount, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {!isAdmin && employeeData && <EmployeeDashboard {...employeeData} />}

      {isAdmin && adminData && (
        <>
          {/* ── Welcome Strip ── */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm px-6 py-5 relative overflow-hidden">
            {/* decorative */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {greeting}, {adminName} 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{todayLabel}</p>
            </div>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 no-print relative z-10">
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
                  Reports
                </button>
              </Link>
            </div>
          </div>

          {/* ── Overdue Tasks Alert ── */}
          {adminData.overdueTasks.length > 0 && (
            <div className="animate-fade-in-up bg-rose-50 ring-1 ring-rose-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-rose-800">
                  {adminData.overdueTasks.length} overdue task{adminData.overdueTasks.length > 1 ? "s" : ""} need attention
                </p>
                <div className="mt-2 space-y-1.5">
                  {adminData.overdueTasks.slice(0, 3).map((task) => (
                    <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                      <div className="flex items-center gap-2 text-xs text-rose-700 hover:text-rose-900 transition-colors group">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-semibold truncate group-hover:underline">{task.name}</span>
                        <span className="text-rose-500 shrink-0">· {task.project.name}</span>
                        {task.deadline && (
                          <span className="text-rose-400 shrink-0 ml-auto">
                            Due {new Date(task.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {adminData.overdueTasks.length > 3 && (
                  <Link href="/dashboard/tasks" className="text-xs text-rose-600 font-semibold mt-2 inline-flex items-center gap-1 hover:text-rose-800">
                    View all overdue tasks <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── Stat Cards Row 1: Key Metrics (clickable) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children animate-fade-in-up">
            {/* Projects */}
            <Link href="/dashboard/projects">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden hover:ring-indigo-300 hover:shadow-md transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0 group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors">
                    <FolderKanban className="w-5 h-5 text-indigo-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {adminData.projectCount}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Total Projects</p>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-1">{adminData.activeProjectCount} active</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-b-xl" />
              </div>
            </Link>

            {/* Tasks */}
            <Link href="/dashboard/tasks">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden hover:ring-emerald-300 hover:shadow-md transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {adminData.taskCount}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Total Tasks</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">{adminData.inProgressCount} in progress</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-b-xl" />
              </div>
            </Link>

            {/* Pending + Review */}
            <Link href="/dashboard/tasks">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden hover:ring-amber-300 hover:shadow-md transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shrink-0 group-hover:from-amber-100 group-hover:to-amber-200 transition-colors">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {adminData.pendingTaskCount}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Pending Tasks</p>
                  {adminData.reviewCount > 0 && (
                    <p className="text-[10px] text-violet-600 font-semibold mt-1">{adminData.reviewCount} awaiting review</p>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-b-xl" />
              </div>
            </Link>

            {/* Employees */}
            <Link href="/dashboard/employees">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex flex-col gap-3 relative overflow-hidden hover:ring-violet-300 hover:shadow-md transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center shrink-0 group-hover:from-violet-100 group-hover:to-violet-200 transition-colors">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {adminData.employeeCount}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Employees</p>
                  <p className="text-[10px] text-violet-600 font-semibold mt-1">{adminData.activeEmployeeCount} active</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-violet-600 rounded-b-xl" />
              </div>
            </Link>
          </div>

          {/* ── Row 2: Today's Attendance + Upcoming Deadlines ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up">
            {/* Today's Attendance Card */}
            <Link href="/dashboard/attendance">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex items-center gap-5 hover:ring-indigo-300 hover:shadow-md transition-all group cursor-pointer">
                {/* Circular Progress */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                      cx="36" cy="36" r="30" fill="none"
                      stroke={attendancePercent >= 80 ? "#22c55e" : attendancePercent >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(attendancePercent / 100) * 188.5} 188.5`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">{attendancePercent}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">Today&apos;s Attendance</h3>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all ml-auto" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {adminData.todayAttendanceCount}
                    <span className="text-base font-medium text-slate-400"> / {adminData.activeEmployeeCount}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">employees clocked in today</p>
                </div>
              </div>
            </Link>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
                <span className="text-[10px] text-slate-400 font-medium ml-1">next 7 days</span>
              </div>
              {adminData.upcomingDeadlineTasks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-400 font-medium">No upcoming deadlines this week 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {adminData.upcomingDeadlineTasks.map((task) => {
                    const daysLeft = task.deadline
                      ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    const urgencyClass = daysLeft <= 1
                      ? "text-rose-600 bg-rose-50 ring-rose-200"
                      : daysLeft <= 3
                        ? "text-amber-600 bg-amber-50 ring-amber-200"
                        : "text-slate-600 bg-slate-50 ring-slate-200";
                    return (
                      <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                        <div className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{task.project.name}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 shrink-0 ${urgencyClass}`}>
                            {daysLeft <= 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Lists (2/3 width) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Top Active Projects */}
              <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0 flex flex-col h-[380px]">
                <CardHeader className="border-b border-slate-100 pb-3 pt-4 px-5 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-sm font-bold text-slate-800">
                      <FolderKanban className="w-4 h-4 mr-2 text-indigo-500" />
                      Top Active Projects
                    </CardTitle>
                    <Link href="/dashboard/projects" className="text-[10px] text-indigo-600 font-semibold hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <div className="divide-y divide-slate-50">
                    {adminData.topActiveProjects.map((project) => {
                      const completed = project.tasks.filter(t => t.status === "COMPLETED").length;
                      const total = project._count.tasks;
                      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                          <div className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">{project.name}</p>
                              <span className="text-[10px] font-bold text-slate-500">{completed}/{total} tasks</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {adminData.topActiveProjects.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">No active projects</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0 flex flex-col h-[380px]">
                <CardHeader className="border-b border-slate-100 pb-3 pt-4 px-5 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-sm font-bold text-slate-800">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                      Top Performers
                    </CardTitle>
                    <Link href="/dashboard/employees" className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <div className="divide-y divide-slate-50">
                    {adminData.topPerformers.map((emp) => {
                      const initials = emp.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      const completedTasks = emp._count.assignedTasks;
                      return (
                        <Link key={emp.id} href={`/dashboard/employees/${emp.id}/edit`}>
                          <div className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                              {emp.profilePictureUrl ? (
                                <img src={emp.profilePictureUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 capitalize">{emp.role.toLowerCase().replace(/_/g, " ")}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-200">
                                {completedTasks} <CheckSquare className="w-3 h-3 ml-1 opacity-70" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {adminData.topPerformers.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">No tasks completed yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed (1/3 width) */}
            <div className="space-y-5">
              {/* Recent Task Activity */}
              <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0">
                <CardHeader className="border-b border-slate-100 pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-800">
                    <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {adminData.recentTaskUpdates.map((task) => {
                      const statusColors: Record<string, string> = {
                        COMPLETED: "bg-emerald-400",
                        IN_PROGRESS: "bg-indigo-400",
                        REVIEW: "bg-violet-400",
                        PENDING: "bg-slate-300",
                      };
                      return (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors group">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${statusColors[task.status] ?? "bg-slate-300"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{task.project.name} · {task.status.replace(/_/g, " ")}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* New Team Members */}
              <Card className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm border-0">
                <CardHeader className="border-b border-slate-100 pb-3 pt-4 px-5">
                  <CardTitle className="flex items-center text-sm font-bold text-slate-800">
                    <UserPlus className="w-4 h-4 mr-2 text-violet-500" />
                    New Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {adminData.recentEmployees.map((emp) => {
                      const initials = emp.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <Link key={emp.id} href={`/dashboard/employees/${emp.id}/edit`}>
                          <div className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{emp.role.toLowerCase()}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-50">
                    <Link href="/dashboard/employees" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                      View all employees <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
