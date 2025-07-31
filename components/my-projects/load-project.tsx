"use client";
import { useState, useRef } from "react";
import { Import } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/loading";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export const LoadProject = ({
  fullXsBtn = false,
  onSuccess,
}: {
  fullXsBtn?: boolean;
  onSuccess: (project: Project) => void;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset state when dialog is reopened
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setUrl("");
      setSelectedFile(null);
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (isLoading) return;
    if (selectedFile) {
      setIsLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const htmlContent = event.target?.result as string;
          onSuccess({
            html: htmlContent,
            prompts: [],
            title: "Imported Project",
            user_id: "local",
            space_id: "local"
          });
          toast.success("Project imported from file!");
          setOpen(false);
        };
        reader.readAsText(selectedFile);
      } catch {
        toast.error("Failed to import the project from file.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (url) {
      setIsLoading(true);
      try {
        // Implement your own logic to import a project from a URL
        toast.success("Project imported successfully!");
        setOpen(false);
        setUrl("");
      } catch (error: unknown) {
        // Type guard for error object
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { redirect?: string; error?: string } } }).response === "object"
        ) {
          const errObj = error as { response?: { data?: { redirect?: string; error?: string } } };
          if (errObj.response?.data?.redirect) {
            return router.push(errObj.response.data.redirect);
          }
          toast.error(
            errObj.response?.data?.error ?? "Failed to import the project."
          );
        } else {
          toast.error("Failed to import the project.");
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }
    toast.error("Please select a file or enter a URL.");
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <div>
          <Button variant="outline" className="max-lg:hidden">
            <Import className="size-4 mr-1.5" />
            Load existing Project
          </Button>
          <Button variant="outline" size="sm" className="lg:hidden">
            {fullXsBtn && <Import className="size-3.5 mr-1" />}
            Load
            {fullXsBtn && " existing Project"}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !p-0 !rounded-3xl !bg-white !border-neutral-100 overflow-hidden text-center">
        <DialogTitle className="hidden" />
        <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
          <p className="text-2xl font-semibold text-neutral-950">
            Import a Project
          </p>
          <p className="text-base text-neutral-500 mt-1.5">
            Enter the URL of your project to import it.
          </p>
        </header>
        <main className="space-y-4 px-9 pb-9 pt-2">
          <div>
            <p className="text-sm text-neutral-700 mb-2">
              Load HTML from your computer
            </p>
            <Input
              type="file"
              accept=".html"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
              }}
              className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
            />
            {selectedFile && (
              <div className="text-green-600 text-xs mt-1">File selected: {selectedFile.name}</div>
            )}
          </div>
          <div className="text-sm text-neutral-700 mb-2">OR</div>
          <div>
            <p className="text-sm text-neutral-700 mb-2">Enter your Project URL</p>
            <Input
              type="text"
              placeholder="https://example.com/my-project"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
            />
          </div>
          <div>
            <p className="text-sm text-neutral-700 mb-2">Then, let&apos;s import it!</p>
            <Button
              variant="black"
              onClick={handleImport}
              className="relative w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loading
                    overlay={false}
                    className="ml-2 size-4 animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>Import Project</>
              )}
            </Button>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
};
