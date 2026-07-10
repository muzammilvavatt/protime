"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
}

export async function createProjectAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientEmail = formData.get("clientEmail") as string;
  const address = formData.get("address") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const deadlineStr = formData.get("deadline") as string;

  if (!name || !clientName) {
    return { error: "Project Name and Client Name are required" };
  }

  let deadline = null;
  if (deadlineStr) {
    deadline = new Date(deadlineStr);
  }

  const workflowStepsStr = formData.get("workflowSteps") as string;
  let workflowSteps: Array<{ name: string, category: string, assigneeId: string }> = [];
  if (workflowStepsStr) {
    try {
      workflowSteps = JSON.parse(workflowStepsStr);
    } catch (e) {
      console.error("Failed to parse workflow steps", e);
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        address: address || null,
        location: location || null,
        description: description || null,
        status: status || "ACTIVE",
        priority: priority || "MEDIUM",
        deadline,
      },
    });

    // Create the workflow tasks sequentially
    let previousTaskId: string | null = null;
    for (const step of workflowSteps) {
      const createdTask: any = await prisma.task.create({
        data: {
          name: step.name,
          category: step.category,
          priority: "MEDIUM",
          projectId: project.id,
          dependsOnId: previousTaskId,
        }
      });
      
      // Assign the employee
      await prisma.taskAssignee.create({
        data: {
          taskId: createdTask.id,
          userId: step.assigneeId
        }
      });

      previousTaskId = createdTask.id;
    }

  } catch (error) {
    console.error(error);
    return { error: "Failed to create project" };
  }

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  redirect("/dashboard/projects");
}

export async function updateProjectStatusAction(id: string, newStatus: string) {
  await prisma.project.update({
    where: { id },
    data: { status: newStatus },
  });
  revalidatePath("/dashboard/projects");
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  await prisma.project.delete({
    where: { id },
  });
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}

export async function editProjectAction(id: string, prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const clientName = formData.get("clientName") as string;
  const clientEmail = formData.get("clientEmail") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const location = formData.get("location") as string;
  const deadlineStr = formData.get("deadline") as string;
  const status = formData.get("status") as string;

  if (!name || !clientName) {
    return { error: "Project Name and Client Name are required" };
  }

  let deadline = null;
  if (deadlineStr) {
    deadline = new Date(deadlineStr);
  }

  try {
    await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        clientName,
        clientEmail,
        clientPhone,
        location,
        deadline,
        status: status || "ACTIVE",
      },
    });
  } catch (error) {
    return { error: "Failed to update project" };
  }

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${id}`);
}
