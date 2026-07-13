"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Check } from "lucide-react";

export function GlobalProjectsReportButtons({ projects }: { projects: { name: string, clientName: string, status: string, tasks?: { status: string }[], _count?: { tasks: number } }[] }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const activeProjects = projects.filter(p => p.status !== "COMPLETED").length;
    const textLines = [
      `*Overall Projects Report*`,
      `*Total Projects:* ${projects.length} | *Active:* ${activeProjects}`,
      ``,
    ];
    if (projects.length === 0) {
      textLines.push(`No projects found.`);
    } else {
      projects.forEach(p => {
        const statusStr = p.status === "COMPLETED" ? "*Completed* ✅" : `*${p.status.replace(/_/g, " ")}* ⏳`;
        const completedTasks = p.tasks ? p.tasks.filter((t: { status: string }) => t.status === "COMPLETED").length : 0;
        const totalTasks = p.tasks ? p.tasks.length : p._count?.tasks || 0;
        textLines.push(`- *${p.name}* (${p.clientName}): ${statusStr} [${completedTasks}/${totalTasks} Tasks]`);
      });
    }
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2 no-print">
      <Button onClick={handleCopy} variant="outline"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
        {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <Button onClick={handlePrint} variant="outline"
        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
