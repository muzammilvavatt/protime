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
  const allottedHoursStr = formData.get("allottedHours") as string;

  if (!name || !category || !projectId || !assigneeId) {
    return { error: "Name, Category, Project, and Assignee are required." };
  }

  let allottedHours = null;
  if (allottedHoursStr) {
    allottedHours = parseInt(allottedHoursStr, 10);
  }

  const session = await getSession();

  try {
    const task = await prisma.task.create({
      data: {
        name,
        category,
        priority: priority || "MEDIUM",
        allottedHours,
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

    await prisma.notification.create({
      data: {
        userId: assigneeId,
        type: "TASK_ASSIGNED",
        message: `You have been assigned a new task: ${name}`,
      }
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

export async function startTaskAction(taskId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
      lastTimerStart: new Date(),
      progress: 10,
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "STATUS_UPDATED",
      entityType: "TASK",
      entityId: taskId,
      userId: session.user.id,
      details: "Started task"
    }
  });

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
}

export async function completeTaskAction(taskId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Task not found" };

  const now = new Date();
  let addMs = 0;
  if (task.lastTimerStart) {
    addMs = now.getTime() - new Date(task.lastTimerStart).getTime();
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: now,
      timeSpentMs: task.timeSpentMs + addMs,
      lastTimerStart: null,
      progress: 100,
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "STATUS_UPDATED",
      entityType: "TASK",
      entityId: taskId,
      userId: session.user.id,
      details: "Completed task"
    }
  });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "TASK_COMPLETED",
        message: `${session.user.name || 'An employee'} completed task: ${task.name}`,
      }
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
}

export async function requestTimeExtensionAction(taskId: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const hours = parseInt(formData.get("hours") as string, 10);
  const reason = formData.get("reason") as string;

  if (!hours || !reason) return { error: "Hours and reason are required" };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "TIME_EXTENSION_REQUESTED",
      extensionRequestedHours: hours,
      extensionReason: reason,
    }
  });

  const task = await prisma.task.findUnique({ where: { id: taskId } });

  await prisma.activityLog.create({
    data: {
      action: "EXTENSION_REQUESTED",
      entityType: "TASK",
      entityId: taskId,
      userId: session.user.id,
      details: `Requested ${hours} extra hours. Reason: ${reason}`
    }
  });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "TIME_EXTENSION_REQUESTED",
        message: `${session.user.name || 'An employee'} requested ${hours} extra hours for task: ${task?.name || 'Unknown'}`,
      }
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
}

export async function approveTimeExtensionAction(taskId: string) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { assignees: true }
  });
  if (!task || !task.extensionRequestedHours) return { error: "No extension requested" };

  const newAllottedHours = (task.allottedHours || 0) + task.extensionRequestedHours;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      allottedHours: newAllottedHours,
      extensionRequestedHours: null,
      extensionReason: null,
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "EXTENSION_APPROVED",
      entityType: "TASK",
      entityId: taskId,
      userId: session.user.id,
      details: `Approved ${task.extensionRequestedHours} extra hours`
    }
  });

  for (const a of task.assignees) {
    await prisma.notification.create({
      data: {
        userId: a.userId,
        type: "TIME_EXTENSION_APPROVED",
        message: `Your time extension of ${task.extensionRequestedHours} hours was approved for task: ${task.name}`,
      }
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
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
