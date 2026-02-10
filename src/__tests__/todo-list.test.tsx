import { render, screen, within } from "@testing-library/react";
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

  it("TODOを削除できる", async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "削除タスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(screen.getByText("削除タスク")).toBeInTheDocument();

    // Find the delete button (Trash2 icon button)
    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons.find(
      (btn) => !btn.textContent?.includes("追加") &&
               !btn.textContent?.includes("すべて") &&
               !btn.textContent?.includes("未完了") &&
               !btn.textContent?.includes("完了済み")
    );
    await user.click(deleteButton!);

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
});
