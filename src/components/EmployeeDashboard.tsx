import { FolderKanban, CheckSquare, Clock, AlertCircle, CalendarDays } from "lucide-react";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { DailyChecklist } from "@/components/DailyChecklist";
import { EmployeeTaskActions } from "@/components/EmployeeTaskActions";
import Link from "next/link";
import { Button } from "./ui/button";

interface EmployeeDashboardProps {
  user: any;
  todayRecord: any;
  dailyChecklistData: any[];
  myProjectTasks: any[];
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
  const pendingChecklistCount = dailyChecklistData.filter(
    (t) => t.status === "PENDING"
  ).length;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };
  const todayStr = new Date().toLocaleDateString("en-IN", options);

  const isClockedIn = !!(todayRecord && !todayRecord.clockOut);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              {todayStr}
            </p>
          </div>
          {/* Clock-in status pill */}
          <div className="flex-shrink-0">
            {isClockedIn ? (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Clocked In
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 ring-1 ring-slate-200 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Not Clocked In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1 */}
        <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex items-center gap-4 animate-fade-in-up">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Pending Project Tasks
            </p>
            <div className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {myProjectTasks.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Require your attention</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Daily Checklist Tasks
            </p>
            <div className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {pendingChecklistCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Remaining for today</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Hours Logged Today
            </p>
            <div className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
              {totalHoursToday}
            </div>
            <p className="text-xs text-slate-400 mt-1">Based on punch clock</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Project Tasks */}
        <div className="xl:col-span-2 space-y-6">
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
            </div>

            {/* Task List */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {myProjectTasks.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckSquare className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="font-semibold text-slate-700">All caught up!</p>
                  <p className="text-sm text-slate-400">You have no pending project tasks.</p>
                </div>
              ) : (
                myProjectTasks.map((assignment: any) => {
                  const task = assignment.task;
                  const isUrgent =
                    task.priority === "URGENT" || task.priority === "HIGH";

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

        <div className="xl:col-span-1 space-y-6">
          <AttendanceTracker 
            todayRecord={todayRecord} 
            user={user} 
            requireSelfieVerification={requireSelfieVerification} 
          />
          <DailyChecklist tasks={dailyChecklistData} />
        </div>
      </div>
    </div>
  );
}
