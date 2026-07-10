import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { EditEmployeeForm } from "@/components/EditEmployeeForm";

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await props.params;

  const employee = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    }
  });

  if (!employee) {
    notFound();
  }

  return <EditEmployeeForm employee={employee} />;
}
