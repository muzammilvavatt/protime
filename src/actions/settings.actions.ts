"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
}

// --- PROJECT ROLES ---

export async function createProjectRoleAction(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Name is required" };

  try {
    await prisma.projectRole.create({
      data: { name, description },
    });
  } catch (error) {
    return { error: "Failed to create Project Role. Name may already exist." };
  }

  revalidatePath("/dashboard/settings/roles");
  return { success: true };
}

export async function deleteProjectRoleAction(id: string) {
  await requireAdmin();
  await prisma.projectRole.delete({ where: { id } });
  revalidatePath("/dashboard/settings/roles");
}

// --- DAILY RESPONSIBILITIES ---

export async function createDailyResponsibilityAction(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Name is required" };

  try {
    await prisma.dailyResponsibility.create({
      data: { name, description },
    });
  } catch (error) {
    return { error: "Failed to create Daily Responsibility. Name may already exist." };
  }

  revalidatePath("/dashboard/settings/roles");
  return { success: true };
}

export async function deleteDailyResponsibilityAction(id: string) {
  await requireAdmin();
  await prisma.dailyResponsibility.delete({ where: { id } });
  revalidatePath("/dashboard/settings/roles");
}

import * as bcrypt from "bcryptjs";

// --- USER SETTINGS ---

export async function changePasswordAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash }
    });
    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    return { error: "Failed to update password." };
  }
}
