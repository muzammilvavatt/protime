"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function createTaskAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const deadlineStr = formData.get("deadline") as string;
  const notes = formData.get("notes") as string;
  const projectId = formData.get("projectId") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const dependsOnId = formData.get("dependsOnId") as string;

  if (!name || !category || !projectId || !assigneeId) {
    return { error: "Name, Category, Project, and Assignee are required." };
  }

  let deadline = null;
  if (deadlineStr) {
    deadline = new Date(deadlineStr);
  }

  const session = await getSession();

  try {
    const task = await prisma.task.create({
      data: {
        name,
        category,
        priority: priority || "MEDIUM",
        deadline,
        notes: notes || null,
        projectId,
        dependsOnId: dependsOnId || null,
      },
    });

    await prisma.taskAssignee.create({
      data: {
        taskId: task.id,
        userId: assigneeId,
      },
    });

    if (session?.user?.id) {
      await prisma.activityLog.create({
        data: {
          action: "CREATED",
          entityType: "TASK",
          entityId: task.id,
          userId: session.user.id,
          details: `Created task: ${name}`
        }
      });
    }

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
  const session = await getSession();
  
  let progress = 0;
  if (status === "COMPLETED") progress = 100;
  if (status === "IN_PROGRESS") progress = 50;
  if (status === "PENDING") progress = 0;
  
  await prisma.task.update({
    where: { id },
    data: { status, progress },
  });

  if (session?.user?.id) {
    await prisma.activityLog.create({
      data: {
        action: "STATUS_UPDATED",
        entityType: "TASK",
        entityId: id,
        userId: session.user.id,
        details: `Updated status to ${status.replace(/_/g, " ")}`
      }
    });
  }

  // Check if we unblocked any downstream tasks
  if (status === "COMPLETED") {
    const unblockedTasks = await prisma.task.findMany({
      where: { dependsOnId: id, status: { not: "COMPLETED" } },
      include: { assignees: true }
    });

    for (const ut of unblockedTasks) {
      for (const a of ut.assignees) {
        await prisma.notification.create({
          data: {
            userId: a.userId,
            type: "TASK_UNLOCKED",
            message: `Task completed! You can now start working on: ${ut.name}`,
          }
        });
      }
    }
  }
  
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  redirect("/dashboard/tasks");
}

export async function updateTaskStatusDragAction(id: string, status: string) {
  const session = await getSession();
  
  let progress = 0;
  if (status === "COMPLETED") progress = 100;
  if (status === "IN_PROGRESS") progress = 50;
  if (status === "PENDING") progress = 0;

  await prisma.task.update({
    where: { id },
    data: { status, progress },
  });

  if (session?.user?.id) {
    await prisma.activityLog.create({
      data: {
        action: "STATUS_UPDATED",
        entityType: "TASK",
        entityId: id,
        userId: session.user.id,
        details: `Moved to ${status.replace(/_/g, " ")}`
      }
    });
  }

  // Check if we unblocked any downstream tasks
  if (status === "COMPLETED") {
    const unblockedTasks = await prisma.task.findMany({
      where: { dependsOnId: id, status: { not: "COMPLETED" } },
      include: { assignees: true }
    });

    for (const ut of unblockedTasks) {
      for (const a of ut.assignees) {
        await prisma.notification.create({
          data: {
            userId: a.userId,
            type: "TASK_UNLOCKED",
            message: `Task completed! You can now start working on: ${ut.name}`,
          }
        });
      }
    }
  }
  
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(id: string) {
  const session = await getSession();
  
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.task.delete({
    where: { id }
  });

  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

export async function addTaskCommentAction(taskId: string, formData: FormData) {
  const text = formData.get("text") as string;
  const session = await getSession();

  if (!text || !text.trim() || !session?.user?.id) return;

  await prisma.activityLog.create({
    data: {
      action: "COMMENT",
      entityType: "TASK",
      entityId: taskId,
      userId: session.user.id,
      details: text.trim()
    }
  });

  revalidatePath(`/dashboard/tasks/${taskId}`);
}
