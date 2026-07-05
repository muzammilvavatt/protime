import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-zinc-400">Manage your account and preferences.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <SettingsIcon className="w-5 h-5 mr-2 text-blue-500" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">Settings functionality will be implemented in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
