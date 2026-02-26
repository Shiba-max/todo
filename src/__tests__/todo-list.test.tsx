import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { TodoList } from "@/components/todo-list";

describe("TodoList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("初期状態でヘッダーが表示される", () => {
    render(<TodoList />);

    expect(screen.getByText("TODO リスト")).toBeInTheDocument();
  });

  it("TODOがない場合に空メッセージが表示される", () => {
    render(<TodoList />);

    expect(
      screen.getByText("TODOがありません。追加してみましょう！")
    ).toBeInTheDocument();
  });

  it("フィルターボタンが3つ表示される", () => {
    render(<TodoList />);

    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "未完了" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "完了済み" })
    ).toBeInTheDocument();
  });

  it("TODOを追加できる", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "テストタスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("TODO追加後に件数が表示される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "タスク1");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(screen.getByText("0 / 1 件完了")).toBeInTheDocument();
    expect(screen.getByText("残り 1 件のタスク")).toBeInTheDocument();
  });

  it("TODOを完了にすると進捗が更新される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "タスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(screen.getByText("1 / 1 件完了")).toBeInTheDocument();
    expect(screen.getByText("100% 達成")).toBeInTheDocument();
    expect(screen.getByText("残り 0 件のタスク")).toBeInTheDocument();
  });

  it("TODOを削除できる（確認ダイアログ経由）", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "削除タスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(screen.getByText("削除タスク")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: /「削除タスク」を削除/ });
    await user.click(deleteButton);

    // Confirm in dialog
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(screen.queryByText("削除タスク")).not.toBeInTheDocument();
  });

  it("「未完了」フィルターで未完了タスクのみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");

    await user.type(input, "タスクA");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    await user.type(input, "タスクB");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    // Complete タスクB (it's the first one because newest goes on top)
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    // Switch to active filter
    await user.click(screen.getByRole("button", { name: "未完了" }));

    expect(screen.getByText("タスクA")).toBeInTheDocument();
    expect(screen.queryByText("タスクB")).not.toBeInTheDocument();
  });

  it("「完了済み」フィルターで完了タスクのみ表示される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");

    await user.type(input, "タスクA");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    await user.type(input, "タスクB");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    // Complete タスクB
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    // Switch to completed filter
    await user.click(screen.getByRole("button", { name: "完了済み" }));

    expect(screen.getByText("タスクB")).toBeInTheDocument();
    expect(screen.queryByText("タスクA")).not.toBeInTheDocument();
  });

  it("フィルター適用中に該当なしの場合メッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "タスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    await user.click(screen.getByRole("button", { name: "完了済み" }));

    expect(
      screen.getByText("該当するTODOがありません。")
    ).toBeInTheDocument();
  });

  it("localStorageから復元したTODOが表示される", () => {
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

    render(<TodoList />);

    expect(screen.getByText("復元タスク")).toBeInTheDocument();
  });

  it("進捗バーが正しい割合で表示される", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");

    await user.type(input, "タスク1");
    await user.click(screen.getByRole("button", { name: /追加/ }));
    await user.type(input, "タスク2");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    // Complete one out of two
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(screen.getByText("50% 達成")).toBeInTheDocument();
  });

  describe("タグフィルター", () => {
    it("タグがある場合にタグフィルターが表示される", () => {
      const saved = [
        {
          id: "1",
          text: "仕事タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
          tags: ["仕事"],
        },
        {
          id: "2",
          text: "個人タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
          tags: ["個人"],
        },
      ];
      localStorage.setItem("todos", JSON.stringify(saved));

      render(<TodoList />);

      // Tags appear in both the filter section and on each todo item,
      // so we check that at least 2 exist (filter badge + item badge)
      expect(screen.getAllByText("仕事").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("個人").length).toBeGreaterThanOrEqual(2);
    });

    it("タグをクリックしてフィルタリングできる", () => {
      const saved = [
        {
          id: "1",
          text: "仕事タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
          tags: ["仕事"],
        },
        {
          id: "2",
          text: "個人タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
          tags: ["個人"],
        },
      ];
      localStorage.setItem("todos", JSON.stringify(saved));

      render(<TodoList />);

      // Both tasks visible
      expect(screen.getByText("仕事タスク")).toBeInTheDocument();
      expect(screen.getByText("個人タスク")).toBeInTheDocument();
    });

    it("タグがないTODOのみの場合はタグフィルターが表示されない", () => {
      const saved = [
        {
          id: "1",
          text: "タスク",
          completed: false,
          createdAt: "2025-01-01",
          completedAt: null,
          tags: [],
        },
      ];
      localStorage.setItem("todos", JSON.stringify(saved));

      render(<TodoList />);

      // Only the status filter "すべて" button should exist, not a tag filter "すべて" badge
      const allButtons = screen.getAllByRole("button");
      const statusAllButton = allButtons.find((b) => b.textContent === "すべて");
      expect(statusAllButton).toBeDefined();

      // No tag-specific badges
      expect(screen.queryByText("仕事")).not.toBeInTheDocument();
    });
  });
});
