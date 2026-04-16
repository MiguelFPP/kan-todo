"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { TaskDto, TaskStatus } from "@kan-todo/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MoreHorizontal, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UploadAttachmentModal from "./upload-attachment-modal";

// DND Kit Imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  useDndContext,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);

  const { data: tasks = [], isLoading } = useQuery<TaskDto[]>({
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

  // Sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Allow normal clicks on buttons without starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {COLUMNS.map((col) => (
          <div key={col.status} className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    let newStatus: TaskStatus | null = null;

    if (COLUMNS.some((c) => c.status === overId)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus && activeTask.status !== newStatus) {
      updateStatusMutation.mutate({ taskId: activeTaskId, status: newStatus });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-h-[500px]">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          return (
            <KanbanColumn key={col.status} column={col} tasks={columnTasks} />
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// --- Sub-components ---

interface ColumnProps {
  column: { label: string; status: TaskStatus };
  tasks: TaskDto[];
}

function KanbanColumn({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useSortable({
    id: column.status,
    data: {
      type: "Column",
      column,
    },
  });

  const { over } = useDndContext();

  // Determine if we are hovering over this column or any of its tasks
  const isOverColumn = over
    ? over.id === column.status || tasks.some((t) => t.id === over.id)
    : false;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-4 bg-muted/30 rounded-lg p-2 min-h-[500px] transition-colors duration-200",
        isOverColumn && "bg-primary/10 ring-2 ring-primary/20 shadow-inner",
      )}
    >
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {column.label}
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">
            {tasks.length}
          </span>
        </h3>
      </div>

      <SortableContext
        id={column.status}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 h-full">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-muted-foreground/50 transition-colors text-center">
              <p className="text-[10px] uppercase font-bold tracking-tighter">
                Drop here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task }: { task: TaskDto }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 h-24 border-2 border-dashed border-primary rounded-xl bg-primary/5"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} attributes={attributes} listeners={listeners} />
    </div>
  );
}

interface TaskCardProps {
  task: TaskDto;
  isOverlay?: boolean;
  attributes?: any;
  listeners?: any;
}

function TaskCard({ task, isOverlay, attributes, listeners }: TaskCardProps) {
  return (
    <Card
      className={cn(
        "group hover:border-primary/50 transition-all shadow-sm select-none",
        isOverlay && "border-primary shadow-xl rotate-2 scale-105",
      )}
      onClick={() => {
        if (!isOverlay) {
          console.log("Task details will open here:", task.id);
          // Future: openTaskDetail(task.id)
        }
      }}
    >
      <CardHeader className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          {/* DRAG HANDLE AREA */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-muted transition-colors"
            onClick={(e) => e.stopPropagation()} // Prevent card click when dragging
          >
            <GripVertical
              size={14}
              className="text-muted-foreground/30 group-hover:text-primary transition-colors"
            />
            <span
              className={cn(
                "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                task.priority > 5
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700",
              )}
            >
              P{task.priority}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <UploadAttachmentModal taskId={task.id} taskTitle={task.title} />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Options clicked for task:", task.id);
              }}
            >
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>
        <CardTitle className="text-sm font-medium leading-snug cursor-pointer hover:text-primary transition-colors">
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
    </Card>
  );
}
