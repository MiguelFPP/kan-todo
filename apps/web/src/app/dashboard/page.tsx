"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/dashboard/sidebar";
import KanbanBoard from "@/components/dashboard/kanban-board";
import { Plus, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground font-medium">
          Loading session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Search tasks or projects..."
                className="pl-10 bg-background/50 border-none focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell size={20} className="text-muted-foreground" />
            </Button>
            <Button className="gap-2 shadow-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedProjectId ? (
            <div className="h-full flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  Project Board
                </h2>
                <p className="text-muted-foreground text-sm">
                  Manage and track your project tasks.
                </p>
              </div>

              <div className="flex-1">
                <KanbanBoard projectId={selectedProjectId} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="bg-primary/10 p-4 rounded-full">
                <LayoutGrid className="text-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold">Select a Workspace</h2>
              <p className="text-muted-foreground">
                Choose a project from the sidebar to view your Kanban board and
                manage your team's tasks.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Re-using LayoutGrid icon in the empty state
import { LayoutGrid } from "lucide-react";
