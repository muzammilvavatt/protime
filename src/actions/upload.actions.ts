"use server";

import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

export async function uploadFileToServerAction(formData: FormData, path: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File | Blob;
  if (!file) throw new Error("No file provided");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from('uploads')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(path);

  return publicUrl;
}
