"use server";

import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // For the seed user where we didn't use bcrypt, we will do a direct check
  // as well as a bcrypt check for future real users.
  if (!user) {
    return { error: "Invalid credentials" };
  }

  const isValid = 
    user.passwordHash === password || // Direct check for seed script
    bcrypt.compareSync(password, user.passwordHash);

  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  if (!user.isActive) {
    return { error: "Account is deactivated" };
  }

  // Create JWT Session
  await setSession({ id: user.id, role: user.role });

  redirect("/dashboard");
}

export async function logoutAction() {
  const { deleteSession } = await import("@/lib/session");
  await deleteSession();
  redirect("/login");
}
