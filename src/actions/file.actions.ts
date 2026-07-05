"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getSession } from "@/lib/session";

export async function uploadFileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  const taskId = formData.get("taskId") as string;
  const projectId = formData.get("projectId") as string;

  if (!file) {
    return { error: "No file selected." };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const path = join(uploadDir, uniqueName);
  
  // In a real app, ensure the uploadDir exists first
  try {
    const fs = await import("fs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    await writeFile(path, buffer);
    
    // Save to DB
    await prisma.file.create({
      data: {
        name: file.name,
        url: `/uploads/${uniqueName}`,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedById: session.user.id,
        taskId: taskId || null,
        projectId: projectId || null,
      }
    });

  } catch (error) {
    console.error(error);
    return { error: "Failed to upload file." };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
}
