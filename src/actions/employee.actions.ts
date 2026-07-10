"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
}

export async function createEmployeeAction(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required" };
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
    });
  } catch (error) {
    return { error: "Failed to create employee" };
  }

  revalidatePath("/dashboard/employees");
  redirect("/dashboard/employees");
}

export async function toggleEmployeeStatus(id: string, currentStatus: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/dashboard/employees");
}

export async function deleteEmployeeAction(id: string) {
  await requireAdmin();
  // Disconnect or delete related data as needed
  // Note: in a real system we might re-assign tasks before deletion,
  // but for now, we rely on prisma cascading or manual cleanup if needed.
  // We'll just delete the user. Prisma schema uses cascade on TaskAssignee.
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/dashboard/employees");
}

export async function editEmployeeAction(id: string, prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !role) {
    return { error: "Name, Email, and Role are required" };
  }

  // Check if email already exists and belongs to someone else
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== id) {
    return { error: "Email already in use by another employee" };
  }

  const updateData: any = { name, email, role };

  // Only update password if provided
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    updateData.passwordHash = bcrypt.hashSync(password, salt);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    return { error: "Failed to update employee" };
  }

  revalidatePath("/dashboard/employees");
  redirect("/dashboard/employees");
}
