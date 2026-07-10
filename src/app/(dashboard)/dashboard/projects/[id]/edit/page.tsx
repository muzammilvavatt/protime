import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { EditProjectForm } from "@/components/EditProjectForm";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await props.params;

  const project = await prisma.project.findUnique({
    where: { id }
  });

  if (!project) {
    notFound();
  }

  return <EditProjectForm project={project} />;
}
