import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendanceDatePicker } from "@/components/AttendanceDatePicker";

export default async function AttendanceAdminPage(props: { searchParams?: Promise<{ date?: string }> }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  // Default to today
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

  if (searchParams?.date) {
    const parsed = new Date(searchParams.date);
    if (!isNaN(parsed.getTime())) {
      selectedDate = parsed;
      selectedDate.setHours(0, 0, 0, 0);
    }
  }

  // Get start and end of selected date
  const startOfDay = new Date(selectedDate);
  const endOfDay = new Date(selectedDate);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Fetch all users
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  // Fetch attendance records for the selected date
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });

  // Map users to their attendance status
  const attendanceMap = new Map(attendances.map(a => [a.userId, a]));

  const formatTime = (date?: Date | null) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateHours = (inTime: Date, outTime?: Date | null) => {
    if (!outTime) return "Working...";
    const diffMs = outTime.getTime() - inTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const dateStr = selectedDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Log</h2>
          <p className="text-slate-500">Track employee clock-ins and working hours.</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/dashboard/attendance/reports">
            <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
              <CalendarIcon className="w-4 h-4 mr-2" />
              View Period Report
            </Button>
          </Link>
          <AttendanceDatePicker defaultValue={dateStr} />
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => {
                const record = attendanceMap.get(user.id);
                const isAbsent = !record;
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p>{user.name}</p>
                        <p className="text-xs text-slate-500 font-normal">{user.role.replace(/_/g, " ")}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAbsent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Absent
                        </span>
                      ) : record.status === "LATE" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Present
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {record ? formatTime(record.clockIn) : "--:--"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {record ? formatTime(record.clockOut) : "--:--"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record ? (
                        <span className={`font-semibold ${!record.clockOut ? 'text-blue-600' : 'text-slate-900'}`}>
                          {calculateHours(record.clockIn, record.clockOut)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0h 0m</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
