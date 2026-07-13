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
  const phoneNumber = formData.get("phoneNumber") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const projectRoles = formData.getAll("projectRoles") as string[];
  const dailyResponsibilities = formData.getAll("dailyResponsibilities") as string[];

  if (!name || !email || !password || !role) {
    return { error: "All required fields must be filled" };
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
        phoneNumber: phoneNumber || null,
        email,
        passwordHash,
        role,
        projectRoles: {
          create: projectRoles.map(id => ({ projectRoleId: id }))
        },
        dailyResponsibilities: {
          create: dailyResponsibilities.map(id => ({ dailyResponsibilityId: id }))
        }
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

export async function toggleEmployeeWFH(id: string, currentStatus: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id },
    data: { isWFH: !currentStatus },
  });
  revalidatePath("/dashboard/employees");
}

export async function deleteEmployeeAction(id: string) {
  await requireAdmin();
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
  const phoneNumber = formData.get("phoneNumber") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const projectRoles = formData.getAll("projectRoles") as string[];
  const dailyResponsibilities = formData.getAll("dailyResponsibilities") as string[];

  if (!name || !email || !role) {
    return { error: "Name, Email, and Role are required" };
  }

  // Check if email already exists and belongs to someone else
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== id) {
    return { error: "Email already in use by another employee" };
  }

  const updateData: any = { name, email, role, phoneNumber: phoneNumber || null };

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    updateData.passwordHash = bcrypt.hashSync(password, salt);
  }

  try {
    // We use a transaction because we need to clear old relations and insert new ones
    await prisma.$transaction([
      prisma.userProjectRole.deleteMany({ where: { userId: id } }),
      prisma.userDailyResponsibility.deleteMany({ where: { userId: id } }),
      prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          projectRoles: {
            create: projectRoles.map(rId => ({ projectRoleId: rId }))
          },
          dailyResponsibilities: {
            create: dailyResponsibilities.map(rId => ({ dailyResponsibilityId: rId }))
          }
        },
      })
    ]);
  } catch (error) {
    return { error: "Failed to update employee" };
  }

  revalidatePath("/dashboard/employees");
  redirect("/dashboard/employees");
}

export async function adminDeleteEmployeePhotoAction(id: string) {
  await requireAdmin();
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user?.profilePictureUrl) return;

  try {
    const urlParts = user.profilePictureUrl.split('/uploads/');
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.storage.from('uploads').remove([filePath]);
    }
  } catch (err) {
    console.error("Failed to delete from Supabase", err);
  }

  await prisma.user.update({
    where: { id },
    data: { profilePictureUrl: null }
  });

  revalidatePath("/dashboard/employees");
}
