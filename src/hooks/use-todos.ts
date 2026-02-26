"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Filter, type SortKey, type Todo } from "@/types/todo";

const STORAGE_KEY = "todos";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((item) => ({
      ...(item as unknown as Todo),
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    }));
  } catch {
    return [];
  }
}

function sortTodos(todos: Todo[], sortKey: SortKey): Todo[] {
  if (sortKey === "manual") return todos;
  const sorted = [...todos];
  switch (sortKey) {
    case "createdAt-desc":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "createdAt-asc":
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "text-asc":
      sorted.sort((a, b) => a.text.localeCompare(b.text, "ja"));
      break;
    case "text-desc":
      sorted.sort((a, b) => b.text.localeCompare(a.text, "ja"));
      break;
  }
  return sorted;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("manual");
  const [loaded] = useState(true);
  const [canUndo, setCanUndo] = useState(false);

  // Undo stack
  const undoStackRef = useRef<Todo[][]>([]);
  const pushUndo = useCallback(() => {
    setTodos((current) => {
      undoStackRef.current = [...undoStackRef.current.slice(-19), current];
      setCanUndo(true);
      return current;
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, loaded]);

  const addTodo = useCallback((text: string, createdAt?: string, tags?: string[]) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: createdAt || todayString(),
        completedAt: null,
        tags: tags ?? [],
      },
      ...prev,
    ]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? todayString() : null,
            }
          : todo
      )
    );
  }, []);

  const updateCompletedAt = useCallback((id: string, date: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completedAt: date } : todo
      )
    );
  }, []);

  const updateTodo = useCallback(
    (id: string, updates: { text?: string; tags?: string[] }) => {
      pushUndo();
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo
        )
      );
    },
    [pushUndo]
  );

  const deleteTodo = useCallback((id: string) => {
    pushUndo();
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, [pushUndo]);

  const deleteCompleted = useCallback(() => {
    pushUndo();
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, [pushUndo]);

  const completeAll = useCallback(() => {
    pushUndo();
    setTodos((prev) =>
      prev.map((todo) =>
        todo.completed ? todo : { ...todo, completed: true, completedAt: todayString() }
      )
    );
  }, [pushUndo]);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    setCanUndo(undoStackRef.current.length > 0);
    setTodos(prev);
  }, []);

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const todo of todos) {
      for (const tag of todo.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let result = todos.filter((todo) => {
      if (filter === "active" && todo.completed) return false;
      if (filter === "completed" && !todo.completed) return false;
      if (selectedTag && !todo.tags.includes(selectedTag)) return false;
      if (query && !todo.text.toLowerCase().includes(query)) return false;
      return true;
    });
    result = sortTodos(result, sortKey);
    return result;
  }, [todos, filter, selectedTag, searchQuery, sortKey]);

  const activeCount = todos.filter((t) => !t.completed).length;

  return {
    todos: filteredTodos,
    allTodos: todos,
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
    totalCount: todos.length,
    loaded,
    allTags,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
  };
}
