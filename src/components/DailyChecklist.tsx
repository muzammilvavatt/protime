"use client";

import { useTransition } from "react";
import { toggleDailyTaskAction } from "@/actions/daily-tasks.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Circle, ListTodo } from "lucide-react";

interface ChecklistTask {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

export function DailyChecklist({ tasks }: { tasks: ChecklistTask[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(() => {
      toggleDailyTaskAction(id, currentStatus);
    });
  };

  if (tasks.length === 0) {
    return null;
  }

  const completedCount = tasks.filter(t => t.status === "COMPLETED").length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-bold">
            <ListTodo className="w-5 h-5 mr-2 text-blue-600" />
            Daily Checklist
          </CardTitle>
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            {completedCount} / {tasks.length} Done
          </span>
        </div>
        <CardDescription>Your recurring daily responsibilities.</CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {tasks.map(task => {
            const isCompleted = task.status === "COMPLETED";
            return (
              <div 
                key={task.id} 
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isCompleted ? "bg-slate-50/50 hover:bg-slate-50" : "bg-white hover:bg-slate-50"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => handleToggle(task.id, task.status)}
              >
                <div className="flex items-center space-x-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isCompleted ? "text-slate-500 line-through" : "text-slate-900"}`}>
                      {task.name}
                    </span>
                    {task.description && (
                      <span className={`text-xs ${isCompleted ? "text-slate-400" : "text-slate-500"}`}>
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
