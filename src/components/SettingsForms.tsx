"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, Settings as SettingsIcon, Image as ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction, updateGlobalSettingsAction, updateProfilePictureAction } from "@/actions/settings.actions";
import { createClient } from "@supabase/supabase-js";
import { useTransition } from "react";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, undefined);

  return (
    <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl border-0">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center text-lg font-bold">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          Change Password
        </CardTitle>
        <CardDescription className="text-slate-500 ml-11">
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="pt-6 space-y-4">
          {state?.error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
              {state.success}
            </div>
          )}
          
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="bg-white rounded-xl"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="bg-white rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="bg-white rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter className="pb-6">
          <Button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ProfilePictureForm({ user }: { user: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      // 1. Initialize Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 2. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // 4. Save to database
      await updateProfilePictureAction(publicUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl border-0">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center text-lg font-bold">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
          </div>
          Profile Picture
        </CardTitle>
        <CardDescription className="text-slate-500 ml-11">
          Used as the reference photo for AI Selfie Verification during clock-in. Make sure your face is clearly visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 font-medium mb-4">
            {error}
          </div>
        )}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <input 
              type="file" 
              id="profile-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={isUploading}
            />
            <label htmlFor="profile-upload">
              <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                <UploadCloud className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload New Photo"}
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-2">JPEG or PNG under 5MB.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminGlobalSettingsForm({ initialRequireSelfie }: { initialRequireSelfie: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    startTransition(async () => {
      await updateGlobalSettingsAction(checked);
    });
  };

  return (
    <Card className="bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm rounded-xl border-0">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center text-lg font-bold">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
            <SettingsIcon className="w-4 h-4 text-indigo-600" />
          </div>
          Global Organization Settings
        </CardTitle>
        <CardDescription className="text-slate-500 ml-11">
          Manage system-wide behavior and security policies. (Admin Only)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Require AI Selfie Verification</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              When enabled, employees must take a photo when clocking in. The AI will compare it to their profile picture to prevent buddy punching.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              defaultChecked={initialRequireSelfie} 
              onChange={handleToggle}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
