import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoInput } from "@/components/todo-input";

describe("TodoInput", () => {
  it("入力フィールドと追加ボタンが表示される", () => {
    render(<TodoInput onAdd={vi.fn()} />);

    expect(
      screen.getByPlaceholderText("新しいTODOを入力...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /追加/ })).toBeInTheDocument();
  });

  it("日付入力フィールドが表示される", () => {
    render(<TodoInput onAdd={vi.fn()} />);

    expect(screen.getByText("登録日")).toBeInTheDocument();
    // date input exists
    const dateInput = screen.getByDisplayValue(
      new Date().toISOString().slice(0, 10)
    );
    expect(dateInput).toBeInTheDocument();
  });

  it("テキストを入力してフォーム送信でonAddが呼ばれる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "新しいタスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(onAdd).toHaveBeenCalledWith(
      "新しいタスク",
      expect.any(String)
    );
  });

  it("送信後にテキスト入力がクリアされる", async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "タスク");
    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(input).toHaveValue("");
  });

  it("空のテキストではonAddが呼ばれない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /追加/ }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("空のテキストでは追加ボタンが無効になる", () => {
    render(<TodoInput onAdd={vi.fn()} />);

    expect(screen.getByRole("button", { name: /追加/ })).toBeDisabled();
  });

  it("テキスト入力で追加ボタンが有効になる", async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "タスク");

    expect(screen.getByRole("button", { name: /追加/ })).toBeEnabled();
  });

  it("Enterキーでフォームを送信できる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("新しいTODOを入力...");
    await user.type(input, "Enterタスク{enter}");

    expect(onAdd).toHaveBeenCalledWith("Enterタスク", expect.any(String));
  });
});
