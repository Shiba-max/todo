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
      expect.any(String),
      undefined
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

    expect(onAdd).toHaveBeenCalledWith("Enterタスク", expect.any(String), undefined);
  });

  describe("タグ入力", () => {
    it("タグ入力フィールドが表示される", () => {
      render(<TodoInput onAdd={vi.fn()} />);

      expect(screen.getByText("タグ")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("タグを入力してEnter...")
      ).toBeInTheDocument();
    });

    it("Enterでタグを追加できる", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事{enter}");

      expect(screen.getByText("仕事")).toBeInTheDocument();
    });

    it("カンマ区切りで複数タグを追加できる", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事,個人{enter}");

      expect(screen.getByText("仕事")).toBeInTheDocument();
      expect(screen.getByText("個人")).toBeInTheDocument();
    });

    it("重複するタグは追加されない", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事{enter}");
      await user.type(tagInput, "仕事{enter}");

      const badges = screen.getAllByText("仕事");
      expect(badges).toHaveLength(1);
    });

    it("タグを削除できる", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事{enter}");

      expect(screen.getByText("仕事")).toBeInTheDocument();

      const deleteButton = screen.getByLabelText('タグ「仕事」を削除');
      await user.click(deleteButton);

      expect(screen.queryByText("仕事")).not.toBeInTheDocument();
    });

    it("タグ付きで送信するとonAddにタグが渡される", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<TodoInput onAdd={onAdd} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事{enter}");
      await user.type(tagInput, "重要{enter}");

      const textInput = screen.getByPlaceholderText("新しいTODOを入力...");
      await user.type(textInput, "タグ付きタスク");
      await user.click(screen.getByRole("button", { name: /追加/ }));

      expect(onAdd).toHaveBeenCalledWith(
        "タグ付きタスク",
        expect.any(String),
        ["仕事", "重要"]
      );
    });

    it("送信後にタグがクリアされる", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.type(tagInput, "仕事{enter}");

      expect(screen.getByText("仕事")).toBeInTheDocument();

      const textInput = screen.getByPlaceholderText("新しいTODOを入力...");
      await user.type(textInput, "タスク");
      await user.click(screen.getByRole("button", { name: /追加/ }));

      expect(screen.queryByLabelText('タグ「仕事」を削除')).not.toBeInTheDocument();
    });

    it("空のタグ入力でEnterを押してもタグが追加されない", async () => {
      const user = userEvent.setup();
      render(<TodoInput onAdd={vi.fn()} />);

      const tagInput = screen.getByPlaceholderText("タグを入力してEnter...");
      await user.click(tagInput);
      await user.keyboard("{enter}");

      // No tag badges should appear
      expect(screen.queryByLabelText(/タグ「.*」を削除/)).not.toBeInTheDocument();
    });
  });
});
