import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your account and preferences.</p>
      </div>

      <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-lg font-bold">
            <SettingsIcon className="w-5 h-5 mr-2 text-blue-600" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-500">Settings functionality will be implemented in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
