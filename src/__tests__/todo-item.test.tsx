import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoItem } from "@/components/todo-item";
import type { Todo } from "@/types/todo";

const activeTodo: Todo = {
  id: "1",
  text: "未完了タスク",
  completed: false,
  createdAt: "2025-01-01",
  completedAt: null,
  tags: [],
};

const completedTodo: Todo = {
  id: "2",
  text: "完了タスク",
  completed: true,
  createdAt: "2025-01-01",
  completedAt: "2025-01-05",
  tags: [],
};

const taggedTodo: Todo = {
  id: "3",
  text: "タグ付きタスク",
  completed: false,
  createdAt: "2025-01-01",
  completedAt: null,
  tags: ["仕事", "重要"],
};

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onUpdateCompletedAt: vi.fn(),
  onUpdate: vi.fn(),
};

describe("TodoItem", () => {
  it("未完了TODOのテキストと登録日が表示される", () => {
    render(<TodoItem todo={activeTodo} {...defaultProps} />);

    expect(screen.getByText("未完了タスク")).toBeInTheDocument();
    expect(screen.getByText("登録: 2025-01-01")).toBeInTheDocument();
  });

  it("未完了TODOにはチェックボックスが未チェック状態で表示される", () => {
    render(<TodoItem todo={activeTodo} {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("未完了TODOでは「完了」バッジが表示されない", () => {
    render(<TodoItem todo={activeTodo} {...defaultProps} />);

    expect(screen.queryByText("完了")).not.toBeInTheDocument();
  });

  it("未完了TODOでは完了日入力が表示されない", () => {
    render(<TodoItem todo={activeTodo} {...defaultProps} />);

    expect(screen.queryByText(/完了:/)).not.toBeInTheDocument();
  });

  it("完了TODOにはチェックボックスがチェック状態で表示される", () => {
    render(<TodoItem todo={completedTodo} {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("完了TODOでは「完了」バッジが表示される", () => {
    render(<TodoItem todo={completedTodo} {...defaultProps} />);

    expect(screen.getByText("完了")).toBeInTheDocument();
  });

  it("完了TODOでは完了日が表示される", () => {
    render(<TodoItem todo={completedTodo} {...defaultProps} />);

    expect(screen.getByText(/完了:/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-01-05")).toBeInTheDocument();
  });

  it("チェックボックスをクリックするとonToggleが呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem todo={activeTodo} {...defaultProps} onToggle={onToggle} />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("削除ボタンをクリックして確認後にonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem todo={activeTodo} {...defaultProps} onDelete={onDelete} />
    );

    const deleteButton = screen.getByRole("button", { name: /を削除/ });
    await user.click(deleteButton);

    // Confirmation dialog appears
    expect(screen.getByText("削除の確認")).toBeInTheDocument();

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("削除確認ダイアログでキャンセルするとonDeleteが呼ばれない", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem todo={activeTodo} {...defaultProps} onDelete={onDelete} />
    );

    const deleteButton = screen.getByRole("button", { name: /を削除/ });
    await user.click(deleteButton);

    // Cancel
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it("完了日を変更するとonUpdateCompletedAtが呼ばれる", async () => {
    const user = userEvent.setup();
    const onUpdateCompletedAt = vi.fn();
    render(
      <TodoItem
        todo={completedTodo}
        {...defaultProps}
        onUpdateCompletedAt={onUpdateCompletedAt}
      />
    );

    const dateInput = screen.getByDisplayValue("2025-01-05");
    await user.clear(dateInput);
    await user.type(dateInput, "2025-02-01");

    expect(onUpdateCompletedAt).toHaveBeenCalledWith("2", expect.any(String));
  });

  it("完了TODOのテキストに取り消し線スタイルが適用される", () => {
    render(<TodoItem todo={completedTodo} {...defaultProps} />);

    const textElement = screen.getByText("完了タスク");
    expect(textElement.className).toContain("line-through");
  });

  it("未完了TODOのテキストに取り消し線スタイルが適用されない", () => {
    render(<TodoItem todo={activeTodo} {...defaultProps} />);

    const textElement = screen.getByText("未完了タスク");
    expect(textElement.className).not.toContain("line-through");
  });

  describe("タグ表示", () => {
    it("タグがバッジとして表示される", () => {
      render(<TodoItem todo={taggedTodo} {...defaultProps} />);

      expect(screen.getByText("仕事")).toBeInTheDocument();
      expect(screen.getByText("重要")).toBeInTheDocument();
    });

    it("タグがない場合はタグセクションが表示されない", () => {
      render(<TodoItem todo={activeTodo} {...defaultProps} />);

      expect(screen.queryByText("仕事")).not.toBeInTheDocument();
      expect(screen.queryByText("重要")).not.toBeInTheDocument();
    });
  });

  describe("インライン編集", () => {
    it("ダブルクリックで編集モードに切り替わる", async () => {
      const user = userEvent.setup();
      render(<TodoItem todo={activeTodo} {...defaultProps} />);

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      const editInput = screen.getByTestId("edit-input");
      expect(editInput).toBeInTheDocument();
      expect(editInput).toHaveValue("未完了タスク");
    });

    it("Enterキーで編集を確定する", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <TodoItem todo={activeTodo} {...defaultProps} onUpdate={onUpdate} />
      );

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      const editInput = screen.getByTestId("edit-input");
      await user.clear(editInput);
      await user.type(editInput, "更新タスク{enter}");

      expect(onUpdate).toHaveBeenCalledWith("1", { text: "更新タスク" });
      expect(screen.queryByTestId("edit-input")).not.toBeInTheDocument();
    });

    it("Escapeキーで編集をキャンセルする", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <TodoItem todo={activeTodo} {...defaultProps} onUpdate={onUpdate} />
      );

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      const editInput = screen.getByTestId("edit-input");
      await user.clear(editInput);
      await user.type(editInput, "変更テキスト{escape}");

      expect(onUpdate).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-input")).not.toBeInTheDocument();
      expect(screen.getByText("未完了タスク")).toBeInTheDocument();
    });

    it("空文字での確定はテキストを変更しない", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <TodoItem todo={activeTodo} {...defaultProps} onUpdate={onUpdate} />
      );

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      const editInput = screen.getByTestId("edit-input");
      await user.clear(editInput);
      await user.keyboard("{enter}");

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("同じテキストでの確定はonUpdateを呼ばない", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <TodoItem todo={activeTodo} {...defaultProps} onUpdate={onUpdate} />
      );

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      screen.getByTestId("edit-input");
      await user.keyboard("{enter}");

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("blurで編集を確定する", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <TodoItem todo={activeTodo} {...defaultProps} onUpdate={onUpdate} />
      );

      const textElement = screen.getByText("未完了タスク");
      await user.dblClick(textElement);

      const editInput = screen.getByTestId("edit-input");
      await user.clear(editInput);
      await user.type(editInput, "blur確定テスト");
      await user.tab(); // triggers blur

      expect(onUpdate).toHaveBeenCalledWith("1", { text: "blur確定テスト" });
    });
  });
});
