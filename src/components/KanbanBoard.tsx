"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { updateTaskStatusDragAction } from "@/actions/task.actions";
import { Clock } from "lucide-react";

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
  project: {
    name: string;
  };
  assignees: Assignee[];
};

const COLUMNS = [
  { id: "PENDING", title: "To Do", bgColor: "bg-slate-100" },
  { id: "IN_PROGRESS", title: "In Progress", bgColor: "bg-blue-50" },
  { id: "COMPLETED", title: "Done", bgColor: "bg-green-50" },
];

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  // Use state to handle optimistic UI updates during drag
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Sync state if props change (e.g., from server revalidation)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistically update UI
    const newStatus = destination.droppableId;
    const taskToUpdate = tasks.find(t => t.id === draggableId);
    
    if (!taskToUpdate) return;

    const newTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);

    // Call server action in background
    await updateTaskStatusDragAction(draggableId, newStatus);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => {
      // Map REVIEW to IN_PROGRESS for display purposes if any exist
      if (status === "IN_PROGRESS" && t.status === "REVIEW") return true;
      return t.status === status;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px] mt-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div key={column.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-slate-800">{column.title}</h3>
                <span className="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                  {columnTasks.length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-3 border ${
                      snapshot.isDraggingOver ? "bg-slate-50 border-blue-200 border-dashed" : `${column.bgColor} border-transparent`
                    } transition-colors duration-200 flex flex-col gap-3 min-h-[150px]`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 group relative ${
                              snapshot.isDragging ? "shadow-md ring-2 ring-blue-500/20 rotate-1 z-50" : "hover:border-blue-300"
                            } transition-all duration-200`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                                {task.category.replace(/_/g, " ")}
                              </span>
                              {task.priority === "HIGH" && (
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                  HIGH
                                </span>
                              )}
                            </div>
                            
                            <Link href={`/dashboard/tasks/${task.id}`} className="block">
                              <h4 className="font-medium text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {task.name}
                              </h4>
                              <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                                {task.project.name}
                              </p>
                            </Link>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                              <div className="flex -space-x-2">
                                {task.assignees.map((a) => (
                                  <div key={a.user.id} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700" title={a.user.name}>
                                    {a.user.name.substring(0, 2).toUpperCase()}
                                  </div>
                                ))}
                                {task.assignees.length === 0 && (
                                  <span className="text-slate-400 text-[10px] italic">Unassigned</span>
                                )}
                              </div>
                              
                              {task.deadline && (
                                <div className={`flex items-center text-[10px] font-medium ${
                                  new Date(task.deadline) < new Date() && task.status !== "COMPLETED" 
                                    ? "text-red-500 bg-red-50 px-1.5 py-0.5 rounded" 
                                    : "text-slate-400"
                                }`}>
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(task.deadline).toISOString().split('T')[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
