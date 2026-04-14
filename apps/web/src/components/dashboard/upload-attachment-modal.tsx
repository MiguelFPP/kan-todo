"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Paperclip, FileIcon, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UploadAttachmentModalProps {
  taskId: string;
  taskTitle: string;
}

export default function UploadAttachmentModal({ taskId, taskTitle }: UploadAttachmentModalProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetchWithAuth(`/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      setOpen(false);
      setFile(null);
      alert("Attachment uploaded successfully!");
    },
    onError: (error: any) => {
      alert(`Upload failed: ${error.message}`);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    mutation.mutate(formData);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Paperclip size={14} />
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
          <div className="flex flex-col space-y-1.5">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
              Add Attachment
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Upload a file to task: <span className="font-medium text-foreground">{taskTitle}</span>
            </DialogPrimitive.Description>
          </div>

          <div className="py-4 space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2 text-center">
                {file ? (
                  <>
                    <FileIcon className="text-primary" size={32} />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Paperclip className="text-muted-foreground" size={32} />
                    <span className="text-sm">Click to select or drag and drop</span>
                    <span className="text-xs text-muted-foreground">Any file up to 10MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogPrimitive.Close>
            <Button
              onClick={handleUpload}
              disabled={!file || mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending && <Loader2 className="animate-spin" size={16} />}
              {mutation.isPending ? "Uploading..." : "Upload File"}
            </Button>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
