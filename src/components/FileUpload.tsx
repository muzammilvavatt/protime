"use client";

import { useRef, useState } from "react";
import { uploadFileAction } from "@/actions/file.actions";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Loader2 } from "lucide-react";

export function FileUpload({ taskId, projectId }: { taskId?: string, projectId?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    setError(null);
    
    if (taskId) formData.append("taskId", taskId);
    if (projectId) formData.append("projectId", projectId);

    try {
      const result = await uploadFileAction(formData);
      
      setIsUploading(false);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    } catch (err) {
      setIsUploading(false);
      setError("File is too large or upload failed.");
    }
  }

  return (
    <form ref={formRef} action={handleUpload} className="flex flex-col space-y-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
      <div className="flex items-center space-x-4">
        <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-colors">
          <div className="flex flex-col items-center space-y-1">
            <UploadCloud className="w-8 h-8 text-zinc-400" />
            <span className="text-sm text-zinc-300 font-medium">Click to select a file</span>
            <span className="text-xs text-zinc-500">PDF, DWG, DXF, PNG, JPG</span>
          </div>
          <input type="file" name="file" className="hidden" required />
        </label>
      </div>
      
      {error && <p className="text-xs text-red-500">{error}</p>}
      
      <Button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-700">
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
        ) : (
          "Upload File"
        )}
      </Button>
    </form>
  );
}
