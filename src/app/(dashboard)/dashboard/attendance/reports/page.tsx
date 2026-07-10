import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Clock, CalendarDays, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendancePeriodFilter } from "@/components/AttendancePeriodFilter";

export default async function AttendanceReportPage(props: { searchParams?: Promise<{ start?: string; end?: string }> }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  
  // Defaults: 1st of current month to today
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  let startDate = firstDayOfMonth;
  let endDate = today;

  if (searchParams?.start) {
    const parsedStart = new Date(searchParams.start);
    if (!isNaN(parsedStart.getTime())) startDate = parsedStart;
  }
  
  if (searchParams?.end) {
    const parsedEnd = new Date(searchParams.end);
    if (!isNaN(parsedEnd.getTime())) endDate = parsedEnd;
  }

  // Normalize times for precise querying
  startDate.setHours(0, 0, 0, 0);
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Calculate total working days in period (excluding Sundays)
  let totalWorkingDays = 0;
  let tempDate = new Date(startDate);
  while (tempDate <= endOfDay) {
    if (tempDate.getDay() !== 0) { // 0 is Sunday
      totalWorkingDays++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Fetch all employees (exclude ADMIN)
  const users = await prisma.user.findMany({
    where: { 
      isActive: true,
      role: "EMPLOYEE"
    },
    orderBy: { name: 'asc' }
  });

  // Fetch attendance records for the period
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endOfDay
      }
    }
  });

  // Aggregate data per user
  const reportData = users.map(user => {
    const userRecords = attendances.filter(a => a.userId === user.id);
    
    let daysPresent = 0;
    let daysLate = 0;
    let totalMs = 0;

    userRecords.forEach(record => {
      if (record.status === "PRESENT") daysPresent++;
      if (record.status === "LATE") daysLate++;
      
      if (record.clockIn && record.clockOut) {
        totalMs += (record.clockOut.getTime() - record.clockIn.getTime());
      }
    });

    const daysAbsent = Math.max(0, totalWorkingDays - (daysPresent + daysLate));
    
    const totalHrs = Math.floor(totalMs / (1000 * 60 * 60));
    const totalMins = Math.round((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      user,
      daysPresent,
      daysLate,
      daysAbsent,
      totalHrs,
      totalMins,
      attendancePercentage: totalWorkingDays > 0 
        ? Math.round(((daysPresent + daysLate) / totalWorkingDays) * 100)
        : 0
    };
  });

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/dashboard/attendance">
          <Button variant="outline" size="icon" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Period Report</h2>
          <p className="text-slate-500">Aggregated attendance statistics.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center text-slate-700">
          <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
          <span className="font-medium">Total Working Days in Period: <span className="font-bold text-slate-900">{totalWorkingDays}</span> <span className="text-sm font-normal text-slate-500">(Excluding Sundays)</span></span>
        </div>
        <AttendancePeriodFilter defaultStart={startStr} defaultEnd={endStr} />
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Attendance Rate</th>
                <th className="px-6 py-4">Present</th>
                <th className="px-6 py-4">Late</th>
                <th className="px-6 py-4">Absent</th>
                <th className="px-6 py-4">Total Hours Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((data) => (
                <tr key={data.user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">
                      {data.user.name.charAt(0)}
                    </div>
                    <div>
                      <p>{data.user.name}</p>
                      <p className="text-xs text-slate-500 font-normal">{data.user.role.replace(/_/g, " ")}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-200 rounded-full h-2 w-24">
                        <div 
                          className={`h-2 rounded-full ${data.attendancePercentage >= 90 ? 'bg-green-500' : data.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${data.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">{data.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-50 text-green-700">
                      {data.daysPresent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-amber-50 text-amber-700">
                      {data.daysLate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-50 text-red-700">
                      {data.daysAbsent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-slate-700 font-semibold">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {data.totalHrs}h {data.totalMins}m
                    </div>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
