"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteButton({ itemName = "item" }: { itemName?: string }) {
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger 
        type="button"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
        title={`Delete ${itemName}`}
        disabled={pending}
        onClick={(e) => {
          formRef.current = e.currentTarget.closest('form');
        }}
      >
        <Trash2 className="w-4 h-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900">Delete {itemName}?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            Are you sure you want to delete this {itemName.toLowerCase()}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
