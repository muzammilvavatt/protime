"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Check, CheckCircle2, Clock } from "lucide-react";

export function DailyReportView({ tasks, date }: { tasks: any[], date: string }) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const textLines = [
      `*Daily Report — ${new Date(date).toLocaleDateString('en-IN')}*`,
      ``,
    ];
    if (tasks.length === 0) {
      textLines.push(`No tasks were updated today.`);
    } else {
      tasks.forEach(task => {
        const assignees = task.assignees.map((a: any) => a.user.name).join(", ") || "Unassigned";
        const statusStr = task.status === "COMPLETED" ? "*Completed* ✅" : `*${task.status.replace(/_/g, " ")}* ⏳`;
        const timeSpent = task.timeSpentMs ? (task.timeSpentMs / (1000 * 60 * 60)).toFixed(1) + 'h' : '0h';
        const project = task.project ? task.project.name : "No Project";
        textLines.push(`- ${assignees}: ${task.name} (${project}) — ${statusStr} (${timeSpent})`);
      });
    }
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daily Report</h2>
          <p className="text-slate-500 text-sm mt-0.5">{formattedDate}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCopy} variant="outline"
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-xl overflow-hidden print:shadow-none print:ring-0">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-end print:border-slate-800 print:border-b-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daily Activity Report</h3>
            <p className="text-slate-500 text-sm mt-0.5">{formattedDate}</p>
          </div>
          <div className="text-right hidden print:block">
            <p className="font-bold text-slate-900">PROTIME</p>
            <p className="text-xs text-slate-500">System Generated</p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tasks updated today</p>
            <p className="text-slate-400 text-xs mt-1">Check back after tasks are started or completed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 print:bg-white print:border-b print:border-slate-800">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {tasks.map((task) => {
                  const assignees = task.assignees.map((a: any) => a.user.name).join(", ") || "Unassigned";
                  const isCompleted = task.status === "COMPLETED";
                  const timeSpent = task.timeSpentMs
                    ? (task.timeSpentMs / (1000 * 60 * 60)).toFixed(2) + 'h'
                    : '0.00h';
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors page-break-inside-avoid print:hover:bg-transparent">
                      <td className="px-6 py-4 font-semibold text-slate-900">{task.name}</td>
                      <td className="px-6 py-4 text-slate-500">{task.project?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-600">{assignees}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 print:ring-0'
                            : task.status === 'REVIEW'
                            ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 print:ring-0'
                            : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 print:ring-0'
                        }`}>
                          {isCompleted
                            ? <CheckCircle2 className="w-3 h-3 print:hidden" />
                            : <Clock className="w-3 h-3 print:hidden" />}
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700 tabular-nums">{timeSpent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
