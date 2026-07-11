"use client";

import { useState, useTransition } from "react";
import { clockInAction, clockOutAction } from "@/actions/attendance.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogIn, LogOut, CheckCircle, AlertTriangle } from "lucide-react";

export function AttendanceTracker({ todayRecord }: { todayRecord: any }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClockIn = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        startTransition(async () => {
          const res = await clockInAction({ lat: latitude, lng: longitude });
          if (res?.error) {
            setErrorMsg(res.error);
          }
        });
      },
      (error) => {
        setErrorMsg("Failed to get location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClockOut = () => {
    setErrorMsg(null);
    startTransition(async () => {
      await clockOutAction();
    });
  };

  const hasClockedIn = !!todayRecord;
  const hasClockedOut = !!todayRecord?.clockOut;

  // Format time (e.g. 9:00 AM)
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm text-slate-900 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center">
            <Clock className="w-5 h-5 mr-2 opacity-80" />
            Time Tracker
          </h3>
          <span className="text-blue-100 text-sm font-medium" suppressHydrationWarning>
            {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      <CardContent className="p-6">
        
        {!hasClockedIn && (
          <div className="text-center space-y-4">
            <p className="text-slate-500 text-sm">You haven't clocked in today.</p>
            <Button 
              onClick={handleClockIn} 
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-12 text-lg font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isPending ? "Getting Location..." : "Clock In Now"}
            </Button>
            {errorMsg && (
              <div className="flex items-center text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 text-left">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {hasClockedIn && !hasClockedOut && (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 inline-block w-full">
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider block mb-1">Clocked In At</span>
              <span className="text-2xl font-bold text-blue-900" suppressHydrationWarning>{formatTime(todayRecord.clockIn)}</span>
              {todayRecord.status === "LATE" && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  LATE
                </span>
              )}
            </div>
            
            <Button 
              onClick={handleClockOut} 
              disabled={isPending}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm h-12 text-lg font-semibold"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {isPending ? "Recording..." : "Clock Out"}
            </Button>
          </div>
        )}

        {hasClockedOut && (
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Shift Complete</h4>
            <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-100 pt-4 mt-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Clock In</span>
                <span className="font-semibold" suppressHydrationWarning>{formatTime(todayRecord.clockIn)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Clock Out</span>
                <span className="font-semibold" suppressHydrationWarning>{formatTime(todayRecord.clockOut)}</span>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
