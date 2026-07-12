import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ChangePasswordForm, ProfilePictureForm, AdminGlobalSettingsForm } from "@/components/SettingsForms";

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const globalSetting = await prisma.globalSetting.findUnique({
    where: { id: "global" }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6 md:col-span-1">
          {user.role === "EMPLOYEE" && (
            <ProfilePictureForm user={user} />
          )}
          <ChangePasswordForm />
        </div>
        
        <div className="space-y-6 md:col-span-1">
          {user.role === "ADMIN" && (
            <AdminGlobalSettingsForm initialRequireSelfie={globalSetting?.requireSelfieVerification ?? true} />
          )}
        </div>
      </div>
    </div>
  );
}
