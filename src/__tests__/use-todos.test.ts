import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
    expect(result.current.todos[0].tags).toEqual([]);
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
          tags: [],
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

    it("tagsフィールドがない既存データにデフォルト値が設定される", () => {
      const saved = [
        {
          id: "old-1",
          text: "古いタスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
        },
      ];
      localStorage.setItem("todos", JSON.stringify(saved));

      const { result } = renderHook(() => useTodos());

      expect(result.current.todos[0].tags).toEqual([]);
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

  describe("タグ機能", () => {
    it("タグ付きでTODOを追加できる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク", undefined, ["仕事", "重要"]);
      });

      expect(result.current.todos[0].tags).toEqual(["仕事", "重要"]);
    });

    it("タグを指定しない場合は空配列になる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク");
      });

      expect(result.current.todos[0].tags).toEqual([]);
    });

    it("allTagsが全TODOのユニークなタグ一覧をソートして返す", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1", undefined, ["仕事", "重要"]);
        result.current.addTodo("タスク2", undefined, ["個人", "仕事"]);
      });

      expect(result.current.allTags).toEqual(["仕事", "個人", "重要"]);
    });

    it("タグがない場合allTagsは空配列", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク");
      });

      expect(result.current.allTags).toEqual([]);
    });

    it("selectedTagでフィルタリングできる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("仕事タスク", undefined, ["仕事"]);
        result.current.addTodo("個人タスク", undefined, ["個人"]);
        result.current.addTodo("両方タスク", undefined, ["仕事", "個人"]);
      });

      act(() => {
        result.current.setSelectedTag("仕事");
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos.map((t) => t.text).sort()).toEqual(
        ["両方タスク", "仕事タスク"].sort()
      );
    });

    it("selectedTagがnullの場合は全件表示される", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1", undefined, ["仕事"]);
        result.current.addTodo("タスク2", undefined, ["個人"]);
      });

      act(() => {
        result.current.setSelectedTag(null);
      });

      expect(result.current.todos).toHaveLength(2);
    });

    it("ステータスフィルターとタグフィルターを組み合わせられる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("仕事タスク1", undefined, ["仕事"]);
      });
      act(() => {
        result.current.addTodo("仕事タスク2", undefined, ["仕事"]);
      });
      act(() => {
        result.current.addTodo("個人タスク", undefined, ["個人"]);
      });

      // todos[0] = 個人タスク, todos[1] = 仕事タスク2, todos[2] = 仕事タスク1
      // Complete 仕事タスク2
      const id = result.current.todos[1].id;
      act(() => {
        result.current.toggleTodo(id);
      });

      act(() => {
        result.current.setFilter("active");
      });

      act(() => {
        result.current.setSelectedTag("仕事");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("仕事タスク1");
    });
  });

  describe("updateTodo", () => {
    it("TODOのテキストを更新できる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("元のテキスト");
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(id, { text: "更新後テキスト" });
      });

      expect(result.current.todos[0].text).toBe("更新後テキスト");
    });

    it("TODOのタグを更新できる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク", undefined, ["仕事"]);
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(id, { tags: ["個人", "買い物"] });
      });

      expect(result.current.todos[0].tags).toEqual(["個人", "買い物"]);
    });

    it("テキストとタグを同時に更新できる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("元テキスト", undefined, ["仕事"]);
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(id, { text: "新テキスト", tags: ["個人"] });
      });

      expect(result.current.todos[0].text).toBe("新テキスト");
      expect(result.current.todos[0].tags).toEqual(["個人"]);
    });

    it("他のTODOに影響を与えない", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(id, { text: "更新タスク2" });
      });

      expect(result.current.todos[1].text).toBe("タスク1");
    });
  });

  describe("一括操作", () => {
    it("completeAllですべてのTODOが完了になる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
      });

      act(() => {
        result.current.completeAll();
      });

      expect(result.current.todos.every((t) => t.completed)).toBe(true);
      expect(result.current.activeCount).toBe(0);
    });

    it("deleteCompletedで完了済みTODOのみ削除される", () => {
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
        result.current.deleteCompleted();
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].completed).toBe(false);
    });
  });

  describe("Undo機能", () => {
    it("削除をundoできる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク");
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(id);
      });

      expect(result.current.todos).toHaveLength(0);

      act(() => {
        result.current.undo();
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("タスク");
    });

    it("編集をundoできる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("元のテキスト");
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(id, { text: "更新テキスト" });
      });

      expect(result.current.todos[0].text).toBe("更新テキスト");

      act(() => {
        result.current.undo();
      });

      expect(result.current.todos[0].text).toBe("元のテキスト");
    });

    it("undoスタックが空の場合undoしても何も起きない", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク");
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.todos).toHaveLength(1);
    });

    it("canUndoが正しく更新される", () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.canUndo).toBe(false);

      act(() => {
        result.current.addTodo("タスク");
      });

      const id = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(id);
      });

      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(false);
    });
  });

  describe("検索機能", () => {
    it("searchQueryでテキストを絞り込める", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("買い物リスト");
        result.current.addTodo("仕事のメール");
        result.current.addTodo("買い物メモ");
      });

      act(() => {
        result.current.setSearchQuery("買い物");
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos.every((t) => t.text.includes("買い物"))).toBe(true);
    });

    it("大文字小文字を区別しない検索", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("Hello World");
        result.current.addTodo("Goodbye");
      });

      act(() => {
        result.current.setSearchQuery("hello");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("Hello World");
    });
  });

  describe("並び替え機能", () => {
    it("createdAt-descで登録日降順にソートされる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("古いタスク", "2025-01-01");
        result.current.addTodo("新しいタスク", "2025-06-01");
      });

      act(() => {
        result.current.setSortKey("createdAt-desc");
      });

      expect(result.current.todos[0].text).toBe("新しいタスク");
      expect(result.current.todos[1].text).toBe("古いタスク");
    });

    it("createdAt-ascで登録日昇順にソートされる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("古いタスク", "2025-01-01");
        result.current.addTodo("新しいタスク", "2025-06-01");
      });

      act(() => {
        result.current.setSortKey("createdAt-asc");
      });

      expect(result.current.todos[0].text).toBe("古いタスク");
      expect(result.current.todos[1].text).toBe("新しいタスク");
    });

    it("text-ascでテキスト昇順にソートされる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("バナナ");
        result.current.addTodo("アップル");
      });

      act(() => {
        result.current.setSortKey("text-asc");
      });

      expect(result.current.todos[0].text).toBe("アップル");
      expect(result.current.todos[1].text).toBe("バナナ");
    });

    it("reorderTodosで並び順を変更できる", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("タスク1");
        result.current.addTodo("タスク2");
        result.current.addTodo("タスク3");
      });

      // Order is: タスク3, タスク2, タスク1 (newest first)
      const id3 = result.current.todos[0].id;
      const id1 = result.current.todos[2].id;

      act(() => {
        result.current.reorderTodos(id3, id1);
      });

      expect(result.current.todos[0].text).toBe("タスク2");
      expect(result.current.todos[2].text).toBe("タスク3");
    });
  });
});
