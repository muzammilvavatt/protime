"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { updateTaskStatusDragAction } from "@/actions/task.actions";
import { Clock, Lock, CheckCircle2, Circle, AlertCircle, Clock3 } from "lucide-react";
import { Button } from "./ui/button";

type Assignee = {
  user: {
    id: string;
    name: string;
  };
};

type Task = {
  id: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  deadline: Date | null;
  completedAt: Date | null;
  project: {
    name: string;
  };
  dependsOn?: {
    id: string;
    status: string;
    name: string;
  } | null;
  assignees: Assignee[];
};

export function TaskList({ initialTasks, activeTab, isAdmin }: { initialTasks: Task[], activeTab: string, isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (taskId: string, newStatus: string) => {
    startTransition(async () => {
      await updateTaskStatusDragAction(taskId, newStatus);
    });
  };

  // Group tasks by project
  const groupedTasks: Record<string, Task[]> = {};
  initialTasks.forEach(task => {
    if (!groupedTasks[task.project.name]) {
      groupedTasks[task.project.name] = [];
    }
    groupedTasks[task.project.name].push(task);
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-700 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'LOW': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200'; // MEDIUM
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS': return <Clock3 className="w-4 h-4 text-blue-600" />;
      case 'TIME_EXTENSION_REQUESTED': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'REVIEW': return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      default: return <Circle className="w-4 h-4 text-slate-300" />; // PENDING
    }
  };

  if (initialTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 mt-4 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No {activeTab} tasks</h3>
        <p className="text-slate-500">Everything is looking clean and organized.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-4 pb-12">
      {Object.entries(groupedTasks).map(([projectName, tasks]) => (
        <div key={projectName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{projectName}</h3>
            <span className="bg-white border border-slate-200 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isBlocked = task.dependsOn && task.dependsOn.status !== "COMPLETED";
              const isExtensionRequested = task.status === "TIME_EXTENSION_REQUESTED";

              return (
                <div key={task.id} className={`flex items-center p-3 hover:bg-slate-50 transition-colors ${isBlocked ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  
                  {/* Status & Name */}
                  <div className="flex items-center flex-1 min-w-0 mr-4">
                    <div className="flex-shrink-0 mr-3" title={task.status.replace(/_/g, " ")}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link href={`/dashboard/tasks/${task.id}`} className="font-medium text-slate-900 hover:text-blue-600 truncate text-sm">
                        {task.name}
                        {isBlocked && <Lock className="inline-block w-3 h-3 ml-2 text-slate-400" />}
                      </Link>
                      <div className="flex items-center mt-0.5 space-x-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {task.category.replace(/_/g, " ")}
                        </span>
                        {isBlocked && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            • Blocked by: {task.dependsOn!.name}
                          </span>
                        )}
                        {isExtensionRequested && (
                          <span className="text-[10px] text-amber-700 font-medium bg-amber-100 px-1.5 py-0.5 rounded">
                            • Extension Requested
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="hidden md:flex flex-shrink-0 w-24">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Assignees */}
                  <div className="hidden sm:flex flex-shrink-0 w-32 items-center -space-x-2">
                    {task.assignees.map((a) => (
                      <div key={a.user.id} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={a.user.name}>
                        {a.user.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {task.assignees.length === 0 && (
                      <span className="text-slate-400 text-xs italic ml-2">Unassigned</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="hidden lg:flex flex-shrink-0 w-32 justify-end text-xs font-medium mr-4">
                    {activeTab === "completed" && task.completedAt ? (
                      <span className="text-slate-500">
                        Done {new Date(task.completedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                      </span>
                    ) : task.deadline ? (
                      <span className={`flex items-center ${new Date(task.deadline) < new Date() ? "text-red-600 font-bold" : "text-slate-500"}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(task.deadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 w-28 flex justify-end">
                    {activeTab === "active" && !isBlocked && (
                      <div className="flex space-x-1">
                        {task.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                            disabled={isPending}
                          >
                            Start
                          </Button>
                        )}
                        {(task.status === "IN_PROGRESS" || task.status === "TIME_EXTENSION_REQUESTED") && (
                          <Button 
                            size="sm" 
                            className="h-7 text-xs font-medium bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(task.id, "COMPLETED")}
                            disabled={isPending}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                    {activeTab === "completed" && (
                      <Link href={`/dashboard/tasks/${task.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs font-medium text-blue-600 hover:bg-blue-50">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
