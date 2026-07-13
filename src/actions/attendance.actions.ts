"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const OFFICE1 = { lat: 11.4779869, lng: 76.001393 };
const OFFICE2 = { lat: 11.2922645, lng: 75.8153588 };
const MAX_RADIUS_METERS = 100;

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function resetClockOutAction(attendanceId: string) {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.attendance.update({
    where: { id: attendanceId },
    data: { clockOut: null }
  });

  revalidatePath("/dashboard/attendance");
}

export async function clockInAction(
  coords?: { lat: number, lng: number },
  photoUrl?: string,
  isPhotoApproved: boolean = false
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user?.isWFH) {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return { error: "Location is required to clock in. Please enable location permissions." };
    }
    
    const dist1 = getDistanceFromLatLonInMeters(coords.lat, coords.lng, OFFICE1.lat, OFFICE1.lng);
    const dist2 = getDistanceFromLatLonInMeters(coords.lat, coords.lng, OFFICE2.lat, OFFICE2.lng);
    
    if (dist1 > MAX_RADIUS_METERS && dist2 > MAX_RADIUS_METERS) {
      return { error: "You are not in the office." };
    }
  }

  const now = new Date();
  
  // Create a date object representing midnight of the local time
  // Using UTC midnight for simple comparison of the same day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Check if already clocked in today
  const existingRecord = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: todayStart,
      },
    }
  });

  if (existingRecord) {
    return { error: "Already clocked in today" };
  }

  // Determine status (LATE if clocked in after 9:15 AM)
  let status = "PRESENT";
  const lateThreshold = new Date();
  lateThreshold.setHours(9, 15, 0, 0);
  
  if (now > lateThreshold) {
    status = "LATE";
  }

  await prisma.attendance.create({
    data: {
      userId,
      date: todayStart,
      clockIn: now,
      status,
      photoUrl,
      isPhotoApproved,
    }
  });

  // Resume all IN_PROGRESS tasks
  await prisma.task.updateMany({
    where: {
      status: "IN_PROGRESS",
      assignees: { some: { userId } }
    },
    data: {
      lastTimerStart: now
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
}

export async function clockOutAction() {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const now = new Date();
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingRecord = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: todayStart,
      },
    },
    orderBy: {
      clockIn: 'desc'
    }
  });

  if (!existingRecord) {
    return { error: "No clock in record found for today" };
  }

  if (existingRecord.clockOut) {
    return { error: "Already clocked out today" };
  }

  await prisma.attendance.update({
    where: { id: existingRecord.id },
    data: { clockOut: now }
  });

  // Pause all IN_PROGRESS tasks
  const activeTasks = await prisma.task.findMany({
    where: {
      status: "IN_PROGRESS",
      assignees: { some: { userId } }
    }
  });

  for (const task of activeTasks) {
    let addMs = 0;
    if (task.lastTimerStart) {
      addMs = now.getTime() - new Date(task.lastTimerStart).getTime();
    }
    
    await prisma.task.update({
      where: { id: task.id },
      data: {
        timeSpentMs: task.timeSpentMs + addMs,
        lastTimerStart: null
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
}

export async function approveAttendancePhotoAction(attendanceId: string) {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  });

  if (!attendance || !attendance.photoUrl) return;

  // Delete from Supabase storage to save space
  try {
    const urlParts = attendance.photoUrl.split('/uploads/');
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
    console.error("Failed to delete attendance photo from Supabase", err);
  }
  
  await prisma.attendance.update({
    where: { id: attendanceId },
    data: { 
      isPhotoApproved: true,
      photoUrl: null // Wipe it from DB
    }
  });

  revalidatePath("/dashboard/attendance");
}

export async function rejectAttendanceAction(attendanceId: string) {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  });

  if (!attendance) return;

  // Delete photo from Supabase if it exists
  if (attendance.photoUrl) {
    try {
      const urlParts = attendance.photoUrl.split('/uploads/');
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
      console.error("Failed to delete attendance photo from Supabase", err);
    }
  }

  // Delete the attendance record entirely (or you could mark it as REJECTED)
  await prisma.attendance.delete({
    where: { id: attendanceId }
  });

  revalidatePath("/dashboard/attendance");
}
