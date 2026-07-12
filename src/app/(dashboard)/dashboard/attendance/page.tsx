import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendanceDatePicker } from "@/components/AttendanceDatePicker";
import { approveAttendancePhotoAction } from "@/actions/attendance.actions";

export default async function AttendanceAdminPage(props: { searchParams?: Promise<{ date?: string }> }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

  if (searchParams?.date) {
    const parsed = new Date(searchParams.date);
    if (!isNaN(parsed.getTime())) {
      selectedDate = parsed;
      selectedDate.setHours(0, 0, 0, 0);
    }
  }

  const startOfDay = new Date(selectedDate);
  const endOfDay = new Date(selectedDate);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const users = await prisma.user.findMany({
    where: { isActive: true, role: "EMPLOYEE" },
    orderBy: { name: 'asc' }
  });

  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: startOfDay, lt: endOfDay } }
  });

  const attendanceMap = new Map(attendances.map(a => [a.userId, a]));

  const formatTime = (date?: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  };

  const calculateHours = (inTime: Date, outTime?: Date | null) => {
    if (!outTime) return "Active";
    const diffMs = outTime.getTime() - inTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const dateStr = selectedDate.toISOString().split('T')[0];
  const presentCount = attendances.length;
  const lateCount = attendances.filter(a => a.status === "LATE").length;
  const absentCount = users.length - presentCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Log</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track employee clock-ins and working hours.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/attendance/reports">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Period Report
            </Button>
          </Link>
          <AttendanceDatePicker defaultValue={dateStr} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
            <p className="text-xs text-slate-500 font-medium">Present</p>
          </div>
        </div>
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{lateCount}</p>
            <p className="text-xs text-slate-500 font-medium">Late Arrivals</p>
          </div>
        </div>
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{absentCount}</p>
            <p className="text-xs text-slate-500 font-medium">Absent</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock In</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock Out</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => {
                const record = attendanceMap.get(user.id);
                const isAbsent = !record;
                const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.role.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isAbsent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3" /> Absent
                        </span>
                      ) : record.status === "LATE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                          <AlertCircle className="w-3 h-3" /> Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record?.photoUrl ? (
                        <div className="flex items-center gap-3">
                          <a href={record.photoUrl} target="_blank" rel="noreferrer">
                            <img src={record.photoUrl} alt="Selfie" className="w-10 h-10 object-cover rounded-lg ring-1 ring-slate-200 shadow-sm" />
                          </a>
                          {!record.isPhotoApproved && (
                             <form action={approveAttendancePhotoAction.bind(null, record.id)}>
                               <button type="submit" className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md font-semibold ring-1 ring-indigo-200 transition-colors shadow-sm">
                                 Approve
                               </button>
                             </form>
                          )}
                        </div>
                      ) : record?.isPhotoApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> AI Matched
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 tabular-nums">
                      {record ? formatTime(record.clockIn) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 tabular-nums">
                      {record ? formatTime(record.clockOut) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {record ? (
                        <span className={`font-semibold tabular-nums ${!record.clockOut ? 'text-indigo-600' : 'text-slate-900'}`}>
                          {calculateHours(record.clockIn, record.clockOut)}
                        </span>
                      ) : (
                        <span className="text-slate-300">0h 0m</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
