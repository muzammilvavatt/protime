"use client";

import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";

export function AttendanceDatePicker({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
      <CalendarIcon className="w-4 h-4 text-slate-500 ml-2" />
      <input 
        type="date" 
        name="date" 
        defaultValue={defaultValue}
        className="border-0 bg-transparent text-sm focus:ring-0 text-slate-700 font-medium cursor-pointer"
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/dashboard/attendance?date=${e.target.value}`);
          }
        }}
      />
    </div>
  );
}
