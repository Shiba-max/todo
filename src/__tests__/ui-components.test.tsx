import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

describe("Button", () => {
  it("テキストが表示される", () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole("button", { name: "クリック" })).toBeInTheDocument();
  });

  it("クリックイベントが発火する", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>クリック</Button>);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled状態で無効になる", () => {
    render(<Button disabled>無効</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("variant propに応じたdata属性が設定される", () => {
    render(<Button variant="destructive">削除</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "destructive"
    );
  });

  it("size propに応じたdata属性が設定される", () => {
    render(<Button size="sm">小さい</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });

  it("カスタムclassNameが適用される", () => {
    render(<Button className="custom-class">テスト</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });
});

describe("Input", () => {
  it("テキスト入力が可能", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="入力" />);

    const input = screen.getByPlaceholderText("入力");
    await user.type(input, "テスト");
    expect(input).toHaveValue("テスト");
  });

  it("type propが適用される", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("disabled状態で無効になる", () => {
    render(<Input disabled placeholder="無効" />);
    expect(screen.getByPlaceholderText("無効")).toBeDisabled();
  });

  it("data-slot属性がinputに設定される", () => {
    render(<Input placeholder="テスト" />);
    expect(screen.getByPlaceholderText("テスト")).toHaveAttribute(
      "data-slot",
      "input"
    );
  });
});

describe("Badge", () => {
  it("テキストが表示される", () => {
    render(<Badge>ラベル</Badge>);
    expect(screen.getByText("ラベル")).toBeInTheDocument();
  });

  it("デフォルトvariantのdata属性が設定される", () => {
    render(<Badge>デフォルト</Badge>);
    expect(screen.getByText("デフォルト")).toHaveAttribute(
      "data-variant",
      "default"
    );
  });

  it("secondary variantのdata属性が設定される", () => {
    render(<Badge variant="secondary">セカンダリ</Badge>);
    expect(screen.getByText("セカンダリ")).toHaveAttribute(
      "data-variant",
      "secondary"
    );
  });

  it("data-slot属性がbadgeに設定される", () => {
    render(<Badge>テスト</Badge>);
    expect(screen.getByText("テスト")).toHaveAttribute("data-slot", "badge");
  });
});

describe("Card", () => {
  it("Card全体が表示される", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
          <CardDescription>説明</CardDescription>
        </CardHeader>
        <CardContent>コンテンツ</CardContent>
        <CardFooter>フッター</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("説明")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ")).toBeInTheDocument();
    expect(screen.getByText("フッター")).toBeInTheDocument();
  });

  it("各サブコンポーネントに正しいdata-slotが設定される", () => {
    render(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">タイトル</CardTitle>
        </CardHeader>
        <CardContent data-testid="content">コンテンツ</CardContent>
        <CardFooter data-testid="footer">フッター</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-slot",
      "card-header"
    );
    expect(screen.getByTestId("title")).toHaveAttribute(
      "data-slot",
      "card-title"
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "card-content"
    );
    expect(screen.getByTestId("footer")).toHaveAttribute(
      "data-slot",
      "card-footer"
    );
  });
});

describe("Checkbox", () => {
  it("チェックボックスが表示される", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("初期状態で未チェック", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("checked=trueでチェック状態になる", () => {
    render(<Checkbox checked={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("クリックでonCheckedChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalled();
  });

  it("data-slot属性がcheckboxに設定される", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-slot",
      "checkbox"
    );
  });
});
