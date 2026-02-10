import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTodos } from "@/hooks/use-todos";

describe("useTodos", () => {
  it("初期状態では空のTODOリストを返す", () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.filter).toBe("all");
    expect(result.current.loaded).toBe(true);
  });

  it("TODOを追加できる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("テストタスク");
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe("テストタスク");
    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[0].completedAt).toBeNull();
    expect(result.current.totalCount).toBe(1);
    expect(result.current.activeCount).toBe(1);
  });

  it("指定した日付でTODOを追加できる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク", "2025-01-15");
    });

    expect(result.current.todos[0].createdAt).toBe("2025-01-15");
  });

  it("空文字やスペースのみのTODOは追加されない", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("");
    });
    expect(result.current.todos).toHaveLength(0);

    act(() => {
      result.current.addTodo("   ");
    });
    expect(result.current.todos).toHaveLength(0);
  });

  it("TODOのテキストがトリムされる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("  テスト  ");
    });

    expect(result.current.todos[0].text).toBe("テスト");
  });

  it("TODOの完了状態を切り替えられる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.todos[0].completedAt).toBeTruthy();
    expect(result.current.activeCount).toBe(0);

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[0].completedAt).toBeNull();
    expect(result.current.activeCount).toBe(1);
  });

  it("TODOを削除できる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク1");
      result.current.addTodo("タスク2");
    });

    expect(result.current.todos).toHaveLength(2);

    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
  });

  it("完了日を更新できる", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク");
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    act(() => {
      result.current.updateCompletedAt(id, "2025-06-01");
    });

    expect(result.current.todos[0].completedAt).toBe("2025-06-01");
  });

  describe("フィルター機能", () => {
    it("「すべて」フィルターで全件表示される", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
      });

      const id = result.current.todos[0].id;
      act(() => {
        result.current.toggleTodo(id);
      });

      act(() => {
        result.current.setFilter("all");
      });

      expect(result.current.todos).toHaveLength(2);
    });

    it("「未完了」フィルターで未完了のみ表示される", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
      });

      const id = result.current.todos[0].id;
      act(() => {
        result.current.toggleTodo(id);
      });

      act(() => {
        result.current.setFilter("active");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].completed).toBe(false);
    });

    it("「完了済み」フィルターで完了のみ表示される", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
      });

      const id = result.current.todos[0].id;
      act(() => {
        result.current.toggleTodo(id);
      });

      act(() => {
        result.current.setFilter("completed");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].completed).toBe(true);
    });
  });

  describe("localStorage連携", () => {
    it("TODOがlocalStorageに保存される", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("保存テスト");
      });

      const stored = JSON.parse(localStorage.getItem("todos")!);
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe("保存テスト");
    });

    it("localStorageからTODOが復元される", () => {
      const saved = [
        {
          id: "saved-1",
          text: "復元タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
        },
      ];
      localStorage.setItem("todos", JSON.stringify(saved));

      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("復元タスク");
    });

    it("localStorageのデータが不正でも空配列を返す", () => {
      localStorage.setItem("todos", "invalid json{{{");

      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toEqual([]);
    });
  });

  it("新しいTODOがリストの先頭に追加される", () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo("タスク1");
    });
    act(() => {
      result.current.addTodo("タスク2");
    });

    expect(result.current.todos[0].text).toBe("タスク2");
    expect(result.current.todos[1].text).toBe("タスク1");
  });
});
