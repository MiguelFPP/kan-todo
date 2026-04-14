"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { TaskDto, TaskStatus } from "@kan-todo/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MoreHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS: { label: string; status: TaskStatus }[] = [
  { label: "Backlog", status: "BACKLOG" },
  { label: "To Do", status: "TODO" },
  { label: "In Progress", status: "IN_PROGRESS" },
  { label: "Done", status: "DONE" },
];

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<TaskDto[]>({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchWithAuth(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      fetchWithAuth(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const sequence: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"];
    const index = sequence.indexOf(current);
    return index < sequence.length - 1 ? sequence[index + 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4 h-full">
      {COLUMNS.map((col) => {
        const columnTasks = tasks?.filter((t) => t.status === col.status) || [];
        return (
          <div key={col.status} className="flex flex-col gap-4 min-w-[280px]">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold flex items-center gap-2">
                {col.label}
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {columnTasks.map((task) => {
                const nextStatus = getNextStatus(task.status);
                return (
                  <Card key={task.id} className="group hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                          task.priority > 5 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                          Priority {task.priority}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={14} />
                        </Button>
                      </div>
                      <CardTitle className="text-sm font-medium leading-snug">
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    {task.dueDate && (
                      <CardContent className="px-4 pb-4 pt-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    )}
                    {nextStatus && (
                      <div className="px-4 pb-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] gap-1 hover:text-primary"
                          onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: nextStatus })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Move to {nextStatus.replace("_", " ")}
                          <ArrowRight size={10} />
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
              {columnTasks.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground">
                   <p className="text-xs">No tasks</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Inline helper for CN if not available in scope
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
