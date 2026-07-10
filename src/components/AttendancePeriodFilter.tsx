"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function AttendancePeriodFilter({ defaultStart, defaultEnd }: { defaultStart: string, defaultEnd: string }) {
  const router = useRouter();
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);

  const handleFilter = () => {
    if (start && end) {
      router.push(`/dashboard/attendance/reports?start=${start}&end=${end}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2 px-2">
        <CalendarIcon className="w-4 h-4 text-slate-500" />
        <input 
          type="date" 
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border-0 bg-transparent text-sm focus:ring-0 text-slate-700 font-medium cursor-pointer p-0"
        />
      </div>
      
      <span className="text-slate-300 font-medium hidden sm:inline-block">to</span>
      
      <div className="flex items-center space-x-2 px-2">
        <CalendarIcon className="w-4 h-4 text-slate-500" />
        <input 
          type="date" 
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border-0 bg-transparent text-sm focus:ring-0 text-slate-700 font-medium cursor-pointer p-0"
        />
      </div>

      <Button onClick={handleFilter} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
        <Filter className="w-4 h-4 mr-2" />
        Generate
      </Button>
    </div>
  );
}
