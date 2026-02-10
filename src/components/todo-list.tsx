"use client";

import { useTodos } from "@/hooks/use-todos";
import { TodoInput } from "@/components/todo-input";
import { TodoItem } from "@/components/todo-item";
import { Button } from "@/components/ui/button";
import { ClipboardList, ListFilter } from "lucide-react";
import type { Filter } from "@/types/todo";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export function TodoList() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    updateCompletedAt,
    deleteTodo,
    activeCount,
    totalCount,
    loaded,
  } = useTodos();

  if (!loaded) return null;

  const completedCount = totalCount - activeCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg shadow-indigo-200">
            <ClipboardList className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TODO リスト
          </h1>
        </div>
        {totalCount > 0 && (
          <p className="text-sm text-indigo-400">
            {completedCount} / {totalCount} 件完了
          </p>
        )}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/60 bg-white/50 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur-md space-y-5">
        {/* Input */}
        <TodoInput onAdd={addTodo} />

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-1.5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-right text-xs font-medium text-indigo-400">
              {progressPercent}% 達成
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-indigo-400" />
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={`rounded-lg text-xs transition-all ${
                  filter === f.value
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-purple-600"
                    : "border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {todos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 py-8 text-center">
              <p className="text-indigo-300 text-sm">
                {totalCount === 0
                  ? "TODOがありません。追加してみましょう！"
                  : "該当するTODOがありません。"}
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdateCompletedAt={updateCompletedAt}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <p className="text-center text-xs text-indigo-300">
            残り {activeCount} 件のタスク
          </p>
        )}
      </div>
    </div>
  );
}
