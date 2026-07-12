"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Copy, CheckCircle2, Clock, Check } from "lucide-react";

export function DailyReportView({ tasks, date }: { tasks: any[], date: string }) {
  const [copied, setCopied] = useState(false);
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const textLines = [
      `*Daily Task Report: ${new Date(date).toLocaleDateString('en-IN')}*`,
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
        
        textLines.push(`- ${assignees}: ${task.name} (${project}) - ${statusStr} (${timeSpent})`);
      });
    }

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header - Hides on Print, we show a print-specific header inside the printable area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daily Report</h2>
          <p className="text-slate-500">Activity summary for {formattedDate}</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleCopy} 
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Report"}
          </Button>
          <Button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <Card className="bg-white border-slate-200 shadow-sm print:shadow-none print:border-none">
        <CardHeader className="border-b border-slate-100 pb-6 print:border-slate-300">
          <div className="flex justify-between items-end">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Daily Activity Report</CardTitle>
              <p className="text-slate-500 mt-1">{formattedDate}</p>
            </div>
            <div className="text-right hidden print:block">
              <h3 className="font-bold text-slate-900">PROTIME / PRMC</h3>
              <p className="text-sm text-slate-500">System Generated Report</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No tasks were updated today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 print:bg-white print:border-b-2 print:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg print:rounded-none">Task Name</th>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg print:rounded-none">Time Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {tasks.map((task) => {
                    const assignees = task.assignees.map((a: any) => a.user.name).join(", ") || "Unassigned";
                    const isCompleted = task.status === "COMPLETED";
                    const timeSpent = task.timeSpentMs ? (task.timeSpentMs / (1000 * 60 * 60)).toFixed(2) + 'h' : '0.00h';
                    
                    return (
                      <tr key={task.id} className="hover:bg-slate-50 print:hover:bg-transparent transition-colors page-break-inside-avoid">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {task.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {task.project ? task.project.name : "—"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {assignees}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            isCompleted 
                              ? 'bg-green-50 text-green-700 border border-green-200 print:border-none print:p-0' 
                              : task.status === 'REVIEW'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200 print:border-none print:p-0'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 print:border-none print:p-0'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-3 h-3 mr-1 print:hidden" /> : <Clock className="w-3 h-3 mr-1 print:hidden" />}
                            {task.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-slate-700 tabular-nums">
                          {timeSpent}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
