"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Check } from "lucide-react";

export function ProjectReportButtons({ project, tasks }: { project: any, tasks: any[] }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const totalTasks = tasks.length;
    const textLines = [
      `*Project:* ${project.name}`,
      `*Overall Progress:* ${completedTasks}/${totalTasks} Tasks Completed`,
      ``,
    ];
    if (tasks.length === 0) {
      textLines.push(`No tasks assigned yet.`);
    } else {
      tasks.forEach(task => {
        const assignees = task.assignees.map((a: any) => a.user.name).join(", ") || "Unassigned";
        const statusStr = task.status === "COMPLETED" ? "*Completed* ✅" : `*${task.status.replace(/_/g, " ")}* ⏳`;
        textLines.push(`- ${task.name}: ${statusStr} (${assignees})`);
      });
    }
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 no-print">
      <Button onClick={handleCopy} variant="outline" size="sm"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
        {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button onClick={handlePrint} size="sm"
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
        <Printer className="w-4 h-4 mr-2" />
        Print PDF
      </Button>
    </div>
  );
}
