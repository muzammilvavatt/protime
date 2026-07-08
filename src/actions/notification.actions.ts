"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getNotificationsAction() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { notifications: [] };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return { notifications };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { notifications: [] };
  }
}
