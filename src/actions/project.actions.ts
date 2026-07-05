"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  try {
    await prisma.project.create({
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
  await prisma.project.delete({
    where: { id },
  });
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}
