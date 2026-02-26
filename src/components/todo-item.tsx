"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CalendarDays, CalendarCheck, GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCompletedAt: (id: string, date: string) => void;
  onUpdate: (id: string, updates: { text?: string; tags?: string[] }) => void;
  isDragEnabled?: boolean;
};

export function TodoItem({ todo, onToggle, onDelete, onUpdateCompletedAt, onUpdate, isDragEnabled = false }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };

  const confirmEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate(todo.id, { text: trimmed });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      confirmEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border p-4 transition-all duration-300 ${
        todo.completed
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-teal-950/30"
          : "border-indigo-100 bg-white/70 shadow-sm hover:shadow-md hover:border-indigo-200 dark:border-white/10 dark:bg-gray-800/50 dark:hover:border-white/20"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        {isDragEnabled && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
            aria-label="ドラッグして並び替え"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className={`h-5 w-5 rounded-full transition-colors ${
            todo.completed
              ? "border-emerald-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              : "border-indigo-300 dark:border-indigo-600"
          }`}
        />
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={confirmEdit}
            className="flex-1 h-8 rounded-lg border-indigo-300 bg-white text-sm focus-visible:ring-indigo-400 dark:border-indigo-600 dark:bg-gray-800"
            data-testid="edit-input"
          />
        ) : (
          <span
            onDoubleClick={startEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "F2") {
                e.preventDefault();
                startEditing();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`「${todo.text}」を編集`}
            className={`flex-1 transition-all duration-300 cursor-text ${
              todo.completed
                ? "text-emerald-600/70 line-through dark:text-emerald-400/70"
                : "text-gray-800 font-medium dark:text-gray-100"
            }`}
          >
            {todo.text}
          </span>
        )}
        {todo.completed && (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/50"
          >
            完了
          </Badge>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`「${todo.text}」を削除`}
              className="h-8 w-8 p-0 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>削除の確認</AlertDialogTitle>
              <AlertDialogDescription>
                「{todo.text}」を削除しますか？この操作は元に戻すことができます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(todo.id)}>
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {todo.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
          {todo.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-8 text-xs">
        <div className="flex items-center gap-1 text-indigo-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>登録: {todo.createdAt}</span>
        </div>
        {todo.completed && (
          <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>完了:</span>
            <Input
              type="date"
              value={todo.completedAt ?? ""}
              onChange={(e) => onUpdateCompletedAt(todo.id, e.target.value)}
              className="h-6 w-auto border-emerald-200 bg-white/60 px-1.5 text-xs shadow-none focus-visible:ring-emerald-400 dark:border-emerald-700/50 dark:bg-gray-800/50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
