import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DailyReportView } from "@/components/DailyReportView";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get today's start and end boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch tasks updated today
  const dailyTasks = await prisma.task.findMany({
    where: {
      updatedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      project: {
        select: { name: true }
      },
      assignees: {
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return <DailyReportView tasks={dailyTasks} date={today.toISOString()} />;
}
