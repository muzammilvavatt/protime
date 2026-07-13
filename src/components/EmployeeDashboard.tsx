import { FolderKanban, CheckSquare, Clock, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { DailyChecklist } from "@/components/DailyChecklist";
import { EmployeeTaskActions } from "@/components/EmployeeTaskActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { User, Attendance, Task, Project, TaskAssignee } from "@prisma/client";

interface EmployeeDashboardProps {
  user: Partial<User> | null;
  todayRecord: Partial<Attendance> | null;
  dailyChecklistData: { id: string; name: string; description: string | null; status: string; }[];
  myProjectTasks: (TaskAssignee & { task: Task & { project: Project } })[];
  totalHoursToday: string;
  requireSelfieVerification: boolean;
}

const getPriorityBorderClass = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "border-l-rose-500";
    case "MEDIUM":
      return "border-l-amber-400";
    default:
      return "border-l-slate-300";
  }
};

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

export function EmployeeDashboard({
  user,
  todayRecord,
  dailyChecklistData,
  myProjectTasks,
  totalHoursToday,
  requireSelfieVerification,
}: EmployeeDashboardProps) {
  const firstName = user?.name ? user.name.split(" ")[0] : "Employee";
  const pendingChecklistCount = dailyChecklistData.filter((t) => t.status === "PENDING").length;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };
  const todayStr = new Date().toLocaleDateString("en-IN", options);
  const isClockedIn = !!(todayRecord && !todayRecord.clockOut);
  const isShiftComplete = !!(todayRecord?.clockOut);

  // Urgent tasks count
  const urgentTasksCount = myProjectTasks.filter(
    (a) => a.task.priority === "URGENT" || a.task.priority === "HIGH"
  ).length;

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm px-6 py-5 relative overflow-hidden animate-fade-in-up">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-20 h-20 bg-violet-50 rounded-full blur-2xl pointer-events-none opacity-60" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5 mt-1">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              {todayStr}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* hours badge */}
            {isClockedIn && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 ring-1 ring-slate-200 rounded-xl px-4 py-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800">{totalHoursToday}</span>
                <span className="text-xs text-slate-500">today</span>
              </div>
            )}
            {/* clock-in status pill */}
            {isShiftComplete ? (
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 ring-1 ring-slate-200 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Shift Complete
              </span>
            ) : isClockedIn ? (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Clocked In
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Not Clocked In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Hero: Attendance (left/large) + Checklist (right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Attendance - takes 3/5 of the grid */}
        <div className="xl:col-span-3">
          <AttendanceTracker
            todayRecord={todayRecord}
            user={user}
            requireSelfieVerification={requireSelfieVerification}
          />
        </div>

        {/* Daily Checklist + Mini Stats - takes 2/5 */}
        <div className="xl:col-span-2 space-y-5">

          {/* Mini stat pills */}
          <div className="grid grid-cols-3 gap-3">
            <Link href="/dashboard/tasks">
              <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-3 text-center hover:ring-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {myProjectTasks.length}
                </div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">
                  Active Tasks
                </p>
              </div>
            </Link>
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-3 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {pendingChecklistCount > 0 ? (
                  <span className="text-amber-600">{pendingChecklistCount}</span>
                ) : (
                  <span className="text-emerald-600">✓</span>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">
                Checklist Left
              </p>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-3 text-center">
              <div className="text-2xl font-bold text-slate-900">{totalHoursToday}</div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">
                Hours Today
              </p>
            </div>
          </div>

          {/* Daily Checklist inline */}
          <DailyChecklist tasks={dailyChecklistData} />

          {/* Urgent alert */}
          {urgentTasksCount > 0 && (
            <div className="bg-rose-50 ring-1 ring-rose-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                <span className="text-rose-600 text-base">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-rose-800">
                  {urgentTasksCount} urgent task{urgentTasksCount > 1 ? "s" : ""} need attention
                </p>
                <p className="text-xs text-rose-600 mt-0.5">Prioritise these today</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── My Project Tasks (full width) ── */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        {/* Card Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">My Active Project Tasks</h2>
          {myProjectTasks.length > 0 && (
            <span className="ml-auto bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-xs font-bold px-2 py-0.5 rounded-full">
              {myProjectTasks.length}
            </span>
          )}
          <Link href="/dashboard/tasks" className="ml-2 text-xs text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Task List */}
        <div className="divide-y divide-slate-100">
          {myProjectTasks.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckSquare className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-sm text-slate-400">You have no pending project tasks.</p>
            </div>
          ) : (
            myProjectTasks.map((assignment) => {
              const task = assignment.task;
              return (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-slate-50/70 transition-colors border-l-4 ${getPriorityBorderClass(task.priority)} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getPriorityBadgeClass(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                        {task.project.name}
                      </span>
                      {task.deadline && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            new Date(task.deadline) < new Date()
                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(task.deadline).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{task.name}</h4>
                    {task.allottedHours && (
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Allotted:{" "}
                        <span className="font-semibold ml-1">{task.allottedHours} hrs</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-slate-700 border-slate-300 hover:border-indigo-300 hover:text-indigo-700 text-xs"
                      >
                        Details
                      </Button>
                    </Link>
                    <EmployeeTaskActions
                      taskId={task.id}
                      status={task.status}
                      allottedHours={task.allottedHours}
                      timeSpentMs={task.timeSpentMs}
                      lastTimerStart={task.lastTimerStart}
                      isClockedIn={isClockedIn}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
