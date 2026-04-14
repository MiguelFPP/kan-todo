"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { ProjectDto } from "@kan-todo/types";
import { cn } from "@/lib/utils";
import { LayoutGrid, Folder, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import CreateProjectModal from "./create-project-modal";

interface SidebarProps {
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
}

export default function Sidebar({
  selectedProjectId,
  onSelectProject,
}: SidebarProps) {
  const router = useRouter();
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { data: projects, isLoading } = useQuery<ProjectDto[]>({
    queryKey: ["projects"],
    queryFn: () => fetchWithAuth("/projects"),
  });

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      router.replace("/login");
      logoutStore();
    }
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl mb-6">
          <LayoutGrid className="text-primary" />
          <span>Kan-Todo</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Workspaces
          </p>

          {isLoading ? (
            <div className="space-y-2 px-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            projects?.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  selectedProjectId === project.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <Folder size={16} />
                <span className="truncate">{project.name}</span>
              </button>
            ))
          )}

          <CreateProjectModal />
        </div>
      </div>

      <div className="mt-auto p-4 border-t space-y-4">
        <div className="px-2">
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
