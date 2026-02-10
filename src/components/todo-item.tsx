"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CalendarCheck, Trash2 } from "lucide-react";
import type { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCompletedAt: (id: string, date: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onUpdateCompletedAt }: Props) {
  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-300 ${
        todo.completed
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/80"
          : "border-indigo-100 bg-white/70 shadow-sm hover:shadow-md hover:border-indigo-200"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className={`h-5 w-5 rounded-full transition-colors ${
            todo.completed
              ? "border-emerald-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              : "border-indigo-300"
          }`}
        />
        <span
          className={`flex-1 transition-all duration-300 ${
            todo.completed
              ? "text-emerald-600/70 line-through"
              : "text-gray-800 font-medium"
          }`}
        >
          {todo.text}
        </span>
        {todo.completed && (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
          >
            完了
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo.id)}
          className="h-8 w-8 p-0 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-8 text-xs">
        <div className="flex items-center gap-1 text-indigo-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>登録: {todo.createdAt}</span>
        </div>
        {todo.completed && (
          <div className="flex items-center gap-1 text-emerald-500">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>完了:</span>
            <Input
              type="date"
              value={todo.completedAt ?? ""}
              onChange={(e) => onUpdateCompletedAt(todo.id, e.target.value)}
              className="h-6 w-auto border-emerald-200 bg-white/60 px-1.5 text-xs shadow-none focus-visible:ring-emerald-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
