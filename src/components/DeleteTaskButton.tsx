"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/actions/task.actions";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      startTransition(async () => {
        await deleteTaskAction(taskId);
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-semibold"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isPending ? "Deleting..." : "Delete Task"}
    </Button>
  );
}
