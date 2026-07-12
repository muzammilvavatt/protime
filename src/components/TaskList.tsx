"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateTaskStatusDragAction, submitForReviewAction } from "@/actions/task.actions";
import {
  Clock,
  Lock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock3,
  ChevronRight,
  Folder,
  ClipboardList,
} from "lucide-react";
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

// ── Design helpers ────────────────────────────────────────────────────

const getPriorityBorderClass = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "border-l-rose-500";
    case "MEDIUM":
      return "border-l-amber-400";
    default:
      return "border-l-slate-300";
  }
};

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "IN_PROGRESS":
    case "TIME_EXTENSION_REQUESTED":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    case "REVIEW":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "IN_PROGRESS":
      return <Clock3 className="w-4 h-4 text-indigo-500" />;
    case "TIME_EXTENSION_REQUESTED":
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case "REVIEW":
      return <CheckCircle2 className="w-4 h-4 text-violet-500" />;
    default:
      return <Circle className="w-4 h-4 text-slate-300" />;
  }
};

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ── Component ─────────────────────────────────────────────────────────

export function TaskList({
  initialTasks,
  activeTab,
  isAdmin,
  isClockedIn,
}: {
  initialTasks: Task[];
  activeTab: string;
  isAdmin: boolean;
  isClockedIn?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialTasks.forEach((t) => {
      initial[t.project.name] = true;
    });
    return initial;
  });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    startTransition(async () => {
      if (newStatus === "REVIEW") {
        await submitForReviewAction(taskId);
      } else {
        await updateTaskStatusDragAction(taskId, newStatus);
      }
    });
  };

  const toggleGroup = (name: string) =>
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));

  // Group tasks by project
  const groupedTasks: Record<string, Task[]> = {};
  initialTasks.forEach((task) => {
    if (!groupedTasks[task.project.name]) {
      groupedTasks[task.project.name] = [];
    }
    groupedTasks[task.project.name].push(task);
  });

  // ── Empty state ──────────────────────────────────────────────────────
  if (initialTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-14 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm mt-4 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          No {activeTab} tasks
        </h3>
        <p className="text-sm text-slate-400 text-center max-w-xs">
          Everything is clean and organised. Enjoy the peace! ✨
        </p>
      </div>
    );
  }

  // ── Main list ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 mt-4 pb-12">
      {Object.entries(groupedTasks).map(([projectName, tasks]) => {
        const isOpen = openGroups[projectName] ?? true;

        return (
          <div
            key={projectName}
            className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm overflow-hidden animate-fade-in-up"
          >
            {/* Folder Header */}
            <button
              type="button"
              onClick={() => toggleGroup(projectName)}
              className="w-full text-left bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3 hover:from-slate-100 hover:to-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  {projectName}
                </h3>
              </div>
              <span className="bg-white border border-slate-200 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                {tasks.length}
              </span>
            </button>

            {/* Task Rows */}
            {isOpen && (
              <div className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const isBlocked =
                    task.dependsOn && task.dependsOn.status !== "COMPLETED";
                  const isExtensionRequested =
                    task.status === "TIME_EXTENSION_REQUESTED";

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center p-3 hover:bg-slate-50 transition-colors border-l-[3px] ${getPriorityBorderClass(task.priority)} ${isBlocked ? "opacity-60" : ""}`}
                    >
                      {/* Status icon + Name */}
                      <div className="flex items-center flex-1 min-w-0 mr-4">
                        <div
                          className="flex-shrink-0 mr-3"
                          title={formatStatus(task.status)}
                        >
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline truncate text-sm flex items-center gap-1.5"
                          >
                            {task.name}
                            {isBlocked && (
                              <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            )}
                          </Link>
                          <div className="flex items-center mt-0.5 gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {task.category.replace(/_/g, " ")}
                            </span>
                            {isBlocked && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                • Blocked by: {task.dependsOn!.name}
                              </span>
                            )}
                            {isExtensionRequested && (
                              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 ring-1 ring-amber-200 px-1.5 py-0.5 rounded">
                                Extension Requested
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="hidden md:flex flex-shrink-0 w-32 mr-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(task.status)}`}
                        >
                          {formatStatus(
                            task.status === "TIME_EXTENSION_REQUESTED"
                              ? "EXTENSION"
                              : task.status
                          )}
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <div className="hidden md:flex flex-shrink-0 w-20">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeClass(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Assignees */}
                      <div className="hidden sm:flex flex-shrink-0 w-28 items-center -space-x-2">
                        {task.assignees.map((a) => (
                          <div
                            key={a.user.id}
                            className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100"
                            title={a.user.name}
                          >
                            {a.user.name.substring(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {task.assignees.length === 0 && (
                          <span className="text-slate-400 text-xs italic ml-2">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="hidden lg:flex flex-shrink-0 w-28 justify-end text-xs font-medium mr-3">
                        {activeTab === "completed" && task.completedAt ? (
                          <span className="text-slate-500">
                            Done{" "}
                            {new Date(task.completedAt).toLocaleDateString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        ) : task.deadline ? (
                          <span
                            className={`flex items-center gap-1 ${
                              new Date(task.deadline) < new Date()
                                ? "text-rose-600 font-bold"
                                : "text-slate-500"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 w-36 flex justify-end">
                        {activeTab === "active" && !isBlocked && (
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            {task.status === "PENDING" && !isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() =>
                                  handleStatusChange(task.id, "IN_PROGRESS")
                                }
                                disabled={
                                  isPending || (!isAdmin && !isClockedIn)
                                }
                                title={
                                  !isAdmin && !isClockedIn
                                    ? "Please clock in first"
                                    : ""
                                }
                              >
                                Start
                              </Button>
                            )}
                            {(task.status === "IN_PROGRESS" ||
                              task.status === "TIME_EXTENSION_REQUESTED") &&
                              !isAdmin && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white"
                                  onClick={() =>
                                    handleStatusChange(task.id, "REVIEW")
                                  }
                                  disabled={
                                    isPending || (!isAdmin && !isClockedIn)
                                  }
                                  title={
                                    !isAdmin && !isClockedIn
                                      ? "Please clock in first"
                                      : ""
                                  }
                                >
                                  Submit for Review
                                </Button>
                              )}
                            {task.status === "REVIEW" &&
                              (isAdmin ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50"
                                    onClick={() =>
                                      handleStatusChange(task.id, "IN_PROGRESS")
                                    }
                                    disabled={isPending}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() =>
                                      handleStatusChange(task.id, "COMPLETED")
                                    }
                                    disabled={isPending}
                                  >
                                    Approve
                                  </Button>
                                </>
                              ) : (
                                <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded-full ring-1 ring-violet-200">
                                  Pending Review
                                </span>
                              ))}
                          </div>
                        )}
                        {activeTab === "completed" && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold border-amber-200 text-amber-700 hover:bg-amber-50"
                              onClick={() =>
                                handleStatusChange(task.id, "IN_PROGRESS")
                              }
                              disabled={isPending}
                            >
                              Reopen
                            </Button>
                            <Link href={`/dashboard/tasks/${task.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                              >
                                View
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
