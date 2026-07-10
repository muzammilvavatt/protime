import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { DailyChecklist } from "@/components/DailyChecklist";
import Link from "next/link";
import { Button } from "./ui/button";

interface EmployeeDashboardProps {
  user: any;
  todayRecord: any;
  dailyChecklistData: any[];
  myProjectTasks: any[];
  totalHoursToday: string;
}

export function EmployeeDashboard({ 
  user, 
  todayRecord, 
  dailyChecklistData, 
  myProjectTasks,
  totalHoursToday 
}: EmployeeDashboardProps) {
  const firstName = user.name.split(' ')[0];
  const pendingChecklistCount = dailyChecklistData.filter(t => t.status === "PENDING").length;
  
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayStr = new Date().toLocaleDateString(undefined, options);

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {firstName}! 👋</h1>
          <p className="text-blue-100 font-medium">{todayStr}</p>
        </div>
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/4"></div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Pending Project Tasks</CardTitle>
            <FolderKanban className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{myProjectTasks.length}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Require your attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Daily Checklist Tasks</CardTitle>
            <CheckSquare className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{pendingChecklistCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Remaining for today</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Hours Logged Today</CardTitle>
            <Clock className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{totalHoursToday}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Based on punch clock</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Project Tasks (Takes up 2/3 space on large screens) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <FolderKanban className="w-5 h-5 mr-2 text-blue-600" />
                My Project Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {myProjectTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <CheckSquare className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-medium">You have no pending project tasks!</p>
                    <p className="text-sm mt-1">Great job keeping up.</p>
                  </div>
                ) : (
                  myProjectTasks.map((assignment: any) => {
                    const task = assignment.task;
                    const isUrgent = task.priority === "URGENT" || task.priority === "HIGH";
                    
                    return (
                      <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                              {task.priority}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {task.project.name}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900">{task.name}</h4>
                          {task.deadline && (
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <Link href={`/dashboard/tasks/${task.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto text-blue-700 border-blue-200 hover:bg-blue-50">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Daily Productivity */}
        <div className="xl:col-span-1 space-y-6">
          <AttendanceTracker todayRecord={todayRecord} />
          <DailyChecklist tasks={dailyChecklistData} />
        </div>

      </div>
    </div>
  );
}
