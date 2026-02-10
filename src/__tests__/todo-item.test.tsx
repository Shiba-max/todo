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
};

const completedTodo: Todo = {
  id: "2",
  text: "完了タスク",
  completed: true,
  createdAt: "2025-01-01",
  completedAt: "2025-01-05",
};

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onUpdateCompletedAt: vi.fn(),
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

  it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem todo={activeTodo} {...defaultProps} onDelete={onDelete} />
    );

    // Trash button
    const deleteButton = screen.getByRole("button");
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith("1");
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
});
