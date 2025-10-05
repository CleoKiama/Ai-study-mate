"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ManagedFile } from "./page";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/misc";
import { Loader2 } from "lucide-react";

type NewFile = {
  id: string;
  file: File;
  name: string;
  sizeLabel: string;
  typeLabel: string;
  addedAt: string;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function Client({
  initialManagedFiles,
}: {
  initialManagedFiles: ManagedFile[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [managedFiles, setManagedFiles] =
    useState<ManagedFile[]>(initialManagedFiles);
  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ManagedFile | null>(null);

  const totalNewSize = useMemo(
    () => newFiles.reduce((acc, f) => acc + f.file.size, 0),
    [newFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    addNewFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      addNewFiles(files);
    },
    [],
  );

  function addNewFiles(files: File[]) {
    const mapped: NewFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      typeLabel: file.type?.split("/")[1]?.toUpperCase() || "UNKNOWN",
      addedAt: new Date().toISOString().split("T")[0],
    }));
    setNewFiles((prev) => [...prev, ...mapped]);
  }

  function removeNewFile(id: string) {
    setNewFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUploadClick() {
    if (newFiles.length === 0) return;
    setUploading(true);
    try {
      // Upload sequentially to preserve current API expectations
      for (const nf of newFiles) {
        const fd = new FormData();
        fd.append("doc", nf.file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data?.message || `Failed to upload ${nf.name}`);
        }
      }
      // Clear pending selection and refresh managed list from server
      setNewFiles([]);
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId: string) {
    console.log("deleting fileId =>", fileId);
    if (!fileId) return console.log("no file id added");
    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/upload/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status !== 204) {
        const data = await safeJson(res);
        throw new Error(data?.message || "Delete failed");
      }
      // Optimistically update and refresh to sync server
      setManagedFiles((prev) => prev.filter((f) => f.id !== fileId));
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmTarget) return;
    await handleDelete(confirmTarget.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground">
          Upload your study materials to generate AI summaries and quizzes
        </p>
      </div>

      {/* Managed Files (from DB) */}
      <Card className="border-l-4 border-l-emerald-500/50">
        <CardHeader>
          <CardTitle>Managed Files ({managedFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {managedFiles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No managed files yet.
            </div>
          ) : (
            <div className="space-y-3">
              {managedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      📄
                    </div>
                    <div>
                      <h4 className="font-medium">{f.filename}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {formatDate(f.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmTarget(f)}
                      disabled={deletingId === f.id}
                    >
                      {deletingId === f.id ? (
                        <>
                          Deleting
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Are you sure you want to delete "{confirmTarget?.filename}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingId === confirmTarget?.id}
            >
              {deletingId === confirmTarget?.id ? (
                <>
                  Deleting
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <h3 className="text-lg font-medium">
                  Drag and drop your files here
                </h3>
                <p className="text-sm text-muted-foreground">
                  Or click to browse and select files
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  name="doc"
                />
                <Button variant="secondary" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                <Button
                  onClick={handleUploadClick}
                  disabled={uploading || newFiles.length === 0}
                >
                  <span>{uploading ? "Uploading..." : "Upload"}</span>
                  {uploading && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, TXT
                {newFiles.length > 0 && (
                  <>
                    {" • "}Selected: {newFiles.length}{" "}
                    {`(${formatFileSize(totalNewSize)})`}
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Files (selected but not uploaded yet) */}
      <Card className="border-l-4 border-l-blue-500/50">
        <CardHeader>
          <CardTitle>New Files ({newFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {newFiles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No new files selected.
            </div>
          ) : (
            <div className="space-y-3">
              {newFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      📄
                    </div>
                    <div>
                      <h4 className="font-medium">{f.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {f.sizeLabel} • {f.typeLabel} • Added {f.addedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNewFile(f.id)}
                      disabled={uploading}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
