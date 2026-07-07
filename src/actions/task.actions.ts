"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTaskAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const deadlineStr = formData.get("deadline") as string;
  const notes = formData.get("notes") as string;
  const projectId = formData.get("projectId") as string;
  const assigneeId = formData.get("assigneeId") as string;

  if (!name || !category || !projectId || !assigneeId) {
    return { error: "Name, Category, Project, and Assignee are required." };
  }

  let deadline = null;
  if (deadlineStr) {
    deadline = new Date(deadlineStr);
  }

  try {
    const task = await prisma.task.create({
      data: {
        name,
        category,
        priority: priority || "MEDIUM",
        deadline,
        notes: notes || null,
        projectId,
      },
    });

    await prisma.taskAssignee.create({
      data: {
        taskId: task.id,
        userId: assigneeId,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Failed to create task" };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
  redirect("/dashboard/tasks");
}

export async function updateTaskStatusAction(id: string, formData: FormData) {
  const status = formData.get("status") as string;
  const progressStr = formData.get("progress") as string;
  const progress = parseInt(progressStr, 10) || 0;
  
  await prisma.task.update({
    where: { id },
    data: { status, progress },
  });
  
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  redirect("/dashboard/tasks");
}

export async function updateTaskStatusDragAction(id: string, status: string) {
  let progress = 0;
  if (status === "COMPLETED") progress = 100;
  if (status === "IN_PROGRESS") progress = 50;
  if (status === "PENDING") progress = 0;

  await prisma.task.update({
    where: { id },
    data: { status, progress },
  });
  
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  // Don't redirect for drag and drop actions!
}
