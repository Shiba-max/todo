"use client";

import { useTodos } from "@/hooks/use-todos";
import { TodoInput } from "@/components/todo-input";
import { TodoItem } from "@/components/todo-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ListFilter, Search, Tag } from "lucide-react";
import type { Filter, SortKey } from "@/types/todo";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "manual", label: "手動並び替え" },
  { value: "createdAt-desc", label: "登録日（新しい順）" },
  { value: "createdAt-asc", label: "登録日（古い順）" },
  { value: "text-asc", label: "テキスト（昇順）" },
  { value: "text-desc", label: "テキスト（降順）" },
];

export function TodoList() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    updateCompletedAt,
    updateTodo,
    deleteTodo,
    deleteCompleted,
    completeAll,
    undo,
    canUndo,
    reorderTodos,
    activeCount,
    totalCount,
    loaded,
    allTags,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
  } = useTodos();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTodos(String(active.id), String(over.id));
    }
  };

  if (!loaded) return null;

  const completedCount = totalCount - activeCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isDragEnabled = sortKey === "manual";

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
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
      <div className="rounded-2xl border border-white/60 bg-white/50 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur-md space-y-5 dark:border-white/10 dark:bg-gray-900/50 dark:shadow-none">
        {/* Input */}
        <TodoInput onAdd={addTodo} />

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-1.5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="タスク達成率"
            >
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

        {/* Search & Sort */}
        {totalCount > 0 && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300 dark:text-indigo-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索..."
                className="pl-9 h-9 rounded-lg border-indigo-200 bg-white/70 text-sm shadow-sm focus-visible:ring-indigo-400 placeholder:text-indigo-300 dark:border-white/10 dark:bg-gray-800/50 dark:placeholder:text-gray-500"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="並び替え"
              className="h-9 rounded-lg border border-indigo-200 bg-white/70 px-2 text-xs text-indigo-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-white/10 dark:bg-gray-800/50 dark:text-indigo-300"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
                    : "border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 dark:border-white/10 dark:text-indigo-300 dark:hover:bg-gray-800"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-indigo-400" />
            <Badge
              asChild
              variant={selectedTag === null ? "default" : "outline"}
              className={`cursor-pointer text-xs transition-all ${
                selectedTag === null
                  ? "bg-indigo-500 text-white hover:bg-indigo-600"
                  : "border-indigo-200 text-indigo-500 hover:bg-indigo-50 dark:border-white/10 dark:text-indigo-300"
              }`}
            >
              <button onClick={() => setSelectedTag(null)}>すべて</button>
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                asChild
                variant={selectedTag === tag ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-all ${
                  selectedTag === tag
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "border-indigo-200 text-indigo-500 hover:bg-indigo-50 dark:border-white/10 dark:text-indigo-300"
                }`}
              >
                <button onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                  {tag}
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Bulk actions & Undo */}
        {totalCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={completeAll}
                className="rounded-lg text-xs border-indigo-200 text-indigo-500 hover:bg-indigo-50 dark:border-white/10 dark:text-indigo-300 dark:hover:bg-gray-800"
              >
                すべて完了にする
              </Button>
            )}
            {completedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteCompleted}
                className="rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                完了済みを削除
              </Button>
            )}
            {canUndo && (
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                className="rounded-lg text-xs border-indigo-200 text-indigo-500 hover:bg-indigo-50 dark:border-white/10 dark:text-indigo-300 dark:hover:bg-gray-800"
              >
                元に戻す
              </Button>
            )}
          </div>
        )}

        {/* List */}
        <div className="space-y-2.5">
          {todos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 py-8 text-center dark:border-white/10 dark:bg-gray-800/30">
              <p className="text-indigo-300 text-sm dark:text-indigo-500">
                {totalCount === 0
                  ? "TODOがありません。追加してみましょう！"
                  : "該当するTODOがありません。"}
              </p>
            </div>
          ) : isDragEnabled ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdateCompletedAt={updateCompletedAt}
                    onUpdate={updateTodo}
                    isDragEnabled
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdateCompletedAt={updateCompletedAt}
                onUpdate={updateTodo}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <p className="text-center text-xs text-indigo-300 dark:text-indigo-500">
            残り {activeCount} 件のタスク
          </p>
        )}
      </div>
    </div>
  );
}
