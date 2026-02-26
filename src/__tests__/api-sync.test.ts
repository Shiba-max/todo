import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTodos } from "@/hooks/use-todos";
import { todosApi } from "@/lib/api";

const mockedApi = vi.mocked(todosApi);

describe("API同期", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addTodoでAPIのcreateとreorderが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("新しいタスク");
    });

    expect(mockedApi.create).toHaveBeenCalledTimes(1);
    expect(mockedApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "新しいタスク",
        completed: false,
      }),
      0
    );
    expect(mockedApi.reorder).toHaveBeenCalledTimes(1);
  });

  it("toggleTodoでAPIのupdateが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    vi.clearAllMocks();
    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(mockedApi.update).toHaveBeenCalledTimes(1);
    expect(mockedApi.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        completed: true,
        completedAt: expect.any(String),
      })
    );
  });

  it("updateTodoでAPIのupdateが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("元テキスト");
    });

    vi.clearAllMocks();
    const id = result.current.todos[0].id;

    act(() => {
      result.current.updateTodo(id, { text: "新テキスト" });
    });

    expect(mockedApi.update).toHaveBeenCalledTimes(1);
    expect(mockedApi.update).toHaveBeenCalledWith(id, { text: "新テキスト" });
  });

  it("deleteTodoでAPIのremoveが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("削除タスク");
    });

    vi.clearAllMocks();
    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });

    expect(mockedApi.remove).toHaveBeenCalledTimes(1);
    expect(mockedApi.remove).toHaveBeenCalledWith(id);
  });

  it("deleteCompletedでAPIのdeleteCompletedが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    const id = result.current.todos[0].id;
    act(() => {
      result.current.toggleTodo(id);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.deleteCompleted();
    });

    expect(mockedApi.deleteCompleted).toHaveBeenCalledTimes(1);
  });

  it("completeAllでAPIのsyncAllが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク1");
      result.current.addTodo("タスク2");
    });

    vi.clearAllMocks();

    act(() => {
      result.current.completeAll();
    });

    expect(mockedApi.syncAll).toHaveBeenCalledTimes(1);
    const synced = mockedApi.syncAll.mock.calls[0][0];
    expect(synced.every((t) => t.completed)).toBe(true);
  });

  it("undoでAPIのsyncAllが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.undo();
    });

    expect(mockedApi.syncAll).toHaveBeenCalledTimes(1);
  });

  it("reorderTodosでAPIのreorderが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク1");
      result.current.addTodo("タスク2");
    });

    vi.clearAllMocks();

    const id1 = result.current.todos[0].id;
    const id2 = result.current.todos[1].id;

    act(() => {
      result.current.reorderTodos(id1, id2);
    });

    expect(mockedApi.reorder).toHaveBeenCalledTimes(1);
    const reorderArg = mockedApi.reorder.mock.calls[0][0];
    expect(reorderArg).toHaveLength(2);
    expect(reorderArg[0]).toHaveProperty("id");
    expect(reorderArg[0]).toHaveProperty("order", 0);
    expect(reorderArg[1]).toHaveProperty("order", 1);
  });

  it("updateCompletedAtでAPIのupdateが呼ばれる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.updateCompletedAt(id, "2025-12-01");
    });

    expect(mockedApi.update).toHaveBeenCalledTimes(1);
    expect(mockedApi.update).toHaveBeenCalledWith(id, { completedAt: "2025-12-01" });
  });

  it("空文字のaddTodoではAPIが呼ばれない", () => {
    const { result } = renderHook(() => useTodos());

    vi.clearAllMocks();

    act(() => {
      result.current.addTodo("");
    });

    expect(mockedApi.create).not.toHaveBeenCalled();
  });
});
