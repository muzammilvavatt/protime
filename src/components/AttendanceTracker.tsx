"use client";

import { useState, useTransition } from "react";
import { clockInAction, clockOutAction } from "@/actions/attendance.actions";
import { Clock, LogIn, LogOut, CheckCircle, AlertTriangle, MapPin } from "lucide-react";

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
          if (res?.error) setErrorMsg(res.error);
        });
      },
      () => {
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
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">Attendance</h2>
          <p className="text-indigo-200 text-xs">Today&apos;s punch record</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-rose-50 text-rose-700 ring-1 ring-rose-200 rounded-lg px-3.5 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* State: Not clocked in yet */}
        {!hasClockedIn && (
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
              <LogIn className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">You haven&apos;t clocked in yet</p>
              <p className="text-slate-500 text-xs mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> Location will be recorded
              </p>
            </div>
            <button
              onClick={handleClockIn}
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Clocking in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Clock In
                </>
              )}
            </button>
          </div>
        )}

        {/* State: Clocked in but not clocked out */}
        {hasClockedIn && !hasClockedOut && (
          <div className="space-y-4">
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="text-emerald-800 font-semibold text-sm">Currently clocked in</p>
                <p className="text-emerald-700 text-xs">
                  Since{" "}
                  <span className="font-bold">{formatTime(todayRecord.clockIn)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClockOut}
              disabled={isPending}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Clocking out…
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" /> Clock Out
                </>
              )}
            </button>
          </div>
        )}

        {/* State: Shift complete */}
        {hasClockedIn && hasClockedOut && (
          <div className="space-y-3">
            <div className="flex flex-col items-center text-center py-2 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Shift Complete!</p>
              <p className="text-slate-500 text-xs">Great work today 🎉</p>
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-lg divide-y divide-slate-200">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-emerald-500" /> Clocked In
                </span>
                <span className="font-bold text-slate-800 text-sm">{formatTime(todayRecord.clockIn)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Clocked Out
                </span>
                <span className="font-bold text-slate-800 text-sm">{formatTime(todayRecord.clockOut)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
